import { useEffect, useState } from "react";
import {
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Sheet,
  Archive,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { downloadFromApi, fetchBlobUrl } from "@/utils/download";

const FILE_TYPE_PDF = 2;
const FILE_TYPE_EXCEL = 3;

const typeIcon = (fileType: number) => {
  if (Number(fileType) === FILE_TYPE_PDF)
    return { Icon: FileText, cls: "bg-red-50 text-red-600" };
  if (Number(fileType) === FILE_TYPE_EXCEL)
    return { Icon: Sheet, cls: "bg-emerald-50 text-emerald-600" };
  return { Icon: ImageIcon, cls: "bg-blue-50 text-blue-600" };
};

const isImage = (fileType: number) =>
  Number(fileType) !== FILE_TYPE_PDF && Number(fileType) !== FILE_TYPE_EXCEL;

const viewPath = (docId: number, fileId: number) =>
  `company-personal-documents/${docId}/files/${fileId}/view`;

/**
 * Image thumbnail for a file that is NOT publicly reachable.
 *
 * A plain <img src> can't be used: the file only comes back with an
 * Authorization header, so we fetch it and render a blob URL — revoked on
 * unmount so closing the modal doesn't leak the blobs.
 */
function SecureThumb({
  docId,
  file,
}: {
  docId: number;
  file: any;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let revoked = false;
    let objectUrl: string | null = null;

    fetchBlobUrl(viewPath(docId, file.id))
      .then((u) => {
        objectUrl = u;
        // The modal may have closed while the fetch was in flight.
        if (revoked) {
          URL.revokeObjectURL(u);
          return;
        }
        setUrl(u);
      })
      .catch(() => setFailed(true));

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [docId, file.id]);

  if (failed) {
    const { Icon, cls } = typeIcon(file.file_type);
    return (
      <span className={`w-14 h-14 rounded-xl flex items-center justify-center ${cls}`}>
        <Icon className="w-7 h-7" />
      </span>
    );
  }

  if (!url) {
    return <span className="text-xs text-gray-400">Loading…</span>;
  }

  return (
    <img
      src={url}
      alt={file.original_name}
      className="h-full w-full object-cover"
    />
  );
}

/**
 * Card view of every file in a document set, with a download per file and a
 * "Download all" that streams the whole set as one zip.
 *
 * Every file — preview, open and download alike — is fetched through the
 * authenticated API. These are internal documents, so nothing here points at
 * a public storage URL.
 */
export default function DocumentFilesModal({
  document: doc,
  onClose = () => {},
}: {
  document: any;
  onClose?: () => void;
}) {
  const files: any[] = Array.isArray(doc?.files) ? doc.files : [];
  const [busyId, setBusyId] = useState<number | string | null>(null);

  const downloadOne = async (file: any) => {
    setBusyId(file.id);
    try {
      await downloadFromApi(
        `company-personal-documents/${doc.id}/files/${file.id}/download`,
        file.original_name
      );
    } catch (e: any) {
      toast.error(e?.message || "Could not download this file");
    } finally {
      setBusyId(null);
    }
  };

  const downloadAll = async () => {
    setBusyId("all");
    try {
      await downloadFromApi(
        `company-personal-documents/${doc.id}/download-all`,
        `${doc.title || "documents"}.zip`
      );
    } catch (e: any) {
      toast.error(e?.message || "Could not build the archive");
    } finally {
      setBusyId(null);
    }
  };

  const openInTab = async (file: any) => {
    // The tab must be opened synchronously on the click, before the await —
    // a popup opened after an async gap gets blocked.
    const tab = window.open("", "_blank");
    try {
      const url = await fetchBlobUrl(viewPath(doc.id, file.id));
      if (tab) {
        tab.location.href = url;
      } else {
        toast.error("Allow pop-ups to open documents in a new tab");
        URL.revokeObjectURL(url);
      }
    } catch (e: any) {
      tab?.close();
      toast.error(e?.message || "Could not open this file");
    }
  };

  return (
    <Modal title={doc?.title || "Documents"} modalSize="lg" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-gray-600">
            {files.length} file{files.length === 1 ? "" : "s"} in this set
            {doc?.remark ? (
              <span className="block text-xs text-gray-500 mt-0.5">
                {doc.remark}
              </span>
            ) : null}
          </div>

          {files.length > 0 && (
            <button
              type="button"
              onClick={downloadAll}
              disabled={busyId !== null}
              className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
            >
              <Archive className="w-4 h-4 mr-2" />
              {busyId === "all" ? "Preparing zip…" : "Download all (.zip)"}
            </button>
          )}
        </div>

        {files.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">
            This document has no files.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file: any) => {
              const { Icon, cls } = typeIcon(file.file_type);
              return (
                <div
                  key={file.id}
                  className="rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col"
                >
                  <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {isImage(file.file_type) ? (
                      <SecureThumb docId={doc.id} file={file} />
                    ) : (
                      <span
                        className={`w-14 h-14 rounded-xl flex items-center justify-center ${cls}`}
                      >
                        <Icon className="w-7 h-7" />
                      </span>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col">
                    <p
                      className="text-sm font-medium text-gray-900 break-words"
                      title={file.original_name}
                    >
                      {file.original_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {file.type_label}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => downloadOne(file)}
                        disabled={busyId !== null}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        {busyId === file.id ? "…" : "Download"}
                      </button>
                      <button
                        type="button"
                        onClick={() => openInTab(file)}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Open
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
