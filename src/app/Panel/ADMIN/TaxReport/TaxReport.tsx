import React, { useState, useEffect } from "react";
import {
  Receipt,
  IndianRupee,
  Percent,
  Package,
  AlertTriangle,
} from "lucide-react";
import { useGetCall, useQueryParams } from "@/hooks";
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
  const [filter, setFilter] = useState(defaultFilter);

  const { loading, setQuery, data } = useGetCall(SERVICE.TAX_REPORT, {
    avoidFetch: true,
  });

  useEffect(() => {
    setQuery(filter);
  }, [filter]);

  const summary = data?.summary ?? {};
  const products = data?.products ?? [];
  const rates = data?.rates ?? {};

  const money = (v: any) => `₹${Lib.formatAmount(Number(v ?? 0))}`;

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
            {v > 0 ? "+" : ""}
            {v.toFixed(2)}
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

  const cards = [
    {
      label: "Invoices",
      value: loading ? "..." : String(summary?.invoices ?? 0),
      sub: `${summary?.qty ?? 0} units delivered`,
      icon: Receipt,
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
      sub: `round off ${Number(summary?.round_off ?? 0).toFixed(2)}`,
      icon: IndianRupee,
      tone: "bg-green-600",
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tax / Invoice Report</h1>
        <p className="mt-2 text-gray-600">
          Every invoice issued, with its GST breakdown. Totals below cover the
          whole filtered range, not just this page.
        </p>
      </div>

      {/* Overall totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {cards.map((c) => {
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

      {/* Per-product delivered totals */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {products.map((p: any) => (
            <div
              key={p.product}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {p.product}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.qty} units delivered · {p.batches} invoice
                      {p.batches === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-900">
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
    </div>
  );
}
