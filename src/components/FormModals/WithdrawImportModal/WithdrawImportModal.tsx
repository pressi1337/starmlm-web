import React, { useState } from "react";
import {
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { BASE_URL, SERVICE } from "@/constants/services";
import Lib from "@/utils/Lib";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful apply so the list can refetch. */
  onApplied: () => void;
};

type Row = {
  row_number: number;
  request_id: number | string;
  username: string | null;
  amount: number | null;
  current_status: string | null;
  new_status: string;
  reason: string;
  issues: string[];
  action: "update" | "unchanged" | "error";
};

type Result = {
  rows: Row[];
  summary: { total: number; ready: number; unchanged: number; errors: number };
  can_confirm: boolean;
};

const STEP_UPLOAD = 1;
const STEP_REVIEW = 2;
const STEP_DONE = 3;

export default function WithdrawImportModal({
  isOpen,
  onClose,
  onApplied,
}: Props) {
  const [step, setStep] = useState(STEP_UPLOAD);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [applied, setApplied] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setStep(STEP_UPLOAD);
    setFile(null);
    setResult(null);
    setApplied(0);
    setError(null);
    setLoading(false);
  };

  const closeAndReset = () => {
    reset();
    onClose();
  };

  /**
   * The file is posted for BOTH steps. Confirm re-reads and re-checks it
   * server-side rather than trusting the verdict shown here, so a request
   * whose status changed in between is caught instead of overwritten.
   */
  const send = async (service: string): Promise<any | null> => {
    if (!file) return null;
    setLoading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch(`${BASE_URL}${service}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${Lib.getCookies("session-token") ?? ""}`,
        },
        body,
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        // A 422 carrying rows is a validation verdict, not a failure —
        // show the offending rows rather than a bare message.
        if (json?.rows) {
          setResult(json as Result);
          setStep(STEP_REVIEW);
        }
        setError(
          json?.message ||
            json?.errors?.file?.[0] ||
            "That file could not be processed."
        );
        return null;
      }

      return json;
    } catch (e: any) {
      setError(e?.message || "Network error. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    const json = await send(SERVICE.WITHDRAW_IMPORT_VALIDATE);
    if (json?.success) {
      setResult(json as Result);
      setStep(STEP_REVIEW);
    }
  };

  const handleConfirm = async () => {
    const json = await send(SERVICE.WITHDRAW_IMPORT_CONFIRM);
    if (json?.success) {
      setApplied(json.applied ?? 0);
      setStep(STEP_DONE);
      onApplied();
    }
  };

  const stepLabel = ["Upload file", "Check & fix", "Done"];

  const rowTone = (action: Row["action"]) =>
    action === "error"
      ? "bg-red-50"
      : action === "unchanged"
      ? "bg-gray-50"
      : "bg-green-50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Update Withdraw Status from Excel
            </h2>
            <div className="flex items-center gap-2 mt-2">
              {stepLabel.map((label, i) => {
                const n = i + 1;
                const done = step > n;
                const active = step === n;
                return (
                  <React.Fragment key={label}>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        active
                          ? "text-blue-700"
                          : done
                          ? "text-green-700"
                          : "text-gray-400"
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
                          active
                            ? "bg-blue-600 text-white"
                            : done
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {done ? "✓" : n}
                      </span>
                      {label}
                    </span>
                    {n < stepLabel.length && (
                      <span className="w-6 h-px bg-gray-300" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <button
            onClick={closeAndReset}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 py-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {step === STEP_UPLOAD && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded text-sm text-blue-900">
                <p className="font-semibold mb-1">How this works</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Export the withdraw list from this page.</li>
                  <li>
                    Set the <b>Status</b> column to <b>Processing</b>,{" "}
                    <b>Completed</b> or <b>Rejected</b>.
                  </li>
                  <li>
                    For <b>Rejected</b> rows, fill in the <b>Reason</b> column —
                    it is required.
                  </li>
                  <li>Upload the file here. Nothing changes until you confirm.</li>
                </ol>
              </div>

              <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <span className="block text-sm font-medium text-gray-700">
                  {file ? file.name : "Choose the Excel file"}
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  .xlsx, .xls or .csv — up to 10MB
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setError(null);
                  }}
                />
              </label>
            </div>
          )}

          {step === STEP_REVIEW && result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Rows read", value: result.summary.total, tone: "bg-gray-100 text-gray-800" },
                  { label: "Will update", value: result.summary.ready, tone: "bg-green-100 text-green-800" },
                  { label: "No change", value: result.summary.unchanged, tone: "bg-yellow-100 text-yellow-800" },
                  { label: "Need fixing", value: result.summary.errors, tone: "bg-red-100 text-red-800" },
                ].map((s) => (
                  <div key={s.label} className={`rounded-lg p-3 ${s.tone}`}>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {result.summary.errors > 0 ? (
                <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">
                    <b>{result.summary.errors}</b> row
                    {result.summary.errors === 1 ? "" : "s"} below need fixing.
                    Nothing will be updated until every row is clean — correct
                    them in the file and upload it again.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">
                    Everything checks out. Confirm to apply{" "}
                    <b>{result.summary.ready}</b> status change
                    {result.summary.ready === 1 ? "" : "s"}.
                  </p>
                </div>
              )}

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      {["Excel Row", "Request ID", "User", "Amount", "Current", "New", "Reason", "Result"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {result.rows.map((row) => (
                      <tr key={row.row_number} className={rowTone(row.action)}>
                        <td className="px-3 py-2 text-gray-500">{row.row_number}</td>
                        <td className="px-3 py-2 font-medium">{row.request_id || "—"}</td>
                        <td className="px-3 py-2">{row.username || "—"}</td>
                        <td className="px-3 py-2">
                          {row.amount != null ? Number(row.amount).toFixed(2) : "—"}
                        </td>
                        <td className="px-3 py-2">{row.current_status || "—"}</td>
                        <td className="px-3 py-2">{row.new_status || "—"}</td>
                        <td className="px-3 py-2 max-w-[220px] truncate" title={row.reason}>
                          {row.reason || "—"}
                        </td>
                        <td className="px-3 py-2">
                          {row.action === "error" ? (
                            <span className="text-red-700">
                              {row.issues.join("; ")}
                            </span>
                          ) : row.action === "unchanged" ? (
                            <span className="text-yellow-700">
                              Already {row.new_status} — no change
                            </span>
                          ) : (
                            <span className="text-green-700">Will update</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === STEP_DONE && (
            <div className="text-center py-10">
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-900">
                {applied} withdraw request{applied === 1 ? "" : "s"} updated
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Rejected requests have had their amount returned to the user's
                wallet.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {step === STEP_UPLOAD && (
            <>
              <button
                onClick={closeAndReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleValidate}
                disabled={!file || loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {loading ? "Checking..." : "Check File"}
              </button>
            </>
          )}

          {step === STEP_REVIEW && (
            <>
              <button
                onClick={() => {
                  setStep(STEP_UPLOAD);
                  setFile(null);
                  setResult(null);
                  setError(null);
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Upload another file
              </button>
              <button
                onClick={handleConfirm}
                disabled={!result?.can_confirm || loading}
                title={
                  result?.can_confirm
                    ? "Apply these status changes"
                    : "Fix the rows above and upload the file again"
                }
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                {loading ? "Applying..." : "Confirm & Update"}
              </button>
            </>
          )}

          {step === STEP_DONE && (
            <button
              onClick={closeAndReset}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
