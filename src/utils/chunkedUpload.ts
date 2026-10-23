/**
 * Chunked video upload.
 *
 * WHY THIS EXISTS
 * ---------------
 * The three upload components each had their own copy of the same loop:
 * 1 MB chunks sent strictly one at a time with `await` inside a `for`. Every
 * chunk is a separate HTTPS request that pays the full round trip plus Laravel
 * boot and JWT auth — measured at roughly a quarter of a second each against
 * the live API, before any real work. A 500 MB video is 500 of those, so the
 * admin waited minutes for overhead rather than for bandwidth.
 *
 * The fix is to stop waiting: several chunks go up at once, so the round trips
 * overlap instead of queueing behind one another, and each chunk carries more
 * data so there are fewer of them.
 *
 * IT SIZES ITSELF TO THE SERVER — NO SERVER CHANGES NEEDED
 * --------------------------------------------------------
 * How big a chunk may be is the server's decision, and it is not discoverable
 * up front. The live API measured at nginx `client_max_body_size 8M`, while
 * PHP's own `upload_max_filesize` (default 2M) sits behind it and is invisible
 * from outside. Guessing wrong breaks every upload.
 *
 * So the first chunk is sent on its own as a probe. If the server refuses it
 * for being too large, the chunk size is halved and the upload starts again —
 * and because only that one chunk had been sent, a retry costs a single round
 * trip. Whatever the server actually permits, the upload completes; raise the
 * server limits later and it automatically uses the bigger chunks.
 *
 * Two different refusals mean "too large", and both are handled:
 *   • 413 — nginx rejected the body before PHP ever saw it;
 *   • 422 naming the upload fields — PHP silently discarded the multipart body
 *     for exceeding upload_max_filesize / post_max_size, so the fields arrive
 *     empty and validation fails.
 *
 * THE LAST CHUNK IS SENT ALONE, DELIBERATELY
 * ------------------------------------------
 * The server merges the parts as soon as it sees them all present, and returns
 * the stored filename from that request. If the final two chunks were in
 * flight together, two requests could both see a complete set and race to
 * merge. So every chunk between the first and the last goes up in parallel,
 * and only once they have all landed is the last one sent on its own. Exactly
 * one request ever completes the set, so exactly one merge happens and one
 * response carries the stored filename. (The server also takes a lock, as
 * defence in depth.)
 */

const envNumber = (raw: unknown, fallback: number, min: number, max: number) => {
  const n = Number(raw);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
};

/**
 * Where the probe starts, 4 MB by default.
 *
 * Chosen to sit well under the 8 MB nginx limit measured on the live API while
 * still cutting request count fourfold. If the server turns out to allow less,
 * the probe halves this automatically — so this is a starting point, not a
 * requirement. Override with VITE_UPLOAD_CHUNK_MB.
 */
export const CHUNK_SIZE =
  envNumber(import.meta.env?.VITE_UPLOAD_CHUNK_MB, 4, 1, 64) * 1024 * 1024;

/** The probe will not shrink below this; under it, overhead dominates again. */
export const MIN_CHUNK_SIZE = 512 * 1024;

/**
 * Chunks in flight at once. The API is HTTP/1.1, where browsers allow about
 * six connections per host — going higher just queues them in the browser.
 * Raise this once HTTP/2 is enabled on nginx.
 */
export const UPLOAD_CONCURRENCY = envNumber(
  import.meta.env?.VITE_UPLOAD_CONCURRENCY,
  6,
  1,
  16
);

/** A dropped chunk on mobile data is normal; retry before failing the upload. */
const MAX_RETRIES = 3;

export type ChunkedUploadResult = {
  /** The name the file was stored under — what gets saved to the record. */
  storedFilename: string;
  storedPath?: string;
  /** The chunk size the upload actually settled on, in bytes. */
  chunkSizeUsed: number;
};

