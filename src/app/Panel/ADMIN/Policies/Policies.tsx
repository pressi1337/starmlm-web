// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Save, Eye, ExternalLink, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useActionCall, useGetCall } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Loader from "@/components/ui/Loader";

/**
 * Admin editor for the public policy documents — Privacy, Refund &
 * Cancellation, Shipping & Delivery, Contact Us.
 *
 * Same storage contract as the Terms editor: one `content` HTML string per
 * document, written by Quill and rendered as-is by the website and the app.
 * Payment gateways read these pages during onboarding, so each document also
 * has a published switch and a link to its live public URL.
 *
 * The seeded drafts contain "[TO CONFIRM …]" markers wherever a business
 * decision is needed; this screen flags any document that still has one.
 */

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
  "header", "bold", "italic", "underline", "strike",
  "list", "bullet", "indent", "link", "blockquote", "align",
];

const isQuillEmpty = (html: string): boolean => {
  if (!html) return true;
  return html
    .replace(/<p><br><\/p>/g, "")
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/<[^>]+>/g, "")
    .trim().length === 0;
};

export default function Policies() {
  const { data, loading: fetchLoading, fetchApi } = useGetCall(SERVICE.POLICIES_ADMIN);
  const { Post: savePolicy, loading: saving } = useActionCall(SERVICE.POLICIES_UPSERT);

  const pages = data?.data ?? [];
  const [slug, setSlug] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Select the first document once loaded, and keep the editor in sync when
  // the admin switches between documents.
  useEffect(() => {
    if (!slug && pages.length) setSlug(pages[0].slug);
  }, [pages, slug]);

  const current = useMemo(() => pages.find((p: any) => p.slug === slug), [pages, slug]);

  useEffect(() => {
    setContent(current?.content ?? "");
  }, [current?.slug, current?.content]);

  const isDirty = content !== (current?.content ?? "");
  const isEmpty = isQuillEmpty(content);
  const unresolved = (content.match(/\[TO CONFIRM[^\]]*\]/g) || []).length;

  const handleSave = async (publish?: boolean) => {
    if (isEmpty) {
      toast.error("Content cannot be empty");
      return;
    }
    const resp = await savePolicy(
      {
        slug: current.slug,
        title: current.title,
        content,
        is_active: publish === undefined ? current.is_active : publish ? 1 : 0,
      },
      `${current.title} saved`
    );
    if (resp) fetchApi({});
  };

  if (fetchLoading && !pages.length) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-emerald-600" />
          Policies
        </h1>
        <p className="mt-2 text-gray-600">
          Public documents shown on the website and inside the app. Payment gateways read these during onboarding, so
          they must be published and accurate.
        </p>
      </div>

      {/* Document tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {pages.map((p: any) => {
          const pending = (p.content?.match(/\[TO CONFIRM/g) || []).length;
          return (
            <button
              key={p.slug}
              onClick={() => setSlug(p.slug)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                p.slug === slug
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {p.title}
              {pending > 0 && (
                <span className={`ml-2 text-xs ${p.slug === slug ? "text-amber-100" : "text-amber-600"}`}>
                  {pending} to confirm
                </span>
              )}
            </button>
          );
        })}
      </div>

      {current && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 text-sm">
              <span
                className={`px-2.5 py-1 rounded-full font-semibold ${
                  current.is_active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
                }`}
              >
                {current.is_active ? "Published" : "Unpublished"}
              </span>
              <a
                href={`/${current.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                View public page <ExternalLink className="w-3.5 h-3.5" />
              </a>
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
              {current.is_active ? (
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Unpublish
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving || isEmpty}
                  className="px-3 py-2 text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                >
                  Publish
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving || !isDirty || isEmpty}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-1.5" />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {unresolved > 0 && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                This document still has <b>{unresolved}</b> “[TO CONFIRM …]” marker{unresolved > 1 ? "s" : ""}. Replace
                them with your real details before sending the page to the payment gateway.
              </span>
            </div>
          )}

          <div className={`grid ${showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-6`}>
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700">Editor — {current.title}</h3>
              </div>
              <div className="quill-wrapper">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                  placeholder="Write the policy here."
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
                  className="px-5 py-4 text-sm text-gray-800 leading-relaxed break-words ql-editor"
                  style={{ minHeight: 400 }}
                  dangerouslySetInnerHTML={{
                    __html: isEmpty ? "<em class='text-gray-400'>Nothing to preview yet.</em>" : content,
                  }}
                />
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        .quill-wrapper .ql-toolbar.ql-snow { border: 0; border-bottom: 1px solid #e5e7eb; background: #fafafa; }
        .quill-wrapper .ql-container.ql-snow { border: 0; min-height: 420px; font-size: 14px; }
        .quill-wrapper .ql-editor { min-height: 420px; }
      `}</style>
    </div>
  );
}
