import { useState, useEffect } from "react";
import { Eye, ClipboardList } from "lucide-react";
import { useGetCall, useQueryParams } from "@/hooks";
import { MODAL_OPEN } from "@/constants/others";
import { SERVICE } from "@/constants/services";
import DataTable from "@/components/DataTable";
import FilterTab from "@/components/FilterTab";
import PromotionLogDetailModal from "@/components/FormModals/PromotionLogModal/PromotionLogDetailModal";

const statusBadge = (label: string, status: number) => {
  const map: Record<number, string> = {
    1: "bg-amber-100 text-amber-800",
    2: "bg-green-100 text-green-800",
    3: "bg-gray-200 text-gray-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
        map[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {label}
    </span>
  );
};

export default function PromotionLogs() {
  const { defaultFilter, updateSearchParam, searchParams } = useQueryParams();
  const Modal = searchParams.get("Modal") || undefined;
  const [filter, setFilter] = useState({ ...defaultFilter });

  const { loading, setQuery, data } = useGetCall(SERVICE.PROMOTION_QUIZ_LOGS, {
    avoidFetch: true,
  });

  const refresh = () => setQuery(filter);

  useEffect(() => {
    refresh();
  }, [filter]);

  const openDetail = (id: number | string) =>
    updateSearchParam({
      options: { Modal: MODAL_OPEN.PROMOTION_LOG_MODAL, View: id },
    });

  const Columns: any = [
    {
      title: "User",
      key: "username",
      render: (_: any, row: any) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{row.username}</div>
          <div className="text-xs text-gray-500">
            {row.customer_id ? `${row.customer_id} • ` : ""}
            {row.mobile ?? ""}
          </div>
        </div>
      ),
    },
    {
      title: "Video",
      key: "promotion_video_title",
      render: (_: any, row: any) => (
        <div className="text-sm text-gray-700 max-w-xs truncate" title={row.promotion_video_title}>
          {row.promotion_video_title ?? "-"}
        </div>
      ),
    },
    {
      title: "Level",
      key: "promoter_level",
      render: (_: any, row: any) => (
        <span className="text-sm text-gray-700">
          {row.promoter_level === null ? "-" : `P${row.promoter_level}`}
        </span>
      ),
    },
    {
      title: "Session / Set",
      key: "session_type",
      render: (_: any, row: any) => (
        <span className="text-sm text-gray-700">
          {row.session_label} • Set {row.set_no}
          {row.attempt_no > 1 ? (
            <span className="ml-1 text-xs text-gray-400">(try {row.attempt_no})</span>
          ) : null}
        </span>
      ),
    },
    {
      title: "Score",
      key: "correct_count",
      sortable: true,
      render: (_: any, row: any) => (
        <span className="text-sm text-gray-900">
          {row.correct_count}/{row.total_questions}{" "}
          <span className="text-xs text-gray-500">({row.percentage}%)</span>
        </span>
      ),
    },
    {
      title: "Earned",
      key: "earned_amount",
      sortable: true,
      render: (_: any, row: any) => (
        <span className="text-sm font-medium text-gray-900">₹{row.earned_amount}</span>
      ),
    },
    {
      title: "Outcome",
      key: "status",
      render: (_: any, row: any) => statusBadge(row.status_label, row.status),
    },
    {
      title: "Attempted At",
      key: "attempted_at",
      sortable: true,
      render: (_: any, row: any) => (
        <span className="text-sm text-gray-700 whitespace-nowrap">
          {row.attempted_at}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, row: any) => (
        <button
          onClick={() => openDetail(row.id)}
          className="text-indigo-600 hover:text-indigo-900 p-1"
          title="View full details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-blue-600" />
          Promotion Log
        </h1>
        <p className="mt-2 text-gray-600">
          Audit of every promotion-video quiz attempt — what each user answered,
          their score, earnings, and whether they confirmed or retried.
        </p>
      </div>

      <FilterTab
        filter={filter}
        setFilter={setFilter}
        TABLE_FILTER={["SEARCH", "FROM_DATE", "TO_DATE"]}
      />

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

      {Modal === MODAL_OPEN.PROMOTION_LOG_MODAL && <PromotionLogDetailModal />}
    </div>
  );
}
