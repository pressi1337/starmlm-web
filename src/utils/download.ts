import Lib from "@/utils/Lib";

const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";

/**
 * Pull a file from an authenticated API endpoint and save it locally.
 *
 * A plain <a href> can't be used here: these endpoints sit behind the JWT
 * guard, so the request needs an Authorization header. We fetch the bytes,
 * wrap them in a blob URL and click a synthetic link.
 *
 * `filename` is supplied by the caller rather than parsed out of
 * Content-Disposition — that header is not exposed to JS across origins
 * unless the server allow-lists it, and the caller already knows the name.
 */
async function fetchFileBlob(path: string): Promise<Blob> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${Lib.getCookies("session-token") ?? ""}`,
    },
  });

  if (!response.ok) {
    // The API reports failures as JSON even on a file route.
    let message = "Download failed";
    try {
      const body = await response.json();
      message = body?.message || message;
    } catch {
      /* not JSON — keep the generic message */
    }
    throw new Error(message);
  }

  return response.blob();
}

/**
 * Fetch an authenticated file and hand back a temporary blob URL for it —
 * used for previewing files that are NOT publicly reachable.
 *
 * The caller owns the returned URL and must URL.revokeObjectURL() it when the
 * element goes away, otherwise the blob is pinned in memory for the life of
 * the page.
 */
export async function fetchBlobUrl(path: string): Promise<string> {
  const blob = await fetchFileBlob(path);
  return URL.createObjectURL(blob);
}

export async function downloadFromApi(
  path: string,
  filename: string
): Promise<void> {
  const blob = await fetchFileBlob(path);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename || "download";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoking immediately can cancel the save in some browsers; give it a tick.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
