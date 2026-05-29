import { useState, useEffect } from "react";
import {
  MessageSquare,
  CheckCircle2,
  Mail,
  Inbox,
  CheckCheck,
  User as UserIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import { useActionCall, useGetCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";
import DataTable from "@/components/DataTable";
import FilterTab from "@/components/FilterTab";
import UIHelpers from "@/utils/UIhelper";

const READ_FILTER_OPTIONS = [
  { value: "0", label: "Unread" },
  { value: "1", label: "Read" },
];

/**
 * Admin Suggestions — read-only listing across every user with a single
 * action: Mark as Read. Once read, the row stays visible but the action
 * disables (idempotent on the server too).
 */
export default function Suggestions() {
  const { defaultFilter } = useQueryParams();
  const [filter, setFilter] = useState({
    ...defaultFilter,
    sortBy: "created_at",
    sortDir: "desc",
  });

  const { loading, setQuery, data } = useGetCall(SERVICE.ADMIN_SUGGESTIONS, {
    avoidFetch: true,
  });
  const { Patch: markRead, loading: marking } = useActionCall(
    SERVICE.ADMIN_SUGGESTIONS_MARK_READ
  );

  const refresh = () => setQuery(filter);
  useEffect(() => {
    refresh();
  }, [filter]);

  const confirmMarkRead = async (row: any) => {
    if (Number(row.is_read) === 1) return;
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
      title: "Mark as read?",
      text: "The user will no longer be able to edit or delete this suggestion. A new slot will free up for them to send another.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, mark read",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      const resp = await markRead({ id: row.id }, "Marked as read");
      if (resp) refresh();
    }
  };

  const statusBadge = (isRead: number | boolean) => {
    const read = Number(isRead) === 1;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
          read
            ? "bg-emerald-100 text-emerald-800"
            : "bg-amber-100 text-amber-800"
        }`}
      >
        {read ? (
          <CheckCheck className="w-3 h-3 mr-1" />
        ) : (
          <Mail className="w-3 h-3 mr-1" />
        )}
        {read ? "Read" : "Unread"}
      </span>
    );
  };

  const Columns: any = [
    {
      title: "User",
      key: "user",
      render: (_: any, row: any) => (
        <div className="flex items-center">
          <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
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
      title: "Suggestion",
      key: "content",
      render: (_: any, row: any) => (
        <div
          className="text-sm text-gray-800 max-w-2xl whitespace-pre-line break-words"
          title={row.content}
        >
          {row.content}
        </div>
      ),
    },
    {
      title: "Submitted",
      key: "created_at",
      sortable: true,
      render: (_: any, row: any) => (
        <div className="text-sm text-gray-700 whitespace-nowrap">
          {UIHelpers.DateFormat(row?.created_at)}
        </div>
      ),
    },
    {
      title: "Status",
      key: "is_read",
      render: (_: any, row: any) => (
        <div>
          {statusBadge(row?.is_read)}
          {Number(row?.is_read) === 1 && row?.read_at && (
            <div className="text-[10px] text-gray-500 mt-1 whitespace-nowrap">
              {UIHelpers.DateFormat(row.read_at)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, row: any) => {
        const read = Number(row?.is_read) === 1;
        return (
          <button
            type="button"
            disabled={read || marking}
            onClick={() => confirmMarkRead(row)}
            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md ${
              read
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
            title={read ? "Already marked read" : "Mark as read"}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            {read ? "Read" : "Mark as Read"}
          </button>
        );
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-blue-600" />
          User Suggestions
        </h1>
        <p className="mt-2 text-gray-600">
          Read-only inbox of user suggestions. Mark as read once you've reviewed
          a suggestion — the user can then send another.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Inbox className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "..." : data?.stats?.total ?? 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Unread</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "..." : data?.stats?.unread ?? 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <CheckCheck className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Read</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "..." : data?.stats?.read ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <FilterTab
        filter={filter}
        setFilter={setFilter}
        TABLE_FILTER={["SEARCH"]}
      />

      {/* Lightweight inline read/unread toggle. FilterTab doesn't carry a
          generic "is_read" option, so we slot one in here. */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600">Status:</span>
        <button
          type="button"
          onClick={() =>
            setFilter((prv: any) => {
              // Remove the is_read key explicitly — just spreading the
              // existing filter would carry over the previous Unread/Read
              // selection, which was the bug here.
              const { is_read: _drop, ...rest } = prv.filter || {};
              return {
                ...prv,
                filter: rest,
                pageNo: 1,
              };
            })
          }
          className={`px-3 py-1 text-xs rounded-full border ${
            filter?.filter?.is_read === undefined
              ? "bg-blue-100 text-blue-800 border-blue-300"
              : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          All
        </button>
        {READ_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              setFilter((prv: any) => ({
                ...prv,
                filter: { ...(prv.filter || {}), is_read: opt.value },
                pageNo: 1,
              }))
            }
            className={`px-3 py-1 text-xs rounded-full border ${
              String(filter?.filter?.is_read) === opt.value
                ? "bg-blue-100 text-blue-800 border-blue-300"
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
