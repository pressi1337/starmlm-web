import { useEffect, useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Send,
  X,
} from "lucide-react";
import { useActionCall, useGetCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";
import CopyClipBoard from "@/components/CopyClip";
import Loader from "@/components/ui/Loader";
import Lib from "@/utils/Lib";
import UIHelpers from "@/utils/UIhelper";

/**
 * Payment Gateway — Worldline ePayments India (Paynimo).
 *
 * Shows the live gateway configuration and runs a REAL payment for any amount
 * so the full flow (hosted page → bank → return → verification) can be tried
 * by hand. The gateway sends the browser back here with ?order_id=…, and the
 * result of that attempt is shown at the top.
 */

type Payment = {
  id: number;
  order_id: string;
  purpose: "test" | "promoter";
  amount: number;
  mode: string;
  status: number;
  status_label: string;
  transaction_id: string | null;
  response_code: number | null;
  response_message: string | null;
  error_desc: string | null;
  payment_mode: string | null;
  payment_channel: string | null;
  payment_datetime: string | null;
  settled_via: string | null;
  hash_verified: boolean | null;
  created_at: string;
  user: { name: string; mobile: string } | null;
  gateway_uuid: string | null;
  request_payload: Record<string, string> | null;
  gateway_response: Record<string, unknown> | null;
};

const FORM_KEY = "pg-test-form";
const DEFAULT_FORM = {
  amount: "5",
  name: "Rohith Test",
  email: "rsn7rohith@gmail.com",
  phone: "",
  bank_code: "",
  description: "Starup gateway test payment",
};

const STATUS_STYLE: Record<number, { label: string; cls: string; icon: typeof CheckCircle }> = {
  0: { label: "Pending", cls: "bg-yellow-100 text-yellow-800", icon: Clock },
  1: { label: "Success", cls: "bg-green-100 text-green-800", icon: CheckCircle },
  2: { label: "Failed", cls: "bg-red-100 text-red-800", icon: XCircle },
  3: { label: "Cancelled", cls: "bg-orange-100 text-orange-800", icon: XCircle },
};

function StatusBadge({ status }: { status: number }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE[0];
  const Icon = s.icon;
  return (
    <span className={Lib.cn("inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap", s.cls)}>
      <Icon className="w-3.5 h-3.5" /> {s.label}
    </span>
  );
}

function loadForm() {
  try {
    const saved = JSON.parse(localStorage.getItem(FORM_KEY) || "null");
    return saved ? { ...DEFAULT_FORM, ...saved } : DEFAULT_FORM;
  } catch {
    return DEFAULT_FORM;
  }
}

export default function PaymentGateway() {
  const { searchParams, updateSearchParam } = useQueryParams();
  const returnedOrderId = (searchParams.get("order_id") || "").replace(/[^A-Za-z0-9]/g, "");

  const { data: cfgData, loading: cfgLoading, fetchApi: reloadConfig } = useGetCall(SERVICE.PAYMENT_GATEWAY_CONFIG);
  const { data: txData, loading: txLoading, setQuery: loadTx } = useGetCall(SERVICE.PAYMENT_GATEWAY_TRANSACTIONS, { avoidFetch: true });
  const { data: resultData, loading: resultLoading, fetchApi: checkStatus } = useGetCall(SERVICE.PAYMENT_GATEWAY_TRANSACTIONS, { avoidFetch: true });
  const { Post: initiate, loading: initiating, error: formErrors } = useActionCall(SERVICE.PAYMENT_GATEWAY_TEST_INITIATE);

  const [form, setForm] = useState(loadForm);
  const [redirecting, setRedirecting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [checking, setChecking] = useState<string | null>(null);
  const [pageNo, setPageNo] = useState(1);

  const cfg = cfgData?.data;
  const txRows: Payment[] = txData?.data ?? [];
  const pageInfo = txData?.pageInfo;
  const result: Payment | undefined = resultData?.data?.payment;

  useEffect(() => {
    loadTx({ pageSize: 20, pageNo });
  }, [pageNo]);

  // Back from the gateway: fetch the verified outcome of that attempt.
  useEffect(() => {
    if (returnedOrderId) checkStatus({ key: returnedOrderId });
  }, [returnedOrderId]);

  const errors = formErrors && typeof formErrors === "object" ? (formErrors as Record<string, string>) : {};
  const set = (k: keyof typeof DEFAULT_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const startPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(FORM_KEY, JSON.stringify(form));
    } catch {
      /* storage unavailable — just don't remember the form */
    }
    const res = await initiate({ ...form, amount: Number(form.amount), return_origin: window.location.origin }, "");
    const url = res?.data?.payment_url;
    if (url) {
      setRedirecting(true);
      window.location.assign(url);
    }
  };

  const recheck = async (orderId: string) => {
    setChecking(orderId);
    try {
      await fetchStatusAndRefresh(orderId);
    } finally {
      setChecking(null);
    }
  };

  const fetchStatusAndRefresh = async (orderId: string) => {
    await checkStatus({ key: orderId });
    loadTx({ pageSize: 20, pageNo });
    reloadConfig({});
  };

  const dismissResult = () => updateSearchParam({ deleteParams: ["order_id"] });

  if (cfgLoading && !cfg) return <Loader />;

  const live = cfg?.mode === "LIVE";
  const busy = initiating || redirecting;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-blue-600" />
            Payment Gateway
          </h1>
          <p className="mt-2 text-gray-600">
            {cfg?.provider} — configuration and a live test of the full payment flow.
          </p>
        </div>
        <span
          className={Lib.cn(
            "px-3 py-1 rounded-full text-sm font-bold tracking-wide",
            live ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
          )}
        >
          {live ? "LIVE MODE — real money" : "TEST MODE"}
        </span>
      </div>

      {/* Result of the attempt we just came back from */}
      {returnedOrderId && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Payment result</h2>
            <button onClick={dismissResult} className="text-gray-400 hover:text-gray-600" aria-label="Dismiss">
              <X className="w-5 h-5" />
            </button>
          </div>
          {resultLoading && !result ? (
            <div className="flex items-center gap-2 text-gray-600 mt-3">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking with the gateway…
            </div>
          ) : result ? (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Field label="Status"><StatusBadge status={result.status} /></Field>
              <Field label="Amount">₹{Lib.formatAmount(result.amount)}</Field>
              <Field label="Order ID">{result.order_id}</Field>
              <Field label="Transaction ID">{result.transaction_id || "—"}</Field>
              <Field label="Paid via">{[result.payment_mode, result.payment_channel].filter(Boolean).join(" · ") || "—"}</Field>
              <Field label="Gateway response">
                {result.response_code ?? "—"} {result.response_message ? `· ${result.response_message}` : ""}
              </Field>
              <Field label="Hash check"><HashBadge value={result.hash_verified} /></Field>
              <Field label="Recorded via">{result.settled_via || "—"}</Field>
              {result.error_desc && (
                <div className="col-span-2 md:col-span-4 text-red-700 bg-red-50 rounded-lg px-3 py-2">{result.error_desc}</div>
              )}
              {result.status === 0 && (
                <div className="col-span-2 md:col-span-4">
                  <button
                    onClick={() => recheck(result.order_id)}
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <RefreshCw className={Lib.cn("w-4 h-4", checking === result.order_id && "animate-spin")} />
                    Still pending — check again
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-600">No record of order {returnedOrderId}.</p>
          )}
        </div>
      )}

      {/* Stats */}
      {cfg?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Stat label="Transactions" value={cfg.stats.total} />
          <Stat label="Successful" value={cfg.stats.success} tone="text-green-700" />
          <Stat label="Failed / Cancelled" value={cfg.stats.failed} tone="text-red-700" />
          <Stat label="Pending" value={cfg.stats.pending} tone="text-yellow-700" />
          <Stat label="Collected" value={`₹${Lib.formatAmount(cfg.stats.collected)}`} tone="text-blue-700" />
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Configuration */}
        <div className="lg:col-span-2 bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Configuration</h2>
            {cfg?.configured ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                <ShieldCheck className="w-4 h-4" /> Configured
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                <ShieldAlert className="w-4 h-4" /> Not configured
              </span>
            )}
          </div>
          <dl className="divide-y divide-gray-100 text-sm">
            <Row label="Provider" value={cfg?.provider} />
            <Row label="Mode" value={cfg?.mode} />
            <Row label="Merchant code" value={cfg?.merchant_code} mono />
            <Row label="Scheme code" value={cfg?.scheme_code} mono />
            <Row label="Encryption key" value={cfg?.enc_key_masked} mono />
            <Row label="Encryption IV" value={cfg?.enc_iv_masked} mono />
            <Row label="Service URL" value={cfg?.service_url} />
            <Row label="Integration" value={cfg?.integration} />
            <Row label="Default bank code" value={cfg?.bank_code} mono />
            <Row
              label="Amount limits"
              value={cfg ? `₹${cfg.min_amount}${cfg.max_amount ? ` – ₹${cfg.max_amount}` : " and above"}` : ""}
            />
            {cfg?.test_bank_login && <Row label="Test bank login" value={cfg.test_bank_login} mono />}
            <Row label="Return URL" value={cfg?.return_url} copy />
            <Row label="S2S URL" value={cfg?.s2s_url} copy />
          </dl>
          <div className="px-5 py-4 bg-gray-50 text-xs text-gray-600 space-y-2">
            <p>
              Give the <b>S2S URL</b> to Worldline as the server-to-server callback so payments are recorded even if the
              browser never returns.
            </p>
            {cfg?.test_bank_login && (
              <p>
                On the gateway's test page, pay with the test bank login <b>{cfg.test_bank_login}</b>.
              </p>
            )}
            <a
              href={cfg?.dashboard_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
            >
              Open Worldline portal <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Test payment */}
        <form
          onSubmit={startPayment}
          className="lg:col-span-3 bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Test payment</h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Creates a real payment page for this amount. You'll pick UPI / card / net banking on the gateway page and
              come back here with the result.
              {cfg?.max_amount
                ? ` The test merchant only accepts ₹${cfg.min_amount} to ₹${cfg.max_amount}.`
                : ""}
            </p>
          </div>
          <div className="p-5 grid sm:grid-cols-2 gap-4">
            <Input
              label={cfg?.max_amount ? `Amount (₹${cfg.min_amount}–₹${cfg.max_amount})` : "Amount (₹)"}
              value={form.amount}
              onChange={set("amount")}
              error={errors.amount}
              type="number"
              min={cfg?.min_amount ?? 1}
              max={cfg?.max_amount ?? undefined}
              step="0.01"
              required
            />
            <Input label="Customer name" value={form.name} onChange={set("name")} error={errors.name} required />
            <Input label="Email" value={form.email} onChange={set("email")} error={errors.email} type="email" required />
            <Input label="Phone (10 digits)" value={form.phone} onChange={set("phone")} error={errors.phone} inputMode="numeric" maxLength={10} required />
            <Input label="Description" value={form.description} onChange={set("description")} error={errors.description} />
            <Input
              label="Bank / payment code (optional)"
              value={form.bank_code}
              onChange={set("bank_code")}
              error={errors.bank_code}
              placeholder={cfg?.bank_code || "e.g. 470"}
            />
          </div>
          {live && (
            <div className="mx-5 mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" /> The gateway is in LIVE mode — this charges real money.
            </div>
          )}
          <div className="px-5 pb-5">
            <button
              type="submit"
              disabled={busy || !cfg?.configured}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {busy ? "Opening payment page…" : `Pay ₹${Lib.formatAmount(form.amount || 0)}`}
            </button>
          </div>
        </form>
      </div>

      {/* Transactions */}
      <div className="mt-6 bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Transactions</h2>
          <button
            onClick={() => loadTx({ pageSize: 20, pageNo })}
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800"
          >
            <RefreshCw className={Lib.cn("w-4 h-4", txLoading && "animate-spin")} /> Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Transaction</th>
                <th className="px-4 py-3 font-medium">Hash</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {txRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    {txLoading ? "Loading…" : "No payments yet — run a test payment above."}
                  </td>
                </tr>
              )}
              {txRows.map((p) => (
                <TxRow
                  key={p.id}
                  p={p}
                  open={expanded === p.order_id}
                  onToggle={() => setExpanded(expanded === p.order_id ? null : p.order_id)}
                  onRecheck={() => recheck(p.order_id)}
                  checking={checking === p.order_id}
                />
              ))}
            </tbody>
          </table>
        </div>
        {pageInfo && pageInfo.total_pages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>
              Page {pageInfo.page_number} of {pageInfo.total_pages} · {pageInfo.total_records} records
            </span>
            <div className="flex gap-2">
              <button disabled={pageNo <= 1} onClick={() => setPageNo((n) => n - 1)} className="px-3 py-1 border rounded disabled:opacity-40">
                Prev
              </button>
              <button
                disabled={pageNo >= pageInfo.total_pages}
                onClick={() => setPageNo((n) => n + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TxRow({ p, open, onToggle, onRecheck, checking }: {
  p: Payment; open: boolean; onToggle: () => void; onRecheck: () => void; checking: boolean;
}) {
  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3 font-mono text-xs">{p.order_id}</td>
        <td className="px-4 py-3">
          {p.purpose === "test" ? (
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">Test</span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">Plan</span>
          )}
          <div className="text-[11px] text-gray-400 mt-0.5">{p.mode}</div>
        </td>
        <td className="px-4 py-3 font-medium whitespace-nowrap">₹{Lib.formatAmount(p.amount)}</td>
        <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
        <td className="px-4 py-3 text-xs">
          <div className="font-mono">{p.transaction_id || "—"}</div>
          <div className="text-gray-500">{[p.payment_mode, p.payment_channel].filter(Boolean).join(" · ")}</div>
        </td>
        <td className="px-4 py-3"><HashBadge value={p.hash_verified} /></td>
        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{UIHelpers.DateFormat(p.created_at)}</td>
        <td className="px-4 py-3 whitespace-nowrap text-right">
          <button onClick={onRecheck} title="Check status with gateway" className="p-1.5 text-gray-500 hover:text-blue-600">
            <RefreshCw className={Lib.cn("w-4 h-4", checking && "animate-spin")} />
          </button>
          <button onClick={onToggle} title="Details" className="p-1.5 text-gray-500 hover:text-blue-600">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </td>
      </tr>
      {open && (
        <tr className="bg-gray-50">
          <td colSpan={8} className="px-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <JsonBlock title="Request sent to gateway" value={p.request_payload} />
              <JsonBlock title="Response from gateway" value={p.gateway_response} />
            </div>
            <div className="mt-3 text-xs text-gray-600 flex flex-wrap gap-x-6 gap-y-1">
              <span>Response: {p.response_code ?? "—"} {p.response_message ?? ""}</span>
              {p.error_desc && <span className="text-red-700">Error: {p.error_desc}</span>}
              <span>Recorded via: {p.settled_via || "—"}</span>
              <span>Gateway UUID: {p.gateway_uuid || "—"}</span>
              {p.user && <span>By: {p.user.name} ({p.user.mobile})</span>}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function HashBadge({ value }: { value: boolean | null }) {
  if (value === true) return <span className="text-xs font-semibold text-green-700">✓ Verified</span>;
  if (value === false) return <span className="text-xs font-semibold text-red-700">✗ Mismatch</span>;
  return <span className="text-xs text-gray-400">—</span>;
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-700 mb-1">{title}</div>
      <pre className="text-[11px] leading-relaxed bg-white border border-gray-200 rounded-lg p-3 overflow-auto max-h-64">
        {value ? JSON.stringify(value, null, 2) : "—"}
      </pre>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium text-gray-900 break-all mt-0.5">{children}</div>
    </div>
  );
}

function Stat({ label, value, tone = "text-gray-900" }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={Lib.cn("text-xl font-bold mt-0.5", tone)}>{value}</div>
    </div>
  );
}

function Row({ label, value, mono, copy }: { label: string; value?: string | null; mono?: boolean; copy?: boolean }) {
  return (
    <div className="px-5 py-2.5 grid grid-cols-3 gap-3">
      <dt className="text-gray-500">{label}</dt>
      <dd className={Lib.cn("col-span-2 text-gray-900 break-all", mono && "font-mono text-xs")}>
        {value ? copy ? <CopyClipBoard text={value} /> : value : "—"}
      </dd>
    </div>
  );
}

function Input({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        {...props}
        className={Lib.cn(
          "mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
          error ? "border-red-400" : "border-gray-300"
        )}
      />
      {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
    </label>
  );
}
