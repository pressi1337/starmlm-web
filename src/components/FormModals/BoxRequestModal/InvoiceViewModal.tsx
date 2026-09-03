// @ts-nocheck
import { useState } from "react";
import { Download, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Loader from "@/components/ui/Loader";
import { useGetCall } from "@/hooks";
import { downloadFromApi } from "@/utils/download";

const money = (value: any) =>
  Number(value ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Read-only invoice for a delivered batch, for the admin.
 *
 * Every figure comes from the server (InvoiceBuilder) — the same payload the
 * user's own invoice page and the PDF are built from, so admin, user and
 * printed document can never disagree. Download hands back the identical PDF
 * the user would get.
 */
export default function InvoiceViewModal({ row, onClose = () => {} }: any) {
  const [downloading, setDownloading] = useState(false);

  const { data, loading, error } = useGetCall(
    `admin-box-requests/${row?.id}/invoice`
  );

  const inv = data?.data;

  const download = async () => {
    setDownloading(true);
    try {
      // "/" isn't valid in a filename — the server names the attachment the
      // same way, this just keeps the two consistent.
      const safeNo = String(inv?.invoice_no ?? row?.id ?? "invoice").replace(
        /\//g,
        "-"
      );
      await downloadFromApi(
        `admin-box-requests/${row.id}/invoice/download`,
        `invoice-${safeNo}.pdf`
      );
    } catch (e: any) {
      toast.error(e?.message || "Could not download the invoice");
    } finally {
      setDownloading(false);
    }
  };

  const body = () => {
    if (loading) return <Loader />;

    if (!inv) {
      return (
        <div className="py-10 text-center">
          <AlertCircle className="mx-auto mb-3 h-9 w-9 text-gray-400" />
          <p className="text-sm text-gray-700">
            {error || "This invoice isn't available."}
          </p>
        </div>
      );
    }

    const item = inv.items?.[0] ?? {};
    const totals = inv.totals ?? {};
    const by = inv.billed_by ?? {};
    const to = inv.billed_to ?? {};

    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="text-sm">
            <p className="text-lg font-bold text-gray-900">Invoice</p>
            <p className="mt-1 text-gray-500">
              Invoice#{" "}
              <span className="font-semibold text-gray-900">
                {inv.invoice_no}
              </span>
            </p>
            <p className="text-gray-500">
              Date{" "}
              <span className="font-semibold text-gray-900">
                {inv.invoice_date}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="inline-flex shrink-0 items-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {downloading ? "Preparing…" : "Download PDF"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-semibold text-gray-700">Billed by</p>
            <p className="mt-1.5 text-sm font-bold text-gray-900">{by.name}</p>
            {by.address ? (
              <p className="mt-0.5 text-xs text-gray-600">{by.address}</p>
            ) : null}
            {by.gstin ? (
              <p className="mt-1 text-xs text-gray-700">
                <span className="font-semibold">GSTIN</span> {by.gstin}
              </p>
            ) : null}
            {by.pan ? (
              <p className="text-xs text-gray-700">
                <span className="font-semibold">PAN</span> {by.pan}
              </p>
            ) : null}
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-semibold text-gray-700">Billed to</p>
            <p className="mt-1.5 text-sm font-bold text-gray-900">{to.name}</p>
            {to.address ? (
              <p className="mt-0.5 text-xs text-gray-600">{to.address}</p>
            ) : null}
            {to.customer_id ? (
              <p className="mt-1 text-xs text-gray-700">
                <span className="font-semibold">Customer ID</span>{" "}
                {to.customer_id}
              </p>
            ) : null}
            {to.mobile ? (
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Mobile</span> {to.mobile}
              </p>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-xs">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="px-3 py-2 text-left font-semibold">
                  Item description
                </th>
                <th className="px-2 py-2 text-center font-semibold">Qty</th>
                <th className="px-2 py-2 text-right font-semibold">MRP</th>
                <th className="px-2 py-2 text-right font-semibold">
                  Sales Price
                </th>
                <th className="px-2 py-2 text-center font-semibold">GST</th>
                <th className="px-2 py-2 text-right font-semibold">Taxable</th>
                <th className="px-2 py-2 text-right font-semibold">SGST</th>
                <th className="px-2 py-2 text-right font-semibold">CGST</th>
                <th className="px-3 py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="px-3 py-2.5 text-gray-900">
                  1. {item.description}
                </td>
                <td className="px-2 py-2.5 text-center text-gray-700">
                  {item.qty}
                </td>
                <td className="px-2 py-2.5 text-right text-gray-700">
                  ₹{money(item.mrp)}
                </td>
                <td className="px-2 py-2.5 text-right text-gray-700">
                  ₹{money(item.sales_price)}
                </td>
                <td className="px-2 py-2.5 text-center text-gray-700">
                  {item.gst_percent}%
                </td>
                <td className="px-2 py-2.5 text-right text-gray-700">
                  ₹{money(item.taxable)}
                </td>
                <td className="px-2 py-2.5 text-right text-gray-700">
                  ₹{money(item.sgst)}
                </td>
                <td className="px-2 py-2.5 text-right text-gray-700">
                  ₹{money(item.cgst)}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-gray-900">
                  ₹{money(item.amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full sm:w-72">
            {[
              ["Sub Total", totals.sub_total],
              ["Taxable Amount", totals.taxable],
              [`CGST (${totals.cgst_percent}%)`, totals.cgst],
              [`SGST (${totals.sgst_percent}%)`, totals.sgst],
            ].map(([label, value]: any) => (
              <div key={label} className="flex justify-between py-1 text-sm">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium text-gray-900">
                  ₹{money(value)}
                </span>
              </div>
            ))}

            {/* Only when there is something to round — the rate is a
                back-calculation of a round price, so a few paise drift. */}
            {Number(totals.round_off ?? 0) !== 0 ? (
              <div className="flex justify-between py-1 text-sm">
                <span className="text-gray-600">Round Off</span>
                <span className="font-medium text-gray-900">
                  {Number(totals.round_off) > 0 ? "+" : "−"}₹
                  {money(Math.abs(Number(totals.round_off)))}
                </span>
              </div>
            ) : null}

            <div className="mt-1.5 flex items-center justify-between border-t border-gray-300 pt-2">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">
                ₹{money(totals.grand_total ?? totals.total)}
              </span>
            </div>

            <div className="mt-2 border-t border-gray-200 pt-1.5">
              <p className="text-[11px] text-gray-500">
                Invoice Total (in words)
              </p>
              <p className="mt-0.5 text-xs font-semibold text-gray-900">
                {totals.in_words}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal title="Invoice" modalSize="lg" onClose={onClose}>
      {body()}
    </Modal>
  );
}
