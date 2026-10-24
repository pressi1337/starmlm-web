import { useRef, useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import Lib from "@/utils/Lib";
import { uploadFileInChunks } from "@/utils/chunkedUpload";
import {
  fileTypeIcon,
  typeFromName,
  isBlockedFileName,
} from "@/constants/fileTypes";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL ?? "";

export type UploadedFile = {
  /** Stored name on the server: "{uuid}_{original}". */
  file_path: string;
  /** The name the user picked — what a download is named. */
  original_name: string;
};

const iconFor = (name: string) => fileTypeIcon(typeFromName(name));

/**
 * Multi-file uploader for document SETS.
 *
 * Uploads each chosen file through the same chunked `upload` endpoint the
 * single-file component uses, then reports the whole set back through
 * onChange as an array of { file_path, original_name }. Keeping the original
 * name here is the whole point — the server stores files as "{uuid}_{name}",
 * and that prefix must never reach the user on download.
 *
 * Files accumulate: picking more adds to the set rather than replacing it,
 * so a 10-document set can be built up in several goes.
 */
export default function MultiFileUpload({
  name = "files",
  value = {} as any,
  error = {} as any,
  onChange = (_e: any) => {},
  setLoading = (_b: boolean) => {},
  accept = "",
  maxMb = 0,
  title = "Documents",
  helpText = "",
}: any) {
  const files: UploadedFile[] = Array.isArray(value?.[name]) ? value[name] : [];
  const fileRef: any = useRef();
  const [busy, setBusy] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");
  const [uploadError, setUploadError] = useState("");

  const emit = (next: UploadedFile[]) =>
    onChange({ target: { name, value: next } });

  /** Upload one file in chunks; resolves to its stored name. */
  const uploadOne = async (raw: File, onPct: (pct: number) => void) => {
    // Shared with the single-file uploader: 8 MB chunks, several in flight at
    // once, with retries. This was a sequential 1 MB loop, which on a
    // multi-file pick meant round-trip overhead stacked up per file.
    const { storedFilename } = await uploadFileInChunks({
      file: raw,
      baseUrl: VITE_BASE_URL,
      token: Lib.getCookies("session-token"),
      onProgress: onPct,
    });

    return storedFilename;
  };

  const handlePick = async (e: any) => {
    const picked: File[] = Array.from(e.target.files ?? []);
    if (!picked.length) return;

    setUploadError("");

    const problems: string[] = [];

    // Refused server-side too; caught here so the user finds out immediately
    // rather than after uploading a large file.
    const blocked = picked.filter((f) => isBlockedFileName(f.name));
    if (blocked.length) {
      problems.push(
        `${blocked.map((f) => f.name).join(", ")} — this file type can't be uploaded.`
      );
    }

    const tooBig = picked.filter(
      (f) => maxMb > 0 && f.size / (1024 * 1024) > maxMb
    );
    if (tooBig.length) {
      // Show "2 GB" rather than "2048 MB".
      const limit =
        maxMb >= 1024 ? `${+(maxMb / 1024).toFixed(1)} GB` : `${maxMb} MB`;
      problems.push(
        `${tooBig.map((f) => f.name).join(", ")} — too large (max ${limit} each).`
      );
    }

    if (problems.length) setUploadError(problems.join(" "));

    const queue = picked.filter(
      (f) => !tooBig.includes(f) && !blocked.includes(f)
    );
    if (!queue.length) {
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setBusy(true);
    setLoading(true);

    // Build on a local copy so several uploads in one pick can't clobber
    // each other through a stale closure over `files`.
    const collected: UploadedFile[] = [...files];
    try {
      for (let idx = 0; idx < queue.length; idx++) {
        const raw = queue[idx];
        setProgressLabel(`Uploading ${idx + 1} of ${queue.length}: ${raw.name}`);
        const stored = await uploadOne(raw, (pct) =>
          setProgressLabel(
            `Uploading ${idx + 1} of ${queue.length}: ${raw.name} (${pct}%)`
          )
        );
        if (stored) {
          collected.push({ file_path: stored, original_name: raw.name });
          emit([...collected]);
        }
      }
    } catch {
      setUploadError("Upload failed, please try again.");
    } finally {
      setBusy(false);
      setLoading(false);
      setProgressLabel("");
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeAt = (index: number) =>
    emit(files.filter((_, i) => i !== index));

  const fieldError = error?.[name];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {title}
      </label>

      <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg">
        <Upload className="w-5 h-5 text-gray-400" />
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">
            Add files
          </label>
          {helpText ? <p className="text-xs text-gray-500">{helpText}</p> : null}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={accept}
            disabled={busy}
            onChange={handlePick}
            className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
        </div>
      </div>

      {busy && progressLabel ? (
        <p className="mt-2 text-xs text-blue-700">{progressLabel}</p>
      ) : null}

      {uploadError ? (
        <p className="mt-2 text-xs text-red-600">{uploadError}</p>
      ) : null}

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-gray-500">
            {files.length} file{files.length > 1 ? "s" : ""} attached
          </p>
          {files.map((file, index) => {
            const { Icon, cls } = iconFor(file.original_name);
            return (
              <div
                key={`${file.file_path}-${index}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <div className="flex items-center min-w-0">
                  <span className={`w-7 h-7 rounded-md flex items-center justify-center mr-2 shrink-0 ${cls}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="truncate text-sm text-gray-800">
                    {file.original_name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="ml-3 shrink-0 text-red-600 hover:text-red-800 p-1"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {fieldError ? (
        <p className="mt-2 text-sm text-red-600">{fieldError}</p>
      ) : null}
    </div>
  );
}
