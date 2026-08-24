//@ts-nocheck
import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Sheet,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import Swal from "sweetalert2";
import { useActionCall, useGetCall, useQueryParams } from "@/hooks";
import { MODAL_OPEN } from "@/constants/others";
import { SERVICE } from "@/constants/services";
import DataTable from "@/components/DataTable";
import FilterTab from "@/components/FilterTab";
import Lib from "@/utils/Lib";
import PersonalDocumentFormModal from "@/components/FormModals/PersonalDocumentModal/PersonalDocumentFormModal";

const FILE_TYPE_PDF = 2;
const FILE_TYPE_EXCEL = 3;

const statusBadge = (isActive: number, label: string) => {
  const active = Number(isActive) === 1;
  const Icon = active ? Eye : EyeOff;
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
        active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
      }`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

const typeIcon = (fileType: number) => {
  if (Number(fileType) === FILE_TYPE_PDF)
    return { Icon: FileText, cls: "bg-red-50 text-red-600" };
  if (Number(fileType) === FILE_TYPE_EXCEL)
    return { Icon: Sheet, cls: "bg-emerald-50 text-emerald-600" };
  return { Icon: ImageIcon, cls: "bg-blue-50 text-blue-600" };
};

export default function PersonalDocuments() {
  const { defaultFilter, updateSearchParam, searchParams } = useQueryParams();
  const Modal = searchParams.get("Modal") || undefined;
  const [filter, setFilter] = useState({ ...defaultFilter });

  const { loading, setQuery, data } = useGetCall(
    SERVICE.COMPANY_PERSONAL_DOCUMENTS,
    { avoidFetch: true }
  );

  const { Patch: ChangeStatus } = useActionCall(
    SERVICE.COMPANY_PERSONAL_DOCUMENT_STATUS
  );
  const { Delete: DeleteItem } = useActionCall(
    SERVICE.COMPANY_PERSONAL_DOCUMENTS
  );

  // The API tells us whether the signed-in admin may change statuses, so the
  // control never appears for a sub-admin.
  const isSuperAdmin = Boolean(data?.meta?.is_super_admin);

  const refresh = () => setQuery(filter);

  useEffect(() => {
    refresh();
  }, [filter]);

  const confirmDelete = async (id: any) => {
    const swalT = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md shadow-sm ml-3",
        cancelButton:
          "bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-md shadow-sm",
        popup: "rounded-xl shadow-2xl border border-gray-200 bg-white p-6",
        title: "text-lg font-semibold text-gray-800",
      },
      buttonsStyling: false,
    });
    const result = await swalT.fire({
      title: "Delete this document?",
      text: "This cannot be undone.",
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

  const toggleActive = async (row: any) => {
    const next = Number(row.is_active) === 1 ? 0 : 1;
    const resp = await ChangeStatus({ id: row.id, is_active: next });
    if (resp) refresh();
  };

  const Columns: any = [
    {
      title: "Document",
      key: "title",
      render: (_: any, row: any) => {
        const { Icon, cls } = typeIcon(row.file_type);
        return (
          <div className="flex items-center gap-2">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${cls}`}
            >
              <Icon className="w-4 h-4" />
            </span>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {row.title}
              </div>
              <div className="text-xs text-gray-500">{row.type_label}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Added By",
      key: "added_by",
      render: (_: any, row: any) => (
        <div>
          <div className="text-sm text-gray-900">{row.added_by}</div>
          <div className="text-xs text-gray-500">{row.added_by_role}</div>
        </div>
      ),
    },
    {
      title: "File",
      key: "file_path",
      render: (_: any, row: any) => (
        <a
          href={Lib.CloudPath(row.file_path)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Open
        </a>
      ),
    },
    {
      title: "Added",
      key: "created_at",
      sortable: true,
      render: (_: any, row: any) => (
        <div className="text-sm text-gray-700 whitespace-nowrap">
          {row?.created_at_formatted ?? "-"}
        </div>
      ),
    },
    {
      title: "Status",
      key: "is_active",
      sortable: true,
      render: (_: any, row: any) =>
        isSuperAdmin ? (
          <button
            type="button"
            onClick={() => toggleActive(row)}
            title="Click to show / hide"
            className="focus:outline-none"
          >
            {statusBadge(row.is_active, row.status_label)}
          </button>
        ) : (
          // Sub-admins see the status but cannot change it.
          statusBadge(row.is_active, row.status_label)
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, row: any) =>
        row.can_modify ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                updateSearchParam({
                  options: {
                    Modal: MODAL_OPEN.PERSONAL_DOCUMENT_MODAL,
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
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-blue-600" />
              Company Personal Documents
            </h1>
            <p className="mt-2 text-gray-600">
              Internal documents (image, PDF or Excel). These are{" "}
              <b>never shown to users</b>.
              {!isSuperAdmin &&
                " Documents you add stay Inactive until the main admin activates them."}
            </p>
          </div>
          <button
            onClick={() =>
              updateSearchParam({
                options: { Modal: MODAL_OPEN.PERSONAL_DOCUMENT_MODAL },
              })
            }
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Document
          </button>
        </div>
      </div>

      <FilterTab
        filter={filter}
        setFilter={setFilter}
        TABLE_FILTER={["SEARCH"]}
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
            setFilter((prv) => ({ ...prv, pageNo: 1, pageSize }));
          }}
        />
      </div>

      {Modal === MODAL_OPEN.PERSONAL_DOCUMENT_MODAL && (
        <PersonalDocumentFormModal
          recoilApi={refresh}
          isSuperAdmin={isSuperAdmin}
        />
      )}
    </div>
  );
}
