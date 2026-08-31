import { useState, useEffect } from "react";
import {
  Package,
  PackageCheck,
  Truck,
  CheckCircle2,
  User as UserIcon,
  MapPin,
  Calendar,
  Phone,
  Pencil,
  Download,
} from "lucide-react";
import Swal from "sweetalert2";
import { useActionCall, useGetCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";
import DataTable from "@/components/DataTable";
import FilterTab from "@/components/FilterTab";
import MarkSentModal from "@/components/FormModals/BoxRequestModal/MarkSentModal";

const STATUS_OPTIONS = [
  { value: "1", label: "Requested" },
  { value: "2", label: "Sent" },
  { value: "3", label: "Delivered" },
];

/**
 * A lifecycle date cell. The API sends "-" for a stage the batch hasn't
 * reached yet; show a muted "--" so an empty cell reads as "hasn't happened"
 * rather than "missing data".
 */
const dateCell = (value: any) => {
  const hasValue = Boolean(value) && value !== "-";
  return (
    <div
      className={`text-sm whitespace-nowrap ${
        hasValue ? "text-gray-700" : "text-gray-400"
      }`}
    >
      {hasValue ? value : "--"}
    </div>
  );
};

const LEVEL_LABELS: Record<number, string> = {
  0: "Promoter",
  1: "Promoter L1",
  2: "Promoter L2",
  3: "Promoter L3",
  4: "Promoter L4",
};

// Base Promoter (level 0) = "Energy Plus"; all other levels = "Health Plus".
const productName = (lvl: any) => (Number(lvl) === 0 ? "Energy Plus" : "Health Plus");

/**
 * Admin Box Requests — every promoter box batch with its delivery status.
 * The single admin action is "Mark as Sent"; the user then confirms delivery
 * from their app.
 */
export default function BoxRequests() {
  const { defaultFilter } = useQueryParams();
  const [filter, setFilter] = useState({
    ...defaultFilter,
    sortBy: "created_at",
    sortDir: "desc",
  });

  const { loading, setQuery, data } = useGetCall(SERVICE.ADMIN_BOX_REQUESTS, {
    avoidFetch: true,
  });

  // Filter-aware Excel export — the same `filter` object drives the list, so
  // the file always matches what is on screen.
  const { loading: exportLoading, fetchApi: exportBoxRequests } = useGetCall(
    SERVICE.EXPORT_BOX_REQUESTS,
    { avoidFetch: true }
  );
  // Row whose dispatch form is open; null = closed.
  const [sentRow, setSentRow] = useState<any>(null);

  const {
    Patch: markSent,
    loading: marking,
    error: markSentError,
  } = useActionCall(
    SERVICE.ADMIN_BOX_MARK_SENT
  );
  const { Patch: markDelivered, loading: deliveringAdmin } = useActionCall(
    SERVICE.ADMIN_BOX_MARK_DELIVERED
  );
  const { Patch: updateQuantity, loading: editingQty } = useActionCall(
    SERVICE.ADMIN_BOX_UPDATE_QUANTITY
  );

  const refresh = () => setQuery(filter);
  useEffect(() => {
    refresh();
  }, [filter]);

  // This used to be a yes/no confirm. It now has to record HOW the batch went
  // out (direct or courier, plus that method's details), so it opens a form.
  const confirmMarkSent = (row: any) => {
    if (Number(row.status) !== 1) return;
    setSentRow(row);
  };

  const submitMarkSent = async (payload: any) => {
    const resp = await markSent(payload, "Marked as sent");
    if (resp) {
      setSentRow(null);
      refresh();
    }
  };

  const confirmMarkDelivered = async (row: any) => {
    if (Number(row.status) === 3) return;
    const swalT = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-md shadow-sm ml-3",
        cancelButton:
          "bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-md shadow-sm",
        popup: "rounded-xl shadow-2xl border border-gray-200 bg-white p-6",
        title: "text-lg font-semibold text-gray-800",
        htmlContainer: "text-gray-600",
      },
      buttonsStyling: false,
    });
    const result = await swalT.fire({
      title: "Mark as delivered?",
      text: `Confirm the user received ${row.quantity} ${productName(
        row.level
      )}. Use this when the user hasn't confirmed it themselves. This closes the request.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, mark delivered",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      const resp = await markDelivered({ id: row.id }, "Marked as delivered");
      if (resp) refresh();
    }
  };

  const editQuantity = async (row: any) => {
    const opts: number[] = row?.editable_options || [];
    if (!opts.length) return;
    const inputOptions: Record<string, string> = {};
    opts.forEach((o) => {
      inputOptions[String(o)] = `${o} ${productName(row.level)}`;
    });
    const { value, isConfirmed } = await Swal.fire({
      title: "Adjust quantity",
      text: "Set this to the quantity you can fulfil. Reducing it frees the rest for the user to request again.",
      input: "select",
      inputOptions,
      inputValue: String(row.quantity),
      showCancelButton: true,
      confirmButtonText: "Update",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        confirmButton:
          "bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-md shadow-sm ml-3",
        cancelButton:
          "bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-md shadow-sm",
        popup: "rounded-xl shadow-2xl border border-gray-200 bg-white p-6",
        title: "text-lg font-semibold text-gray-800",
        htmlContainer: "text-gray-600",
      },
      buttonsStyling: false,
    });
    if (isConfirmed && value) {
      const resp = await updateQuantity(
        { id: row.id, quantity: Number(value) },
        "Quantity updated"
      );
      if (resp) refresh();
    }
  };

  const statusBadge = (status: number) => {
    const n = Number(status);
    const map: Record<number, { label: string; cls: string; Icon: any }> = {
      1: { label: "Requested", cls: "bg-amber-100 text-amber-800", Icon: Package },
      2: { label: "Sent", cls: "bg-blue-100 text-blue-800", Icon: Truck },
      3: { label: "Delivered", cls: "bg-emerald-100 text-emerald-800", Icon: PackageCheck },
    };
    const s = map[n] || map[1];
    const Icon = s.Icon;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${s.cls}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {s.label}
      </span>
    );
  };

  const Columns: any = [
    {
      title: "User",
      key: "user",
      render: (_: any, row: any) => (
        <div className="flex items-center">
          <div className="w-9 h-9 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {row?.user?.username ?? "—"}
            </div>
            {row?.user?.customer_id && (
              <div className="text-xs text-emerald-700">
                Customer ID:{" "}
                <span className="font-mono font-semibold">
                  {row.user.customer_id}
                </span>
              </div>
            )}
            <div className="text-xs text-gray-500">
              {row?.user?.first_name} {row?.user?.last_name}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Level",
      key: "level",
      render: (_: any, row: any) => (
        <span className="text-sm text-gray-800">
          {LEVEL_LABELS[Number(row?.level)] ?? "—"}
        </span>
      ),
    },
    {
      title: "Product",
      key: "quantity",
      sortable: true,
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center text-sm font-semibold text-gray-900">
            <Package className="w-4 h-4 mr-1 text-amber-600" />
            {row?.quantity} {productName(row?.level)}
          </span>
          {row?.can_edit_quantity && (
            <button
              type="button"
              onClick={() => editQuantity(row)}
              disabled={editingQty}
              title="Adjust quantity to availability"
              className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
    {
      title: "Delivery",
      key: "delivery",
      render: (_: any, row: any) => (
        <div className="text-xs text-gray-700 space-y-0.5 max-w-xs">
          {Number(row?.delivery_type) === 2 ? (
            <div className="flex items-start">
              <MapPin className="w-3.5 h-3.5 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
              <span className="break-words">Courier: {row?.delivery_address || "—"}</span>
            </div>
          ) : Number(row?.delivery_type) === 1 ? (
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
              Direct pickup: {row?.pickup_date || "—"}
            </div>
          ) : (
            <span className="text-gray-400">—</span>
          )}
          {row?.contact_number && (
            <div className="flex items-center text-gray-500">
              <Phone className="w-3.5 h-3.5 mr-1 text-gray-400" />
              {row.contact_number}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Requested",
      key: "requested_at",
      sortable: true,
      render: (_: any, row: any) => dateCell(row?.requested_at_formatted),
    },
    {
      title: "Sent",
      key: "sent_at",
      sortable: true,
      render: (_: any, row: any) => dateCell(row?.sent_at_formatted),
    },
    {
      title: "Delivered",
      key: "delivered_at",
      sortable: true,
      render: (_: any, row: any) => dateCell(row?.delivered_at_formatted),
    },
    {
      title: "Dispatch",
      key: "dispatch_method",
      render: (_: any, row: any) => {
        if (!row?.dispatch_label) {
          return <div className="text-sm text-gray-400">--</div>;
        }
        return (
          <div className="text-sm">
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                Number(row.dispatch_method) === 2
                  ? "bg-indigo-100 text-indigo-800"
                  : "bg-teal-100 text-teal-800"
              }`}
            >
              {row.dispatch_label}
            </span>
            {row?.dispatch_summary ? (
              <div className="text-xs text-gray-600 mt-1 whitespace-nowrap">
                {row.dispatch_summary}
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, row: any) => statusBadge(row?.status),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, row: any) => {
        const st = Number(row?.status);
        if (st === 1) {
          return (
            <button
              type="button"
              disabled={marking}
              onClick={() => confirmMarkSent(row)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              title="Mark as sent"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Mark as Sent
            </button>
          );
        }
        if (st === 2) {
          return (
            <button
              type="button"
              disabled={deliveringAdmin}
              onClick={() => confirmMarkDelivered(row)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 text-white"
              title="Mark as delivered (on the user's behalf)"
            >
              <PackageCheck className="w-3.5 h-3.5 mr-1.5" />
              Mark Delivered
            </button>
          );
        }
        return (
          <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-400">
            <PackageCheck className="w-3.5 h-3.5 mr-1.5" />
            Delivered
          </span>
        );
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-7 h-7 text-amber-600" />
              Plan Product
            </h1>
            <p className="mt-2 text-gray-600">
              Promoter plan product allocations (Energy Plus / Health Plus).
              Mark a batch as sent once it's dispatched — the user then confirms
              delivery from their app.
            </p>
          </div>
          {/* Exports exactly what is on screen: the status tab, the date
              filters, the search and the current sort. */}
          <button
            onClick={() =>
              exportBoxRequests({
                query: filter,
                exports: true,
                downloadFilename: "plan_product.xlsx",
              })
            }
            disabled={exportLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            {exportLoading ? "Exporting..." : "Export Excel"}
          </button>
        </div>
      </div>

      {sentRow && (
        <MarkSentModal
          row={sentRow}
          productName={productName(sentRow.level)}
          loading={marking}
          RequestError={markSentError}
          onSubmit={submitMarkSent}
          onClose={() => setSentRow(null)}
        />
      )}

      <FilterTab
        filter={filter}
        setFilter={setFilter}
        TABLE_FILTER={[
          "SEARCH",
          "BOX_REQUESTED_FROM",
          "BOX_REQUESTED_TO",
          "BOX_SENT_FROM",
          "BOX_SENT_TO",
          "BOX_DELIVERED_FROM",
          "BOX_DELIVERED_TO",
        ]}
      />

      {/* Status filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-sm text-gray-600">Status:</span>
        <button
          type="button"
          onClick={() =>
            setFilter((prv: any) => {
              const { status: _drop, ...rest } = prv.filter || {};
              return { ...prv, filter: rest, pageNo: 1 };
            })
          }
          className={`px-3 py-1 text-xs rounded-full border ${
            filter?.filter?.status === undefined
              ? "bg-amber-100 text-amber-800 border-amber-300"
              : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          All
        </button>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              setFilter((prv: any) => ({
                ...prv,
                filter: { ...(prv.filter || {}), status: opt.value },
                pageNo: 1,
              }))
            }
            className={`px-3 py-1 text-xs rounded-full border ${
              String(filter?.filter?.status) === opt.value
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <DataTable
          columns={Columns}
          data={data?.data ?? []}
          pageSize={filter.pageSize}
          currentPage={filter.pageNo}
          totalRecords={data?.pageInfo?.total_records ?? 0}
          onPageChange={(page: any) =>
            setFilter((prv) => ({ ...prv, pageNo: page }))
          }
          sortBy={filter.sortBy}
          sortDir={filter.sortDir}
          setSort={(sortData: any) => {
            setFilter((prv) => ({
              ...prv,
              sortBy: sortData.key ?? "",
              sortDir: sortData.sort ?? "",
            }));
          }}
          enableSerial={true}
          isLoading={loading}
          setPageSize={(pageSize: number) => {
            setFilter((prv) => ({ ...prv, pageNo: 1, pageSize: pageSize }));
          }}
        />
      </div>
    </div>
  );
}
