// @ts-nocheck
import { useEffect, useState } from "react";
import { IndianRupee, Save, AlertCircle } from "lucide-react";
import { useActionCall, useGetCall } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Loader from "@/components/ui/Loader";

/**
 * Product price master — one sales price + MRP per promoter level.
 *
 * Every dispatch bills at the price set here for that promoter's level, and
 * the value is copied onto the batch at dispatch. Editing a price therefore
 * affects future invoices only; already-issued ones keep what they charged.
 */
export default function ProductPrices() {
  const { data, loading, fetchApi } = useGetCall(SERVICE.PRODUCT_PRICES);
  const { Post: savePrice, loading: saving } = useActionCall(
    SERVICE.PRODUCT_PRICES_UPSERT
  );

  const [rows, setRows] = useState<any[]>([]);
  const [savingLevel, setSavingLevel] = useState<number | null>(null);

  useEffect(() => {
    if (Array.isArray(data?.data)) setRows(data.data);
  }, [data]);

  const setField = (level: number, field: string, value: any) =>
    setRows((prev) =>
      prev.map((r) => (r.level === level ? { ...r, [field]: value } : r))
    );

  const save = async (row: any) => {
    setSavingLevel(row.level);
    try {
      const resp = await savePrice(
        {
          level: row.level,
          product_name: row.product_name,
          price: Number(row.price),
          mrp: Number(row.mrp),
        },
        `${row.level_label} price saved`
      );
      if (resp) fetchApi({});
    } finally {
      setSavingLevel(null);
    }
  };

  if (loading) return <Loader />;

  const unset = rows.filter((r) => !r.configured).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <IndianRupee className="w-7 h-7 text-emerald-600" />
          Product Price
        </h1>
        <p className="mt-2 text-gray-600">
          One sales price and MRP per promoter level. Every plan-product
          dispatch bills at the price for that promoter's level, and the
          invoice is built from it. Tax is fixed at 18% (9% CGST + 9% SGST).
        </p>
      </div>

      {unset > 0 ? (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {unset} level{unset > 1 ? "s have" : " has"} no price set. A batch
            at that level can't be dispatched until it does.
          </span>
        </div>
      ) : null}

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Promoter Level</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Sales Price (₹)</th>
                <th className="px-4 py-3">MRP (₹)</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.level} className="align-middle">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {row.level_label}
                    </div>
                    {!row.configured ? (
                      <span className="mt-0.5 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        Not set
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={row.product_name ?? ""}
                      onChange={(e) =>
                        setField(row.level, "product_name", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.price ?? ""}
                      onChange={(e) =>
                        setField(row.level, "price", e.target.value)
                      }
                      className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.mrp ?? ""}
                      onChange={(e) =>
                        setField(row.level, "mrp", e.target.value)
                      }
                      className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => save(row)}
                      disabled={saving}
                      className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                    >
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                      {savingLevel === row.level ? "Saving…" : "Save"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
