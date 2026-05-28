import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  HelpCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { useActionCall, useGetCall, useQueryParams } from "@/hooks";
import { MODAL_OPEN } from "@/constants/others";
import { SERVICE } from "@/constants/services";
import DataTable from "@/components/DataTable";
import FilterTab from "@/components/FilterTab";
import UIHelpers from "@/utils/UIhelper";
import SupportHelpFormModal from "@/components/FormModals/SupportHelpModal/SupportHelpFormModal";

const statusBadge = (active: number | boolean) => {
  const isActive = Number(active) === 1;
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
        isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {isActive ? (
        <CheckCircle className="w-3 h-3 mr-1" />
      ) : (
        <XCircle className="w-3 h-3 mr-1" />
      )}
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

export default function SupportHelp() {
  const { defaultFilter, updateSearchParam, searchParams } = useQueryParams();
  const Modal = searchParams.get("Modal") || undefined;
  const [filter, setFilter] = useState({
    ...defaultFilter,
    // Users see id ASC; admin list mirrors that so the order on screen matches
    // what users see — easier to QA the accordion ordering.
    sortBy: "id",
    sortDir: "asc",
  });

  const { loading, setQuery, data } = useGetCall(SERVICE.SUPPORT_HELPS, {
    avoidFetch: true,
  });

  const { Patch: ToggleStatus, loading: togglingStatus } = useActionCall(
    SERVICE.SUPPORT_HELP_STATUS_UPDATE
  );
  const { Delete: DeleteItem } = useActionCall(SERVICE.SUPPORT_HELPS);

  const refresh = () => setQuery(filter);

  useEffect(() => {
    refresh();
  }, [filter]);

  const confirmDelete = async (id: string | number) => {
    const swalT = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md shadow-sm ml-3",
        cancelButton:
          "bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-md shadow-sm",
        popup: "rounded-xl shadow-2xl border border-gray-200 bg-white p-6",
        title: "text-lg font-semibold text-gray-800",
        htmlContainer: "text-gray-600",
      },
      buttonsStyling: false,
    });
    const result = await swalT.fire({
      title: "Delete this Q&A?",
      text: "Users will no longer see this question in the help screen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      const resp = await DeleteItem(id);
      if (resp) refresh();
    }
  };

  const handleToggleActive = async (row: any) => {
    const next = Number(row.is_active) === 1 ? 0 : 1;
    const resp = await ToggleStatus({ id: row.id, is_active: next });
    if (resp) refresh();
  };

  const Columns: any = [
    {
      title: "Order",
      key: "id",
      sortable: true,
      render: (_: any, row: any) => (
        <span className="text-sm font-mono text-gray-600">#{row.id}</span>
      ),
    },
    {
      title: "Question",
      key: "question",
      render: (_: any, row: any) => (
        <div className="text-sm font-medium text-gray-900 max-w-xl">
          {row.question}
        </div>
      ),
    },
    {
      title: "Answer",
      key: "answer",
      render: (_: any, row: any) => (
        <div
          className="text-sm text-gray-600 max-w-xl whitespace-pre-line"
          title={row.answer}
        >
          {UIHelpers.truncateText(row.answer, 140)}
        </div>
      ),
    },
    {
      title: "Created",
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
      key: "is_active",
      render: (_: any, row: any) => (
        <button
          type="button"
          onClick={() => handleToggleActive(row)}
          disabled={togglingStatus}
          title="Click to toggle"
          className="focus:outline-none"
        >
          {statusBadge(row?.is_active)}
        </button>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, row: any) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() =>
              updateSearchParam({
                options: {
                  Modal: MODAL_OPEN.SUPPORT_HELP_MODAL,
                  Edit: row.id,
                },
              })
            }
            className="text-indigo-600 hover:text-indigo-900 p-1"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => confirmDelete(row.id)}
            className="text-red-600 hover:text-red-900 p-1"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-7 h-7 text-blue-600" />
              Support &amp; Help
            </h1>
            <p className="mt-2 text-gray-600">
              Manage the FAQ accordion users see. Items are shown in the order
              you add them.
            </p>
          </div>
          <button
            onClick={() =>
              updateSearchParam({
                options: { Modal: MODAL_OPEN.SUPPORT_HELP_MODAL },
              })
            }
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Q&amp;A
          </button>
        </div>
      </div>

      <FilterTab filter={filter} setFilter={setFilter} TABLE_FILTER={["SEARCH"]} />

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

      {Modal === MODAL_OPEN.SUPPORT_HELP_MODAL && (
        <SupportHelpFormModal recoilApi={refresh} />
      )}
    </div>
  );
}
