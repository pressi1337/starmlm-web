import React, { useState, useEffect } from "react";
import {
  ReceiptIndianRupee,
  IndianRupee,
  Percent,
  Package,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Scale,
  Landmark,
} from "lucide-react";
import { useActionCall, useGetCall, useQueryParams } from "@/hooks";
import Swal from "sweetalert2";
import TaxPaymentFormModal from "@/components/FormModals/TaxPaymentModal/TaxPaymentFormModal";
import { SERVICE } from "@/constants/services";
import DataTable from "@/components/DataTable";
import FilterTab from "@/components/FilterTab";
import Lib from "@/utils/Lib";

/**
 * Tax tracking. Every issued invoice with its GST breakdown, plus totals
 * across the whole filtered set (not just the visible page).
 *
 * All money comes from the API, which computes it with the same function that
 * prints the customer's bill — nothing is recalculated here, so the page can
 * never disagree with an actual invoice.
 */
export default function TaxReport() {
  const { defaultFilter } = useQueryParams();
  const [tab, setTab] = useState<"invoices" | "payments">("invoices");
  const [filter, setFilter] = useState(defaultFilter);
  const [payFilter, setPayFilter] = useState(defaultFilter);
  const [editing, setEditing] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { loading, setQuery, data } = useGetCall(SERVICE.TAX_REPORT, {
    avoidFetch: true,
  });
  const {
    loading: payLoading,
    setQuery: setPayQuery,
    data: payData,
  } = useGetCall(SERVICE.TAX_PAYMENTS, { avoidFetch: true });
  const { Delete: deletePayment } = useActionCall(SERVICE.TAX_PAYMENTS);

  useEffect(() => {
    setQuery(filter);
  }, [filter]);

  // The payments tab carries both halves of the balance, so it is refetched
  // on its own filter and after every add / edit / delete.
  const loadPayments = () => setPayQuery(payFilter);
  useEffect(() => {
    loadPayments();
  }, [payFilter]);

  const confirmDelete = async (row: any) => {
    const result = await Swal.fire({
      title: "Delete this tax payment?",
      text: `₹${Lib.formatAmount(row?.amount ?? 0)} paid on ${
        row?.payment_date_formatted ?? ""
      } will no longer count towards the balance.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    const response = await deletePayment(row.id, "Tax payment deleted");
    if (response) loadPayments();
  };

  const summary = data?.summary ?? {};
  const products = data?.products ?? [];
  const rates = data?.rates ?? {};

  const money = (v: any) => `₹${Lib.formatAmount(Number(v ?? 0))}`;

  /**
   * Round off, which can go either way. Sign outside the rupee sign (-₹0.01),
   * and grouped like any other amount — the summary round off is the sum
   * across every invoice in range, so it does get large.
   */
  const signedMoney = (v: any) => {
    const n = Number(v ?? 0);
    const sign = n < 0 ? "-" : n > 0 ? "+" : "";
    return `${sign}₹${Lib.formatAmount(Math.abs(n))}`;
  };

  const Columns: any = [
    {
      title: "Invoice No",
      key: "invoice_no",
      sortable: true,
      render: (index: any, row: any) =>
        row?.invoice_no ? (
          <span className="font-mono font-medium text-gray-900 whitespace-nowrap">
            {row.invoice_no}
          </span>
        ) : (
          <span
            className="text-amber-600 text-xs whitespace-nowrap"
            title="Numbers are issued on delivery; this batch predates numbering and gets one when its invoice is first opened"
          >
            Not yet numbered
          </span>
        ),
    },
    {
      title: "Invoice Date",
      key: "delivered_at",
      sortable: true,
      render: (index: any, row: any) => (
        <span className="whitespace-nowrap">{row?.invoice_date ?? "-"}</span>
      ),
    },
    {
      title: "Customer",
      key: "username",
      render: (index: any, row: any) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row?.username ?? "-"}
          </div>
          <div className="text-xs text-gray-500">{row?.mobile ?? "-"}</div>
        </div>
      ),
    },
    {
      title: "Product",
      key: "product",
      render: (index: any, row: any) => (
        <span className="whitespace-nowrap">{row?.product ?? "-"}</span>
      ),
    },
    {
      title: "Qty",
      key: "quantity",
      sortable: true,
      render: (index: any, row: any) => (
        <span className="font-medium">{row?.qty ?? 0}</span>
      ),
    },
    {
      title: "Rate / Qty",
      key: "rate_per_qty",
      render: (index: any, row: any) => (
        <span className="whitespace-nowrap">{money(row?.rate_per_qty)}</span>
      ),
    },
    {
      title: "Gross Total",
      key: "gross_total",
      render: (index: any, row: any) => (
        <span className="whitespace-nowrap font-medium">
          {money(row?.gross_total)}
        </span>
      ),
    },
    {
      title: `CGST ${rates?.cgst_percent ?? 9}%`,
      key: "cgst",
      render: (index: any, row: any) => (
        <span className="whitespace-nowrap">{money(row?.cgst)}</span>
      ),
    },
    {
      title: `SGST ${rates?.sgst_percent ?? 9}%`,
      key: "sgst",
      render: (index: any, row: any) => (
        <span className="whitespace-nowrap">{money(row?.sgst)}</span>
      ),
    },
    {
      title: "Total Tax",
      key: "tax_total",
      render: (index: any, row: any) => (
        <span className="whitespace-nowrap text-indigo-700 font-medium">
          {money(row?.tax_total)}
        </span>
      ),
    },
    {
      title: "Round Off",
      key: "round_off",
      render: (index: any, row: any) => {
        const v = Number(row?.round_off ?? 0);
        return (
          <span
            className={`whitespace-nowrap ${
              v < 0 ? "text-red-600" : v > 0 ? "text-green-700" : "text-gray-400"
            }`}
          >
            {signedMoney(v)}
          </span>
        );
      },
    },
    {
      title: "Grand Total",
      key: "grand_total",
      render: (index: any, row: any) => (
        <span className="whitespace-nowrap font-bold text-gray-900">
          {money(row?.grand_total)}
        </span>
      ),
    },
  ];

  const paySummary = payData?.summary ?? {};

  const PaymentColumns: any = [
    {
      title: "Payment Date",
      key: "payment_date",
      sortable: true,
      render: (index: any, row: any) => (
        <span className="whitespace-nowrap font-medium text-gray-900">
          {row?.payment_date_formatted ?? "-"}
        </span>
      ),
    },
    {
      title: "Amount Paid",
      key: "amount",
      sortable: true,
      render: (index: any, row: any) => (
        <span className="whitespace-nowrap font-bold text-gray-900">
          {money(row?.amount)}
        </span>
      ),
    },
    {
      title: "CGST",
      key: "cgst",
      render: (index: any, row: any) =>
        Number(row?.cgst) > 0 ? (
          <span className="whitespace-nowrap">{money(row?.cgst)}</span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: "SGST",
      key: "sgst",
      render: (index: any, row: any) =>
        Number(row?.sgst) > 0 ? (
          <span className="whitespace-nowrap">{money(row?.sgst)}</span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: "Challan / Ref",
      key: "reference_no",
      render: (index: any, row: any) => (
        <span className="font-mono text-sm">{row?.reference_no || "-"}</span>
      ),
    },
    {
      title: "Mode",
      key: "payment_mode",
      render: (index: any, row: any) => (
        <span className="whitespace-nowrap">{row?.payment_mode || "-"}</span>
      ),
    },
    {
      title: "FY",
      key: "fy",
      render: (index: any, row: any) => (
        <span className="whitespace-nowrap">{row?.fy || "-"}</span>
      ),
    },
    {
      title: "Remarks",
      key: "remarks",
      render: (index: any, row: any) => (
        <span className="block max-w-[220px] truncate" title={row?.remarks || ""}>
          {row?.remarks || "-"}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (index: any, row: any) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setEditing(row);
              setModalOpen(true);
            }}
            title="Edit"
            className="text-blue-600 hover:text-blue-900 p-1"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => confirmDelete(row)}
            title="Delete"
            className="text-red-600 hover:text-red-900 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // The balance trio, shown on the payments tab.
  const paymentCards = [
    {
      label: "Tax Collected",
      value: payLoading ? "..." : money(paySummary?.tax_collected),
      sub: "billed on invoices",
      icon: Percent,
      tone: "bg-indigo-500",
    },
    {
      label: "Tax Paid",
      value: payLoading ? "..." : money(paySummary?.tax_paid),
      sub: `${payData?.paid_totals?.payments ?? 0} payment${
        Number(payData?.paid_totals?.payments) === 1 ? "" : "s"
      }`,
      icon: Landmark,
      tone: "bg-green-600",
    },
    {
      label: Number(paySummary?.balance) < 0 ? "Paid In Excess" : "Balance Payable",
      value: payLoading ? "..." : money(Math.abs(Number(paySummary?.balance ?? 0))),
      sub:
        Number(paySummary?.balance) < 0
          ? "more paid than collected"
          : Number(paySummary?.balance) === 0
          ? "fully paid"
          : "still to pay",
      icon: Scale,
      tone:
        Number(paySummary?.balance) > 0
          ? "bg-red-500"
          : Number(paySummary?.balance) < 0
          ? "bg-amber-500"
          : "bg-slate-600",
    },
  ];

  const cards = [
    {
      label: "Invoices",
      value: loading ? "..." : String(summary?.invoices ?? 0),
      sub: `${summary?.qty ?? 0} units delivered`,
      icon: ReceiptIndianRupee,
      tone: "bg-blue-500",
    },
    {
      label: "Gross Amount",
      value: loading ? "..." : money(summary?.gross),
      sub: "before tax",
      icon: IndianRupee,
      tone: "bg-slate-600",
    },
    {
      label: "Total Tax",
      value: loading ? "..." : money(summary?.tax),
      sub: `CGST ${money(summary?.cgst)} + SGST ${money(summary?.sgst)}`,
      icon: Percent,
      tone: "bg-indigo-500",
    },
    {
      label: "Grand Total",
      value: loading ? "..." : money(summary?.grand_total),
      sub: `round off ${signedMoney(summary?.round_off)}`,
      icon: IndianRupee,
      tone: "bg-green-600",
    },
  ];

  return (
    // Same bounded, centred wrapper every other admin page uses. Without the
    // max-width the page grows to fit the widest row, and with twelve
    // nowrap money columns that pushes the content out over the layout
    // instead of letting the table scroll inside its own card.
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tax / Invoice Report</h1>
        <p className="mt-2 text-gray-600">
          Every invoice issued, with its GST breakdown. Totals below cover the
          whole filtered range, not just this page.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
        {[
          { key: "invoices", label: "Invoices" },
          { key: "payments", label: "Tax Paid" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-5 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === t.key
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overall totals — the invoice breakdown, or the balance trio */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 ${
          tab === "invoices" ? "lg:grid-cols-4" : "lg:grid-cols-3"
        }`}
      >
        {(tab === "invoices" ? cards : paymentCards).map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div
                  className={`w-12 h-12 ${c.tone} rounded-lg flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4 min-w-0">
                  <p className="text-sm font-medium text-gray-500">{c.label}</p>
                  <p className="text-2xl font-semibold text-gray-900 truncate">
                    {c.value}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{c.sub}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Invoices tab ── */}
      {tab === "invoices" && (
      <>
      {/* Per-product delivered totals */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {products.map((p: any) => (
            <div
              key={p.product}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                {/* min-w-0 + truncate: product_name comes from the price
                    master and can be up to 120 characters. */}
                <div className="flex items-center min-w-0">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3 min-w-0">
                    <p
                      className="text-sm font-semibold text-gray-900 truncate"
                      title={p.product}
                    >
                      {p.product}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {p.qty} units delivered · {p.batches} invoice
                      {p.batches === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-900 whitespace-nowrap flex-shrink-0">
                  {money(p.grand_total)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoices still waiting for a number */}
      {Number(summary?.awaiting_number ?? 0) > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg flex items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <b>{summary.awaiting_number}</b> delivered batch
            {summary.awaiting_number === 1 ? "" : "es"} in this range{" "}
            {summary.awaiting_number === 1 ? "has" : "have"} no invoice number.
            Numbers are issued when a delivery is confirmed, so these predate
            invoice numbering — each gets one the first time its invoice is
            opened. The tax figures above already include them.
          </p>
        </div>
      )}

      {/* Filters */}
      <FilterTab
        filter={filter}
        setFilter={setFilter}
        TABLE_FILTER={["SEARCH", "PROMOTER_LEVEL_PIN", "FROM_DATE", "TO_DATE"]}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          columns={Columns}
          data={data?.data ?? []}
          pageInfo={data?.pageInfo}
          filter={filter}
          setFilter={setFilter}
          enableSerial={true}
          isLoading={loading}
          setPageSize={(pageSize: number) => {
            setFilter((prv: any) => ({ ...prv, pageNo: 1, pageSize }));
          }}
        />
      </div>
      </>
      )}

      {/* ── Tax paid tab ── */}
      {tab === "payments" && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Record Tax Payment
            </button>
          </div>

          <FilterTab
            filter={payFilter}
            setFilter={setPayFilter}
            TABLE_FILTER={["SEARCH", "FROM_DATE", "TO_DATE"]}
          />

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <DataTable
              columns={PaymentColumns}
              data={payData?.data ?? []}
              pageInfo={payData?.pageInfo}
              filter={payFilter}
              setFilter={setPayFilter}
              enableSerial={true}
              isLoading={payLoading}
              setPageSize={(pageSize: number) => {
                setPayFilter((prv: any) => ({ ...prv, pageNo: 1, pageSize }));
              }}
            />
          </div>
        </>
      )}

      <TaxPaymentFormModal
        isOpen={modalOpen}
        payment={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSaved={loadPayments}
      />
    </div>
  );
}
