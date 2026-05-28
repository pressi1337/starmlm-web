// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { FileText, Save, Eye } from "lucide-react";
import toast from "react-hot-toast";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useActionCall, useGetCall } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Loader from "@/components/ui/Loader";

/**
 * Admin Terms & Conditions editor — single-document upsert with a WYSIWYG.
 *
 * Storage contract: a single `content` string field on the server (LONGTEXT).
 * Quill produces sanitized HTML; the PWA reader renders that HTML via
 * `dangerouslySetInnerHTML`. No format conversion anywhere — what the admin
 * sees in the editor is exactly what the user gets.
 *
 * Quill emits `<p><br></p>` for an empty document; we treat that as empty
 * when validating, so the admin can't accidentally save a blank doc.
 */

// Toolbar config — covers the formatting a T&C document realistically needs
// (headings for sections, bold/italic, lists, links, blockquote, indent,
// clear-formatting). Intentionally no image/video/code-block — they're
// rarely useful here and add noise.
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "blockquote"],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "indent",
  "link",
  "blockquote",
  "align",
];

// Quill's "empty" state — strip these to detect truly-blank content.
const isQuillEmpty = (html: string): boolean => {
  if (!html) return true;
  const stripped = html
    .replace(/<p><br><\/p>/g, "")
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
  return stripped.length === 0;
};

export default function TermsAndConditions() {
  const {
    data: tncData,
    loading: fetchLoading,
    fetchApi,
  } = useGetCall(SERVICE.TERMS_AND_CONDITIONS);

  const { Post: saveTnc, loading: saving } = useActionCall(
    SERVICE.TERMS_AND_CONDITIONS_UPSERT
  );

  const initialContent: string = tncData?.data?.content ?? "";
  const [content, setContent] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const isDirty = useMemo(() => content !== initialContent, [content, initialContent]);
  const isEmpty = useMemo(() => isQuillEmpty(content), [content]);

  const handleSave = async () => {
    if (isEmpty) {
      toast.error("Content cannot be empty");
      return;
    }
    const resp = await saveTnc({ content }, "Terms & Conditions saved");
    if (resp) {
      fetchApi({});
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-gray-600">
            Single document shown to users below the Support &amp; Help menu in
            the app. Use the toolbar to format sections, lists, and emphasis —
            no HTML knowledge required.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
          >
            <Eye className="w-4 h-4 mr-1.5" />
            {showPreview ? "Hide Preview" : "Preview"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty || isEmpty}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {fetchLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <Loader />
        </div>
      ) : (
        <div className={`grid ${showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-6`}>
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">Editor</h3>
            </div>
            <div className="quill-wrapper">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={QUILL_MODULES}
                formats={QUILL_FORMATS}
                placeholder="Type your Terms & Conditions here. Use the toolbar above for formatting."
              />
            </div>
          </div>

          {showPreview && (
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700">
                  Preview <span className="text-gray-500 font-normal">(what users see)</span>
                </h3>
              </div>
              <div
                className="px-5 py-4 text-sm text-gray-800 leading-relaxed whitespace-pre-line break-words ql-editor"
                style={{ minHeight: 400 }}
                dangerouslySetInnerHTML={{
                  __html: isEmpty
                    ? "<em class='text-gray-400'>Nothing to preview yet.</em>"
                    : content,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Local style overrides so the Quill editor blends with the rest of
          the admin UI (rounded corners, sensible min height, no double-border). */}
      <style>{`
        .quill-wrapper .ql-toolbar.ql-snow {
          border: 0;
          border-bottom: 1px solid #e5e7eb;
          background: #fafafa;
        }
        .quill-wrapper .ql-container.ql-snow {
          border: 0;
          min-height: 420px;
          font-size: 14px;
        }
        .quill-wrapper .ql-editor {
          min-height: 420px;
        }
      `}</style>
    </div>
  );
}