export type ChunkedUploadOptions = {
  file: File;
  /** VITE_BASE_URL, already ending in a slash. */
  baseUrl: string;
  token: string;
  /** Called with 0..100. Driven by bytes, not chunk index — chunks finish out of order. */
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
  chunkSize?: number;
  concurrency?: number;
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const mb = (bytes: number) => Math.round((bytes / (1024 * 1024)) * 10) / 10;

/** Thrown when the server refuses a chunk purely for its size. */
class ChunkTooLargeError extends Error {
  constructor(
    public readonly status: number,
    public readonly attemptedChunkSize: number
  ) {
    super(
      `The server refused a ${mb(attemptedChunkSize)} MB chunk (HTTP ${status})`
    );
    this.name = "ChunkTooLargeError";
  }
}

/**
 * Does this 422 mean PHP threw the body away for being too big?
 *
 * When upload_max_filesize or post_max_size is exceeded, PHP does not return
 * an error — it drops the parsed body, so the controller sees no file and no
 * fields and fails validation on them. That is indistinguishable from a
 * genuinely malformed request except that we know we sent them.
 */
const looksLikeDiscardedBody = (body: string) => {
  const fields = ["videofile", "filename", "chunkIndex", "totalChunks"];
  return fields.some((f) => body.includes(f));
};

export async function uploadFileInChunks(
  options: ChunkedUploadOptions
): Promise<ChunkedUploadResult> {
  // An explicit chunkSize is honoured as given. The floor only bounds how far
  // the automatic halving may go, so it must never raise a size the caller
  // deliberately asked for.
  let chunkSize = options.chunkSize ?? CHUNK_SIZE;
  const floor = Math.min(MIN_CHUNK_SIZE, chunkSize);

  // Shrink and start over while the server says the chunk is too large. Only
  // the probe chunk has been sent when that happens, so each pass costs one
  // round trip rather than a re-upload.
  for (;;) {
    try {
      return await attemptUpload(options, chunkSize);
    } catch (err) {
      const tooLarge = err instanceof ChunkTooLargeError;
      if (!tooLarge || chunkSize <= floor) {
        if (tooLarge) {
          throw new Error(
            `The server will not accept uploads even at ${mb(chunkSize)} MB per chunk ` +
              `(HTTP ${(err as ChunkTooLargeError).status}). Its upload size limit is ` +
              `set lower than this app can work with — nginx client_max_body_size ` +
              `and PHP upload_max_filesize / post_max_size need raising.`
          );
        }
        throw err;
      }
      chunkSize = Math.max(floor, Math.floor(chunkSize / 2));
    }
  }
}

async function attemptUpload(
  {
    file,
    baseUrl,
    token,
    onProgress,
    signal,
    concurrency = UPLOAD_CONCURRENCY,
  }: ChunkedUploadOptions,
  chunkSize: number
): Promise<ChunkedUploadResult> {
  const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize));

  // Progress is reported from bytes actually acknowledged, so the bar cannot
  // run ahead of the upload when chunks complete out of order.
  let uploadedBytes = 0;
  const reportProgress = () => {
    if (!onProgress) return;
    const pct = file.size > 0 ? (uploadedBytes / file.size) * 100 : 100;
    // Hold at 99 until the merge response lands, so the bar never shows 100
    // while the server is still assembling the file.
    onProgress(Math.min(99, Math.round(pct)));
  };

  /**
   * @param isProbe the first chunk of a fresh attempt. Only there do we treat
   *   a size refusal as a reason to re-chunk: later chunks are the same size
   *   or smaller, so one of them failing on size would mean the server changed
   *   its limit mid-upload, and restarting would be the wrong response.
   */
  const sendChunk = async (index: number, isProbe = false): Promise<any> => {
    const start = index * chunkSize;
    const end = Math.min(file.size, start + chunkSize);
    const blob = file.slice(start, end);

    let lastError: unknown = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

      try {
        const formData = new FormData();
        formData.append("videofile", blob);
        formData.append("filename", file.name);
        formData.append("chunkIndex", String(index));
        formData.append("totalChunks", String(totalChunks));

        const response = await fetch(`${baseUrl}upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
          signal,
        });

        if (response.ok) {
          uploadedBytes += end - start;
          reportProgress();
          return await response.json().catch(() => ({}));
        }

        const body = await response.text().catch(() => "");

        // Too large? Hand that back so the caller can halve and retry.
        const refusedForSize =
          response.status === 413 ||
          (response.status === 422 && looksLikeDiscardedBody(body));
        if (refusedForSize && isProbe) {
          throw new ChunkTooLargeError(response.status, chunkSize);
        }

        // 4xx is our own fault (bad token, too large) and will not fix
        // itself, so fail fast instead of retrying three more times.
        // 5xx and 408/429 are worth another go.
        const retryable =
          response.status >= 500 ||
          response.status === 408 ||
          response.status === 429;

        const message = refusedForSize
          ? `The server refused a ${mb(chunkSize)} MB chunk (HTTP ${response.status}). ` +
            `Raise nginx client_max_body_size and PHP post_max_size above the chunk ` +
            `size, or lower VITE_UPLOAD_CHUNK_MB.`
          : `Chunk ${index + 1}/${totalChunks} failed (${response.status}) ${body.slice(0, 200)}`;

        const err: any = new Error(message);
        if (!retryable) {
          // Tagged rather than thrown straight from here: the catch below
          // has to be able to tell this apart from a network blip, or it
          // would swallow it and retry a request that can never succeed.
          err.noRetry = true;
        }
        lastError = err;
        if (err.noRetry) throw err;
      } catch (err: any) {
        // Aborted, a permanent status, or a size refusal we want the caller to
        // act on — retrying any of these is pointless.
        if (
          err?.name === "AbortError" ||
          err?.noRetry ||
          err instanceof ChunkTooLargeError
        ) {
          throw err;
        }
        lastError = err;
      }

      // Back off a little before retrying so a brief drop has time to recover.
      if (attempt < MAX_RETRIES) await sleep(500 * (attempt + 1));
    }

    throw lastError instanceof Error
      ? lastError
      : new Error(`Chunk ${index + 1}/${totalChunks} failed`);
  };

  const finish = (response: any): ChunkedUploadResult => {
    if (response?.status !== "merged" || !response?.stored_filename) {
      throw new Error(
        response?.message || "Upload finished but the server did not confirm it"
      );
    }
    onProgress?.(100);
    return {
      storedFilename: response.stored_filename,
      storedPath: response.stored_path,
      chunkSizeUsed: chunkSize,
    };
  };

  // --- phase 0: the first chunk alone, to prove the size is accepted -------
  // It has to be sent anyway, so this costs no extra request — only the
  // parallelism of this one chunk, in exchange for never failing on size.
  const first = await sendChunk(0, true);
  if (totalChunks === 1) {
    return finish(first);
  }

  // --- phase 1: the middle chunks, in parallel ----------------------------
  const parallelFrom = 1;
  const parallelTo = totalChunks - 1; // exclusive: the last is sent on its own
  if (parallelTo > parallelFrom) {
    let next = parallelFrom;
    const worker = async () => {
      for (;;) {
        const index = next++;
        if (index >= parallelTo) return;
        await sendChunk(index);
      }
    };
    // Promise.all rejects on the first failure, which is what we want: one
    // chunk that cannot be delivered means the upload cannot complete.
    await Promise.all(
      Array.from(
        { length: Math.min(concurrency, parallelTo - parallelFrom) },
        worker
      )
    );
  }

  // --- phase 2: the last chunk alone, which triggers the merge ------------
  return finish(await sendChunk(totalChunks - 1));
}
