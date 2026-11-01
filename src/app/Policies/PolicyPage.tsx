import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BASE_URL } from "@/constants/services";
import logo from "@/assets/logo.png";

/**
 * Public policy page — Privacy, Refund & Cancellation, Shipping, Contact.
 *
 * Deliberately reachable WITHOUT logging in: payment gateways check these
 * during onboarding, and users must be able to read them before registering.
 * The content is the same document the admin edits and the app renders.
 */

type Doc = { title: string; content: string; updated_at?: string };

// Slug → API path. All four documents come from policy_pages. Terms &
// Conditions is deliberately NOT published here — it is shown inside the
// app only, where the promoter flow asks the user to accept it.
const SOURCES: Record<string, { path: string; fallbackTitle: string }> = {
  "privacy-policy": { path: "policies/privacy-policy", fallbackTitle: "Privacy Policy" },
  "refund-policy": { path: "policies/refund-policy", fallbackTitle: "Refund & Cancellation Policy" },
  "shipping-policy": { path: "policies/shipping-policy", fallbackTitle: "Shipping & Delivery Policy" },
  "contact-us": { path: "policies/contact-us", fallbackTitle: "Contact Us" },
};

export default function PolicyPage() {
  // Each policy is mounted at its own literal path (/privacy-policy, …),
  // so the slug is the first segment of the URL.
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
  const source = SOURCES[slug];

  const [doc, setDoc] = useState<Doc | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");

  useEffect(() => {
    if (!source) {
      setState("missing");
      return;
    }
    let cancelled = false;
    setState("loading");

    fetch(`${BASE_URL}${source.path}`)
      .then(async (r) => {
        if (r.status === 404) throw new Error("missing");
        if (!r.ok) throw new Error("error");
        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        const data = json?.data;
        if (!data?.content) {
          setState("missing");
          return;
        }
        setDoc({ title: data.title || source.fallbackTitle, content: data.content, updated_at: data.updated_at });
        setState("ready");
      })
      .catch((e) => {
        if (!cancelled) setState(e.message === "missing" ? "missing" : "error");
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Starup" className="w-9 h-9" />
            <span className="font-bold text-gray-900">Starup</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
          {state === "loading" && <p className="text-gray-500">Loading…</p>}

          {state === "missing" && (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Policy not available</h1>
              <p className="mt-3 text-gray-600">
                This policy has not been published yet. Please contact us and we will share it with you.
              </p>
            </>
          )}

          {state === "error" && (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Could not load this page</h1>
              <p className="mt-3 text-gray-600">Please check your connection and try again.</p>
            </>
          )}

          {state === "ready" && doc && (
            <>
              <h1 className="text-3xl font-bold text-gray-900">{doc.title}</h1>
              {doc.updated_at && (
                <p className="mt-2 text-sm text-gray-500">
                  Last updated {new Date(doc.updated_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              )}
              <div
                className="policy-content mt-6 text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: doc.content }}
              />
            </>
          )}
        </div>

        <nav className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
          {Object.entries(SOURCES).map(([s, v]) => (
            <Link key={s} to={`/${s}`} className={s === slug ? "font-semibold text-gray-900" : "hover:text-gray-900"}>
              {v.fallbackTitle}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
