import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import Swal from "sweetalert2";
import { useActionCall, useGetCall, useQueryParams } from "@/hooks";
import { MODAL_OPEN } from "@/constants/others";
import { SERVICE } from "@/constants/services";
import DataTable from "@/components/DataTable";
import FilterTab from "@/components/FilterTab";
import UIHelpers from "@/utils/UIhelper";
import Lib from "@/utils/Lib";
import CompanyDocumentFormModal from "@/components/FormModals/CompanyDocumentModal/CompanyDocumentFormModal";

const FILE_TYPE_PDF = 2;

const statusBadge = (active: number | boolean) => {
  const isActive = Number(active) === 1;
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
        isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
      }`}
    >
      {isActive ? (
        <Eye className="w-3 h-3 mr-1" />
      ) : (
        <EyeOff className="w-3 h-3 mr-1" />
      )}
      {isActive ? "Shown" : "Hidden"}
    </span>
  );
};

export default function CompanyDocuments() {
  const { defaultFilter, updateSearchParam, searchParams } = useQueryParams();
  const Modal = searchParams.get("Modal") || undefined;
  const [filter, setFilter] = useState({ ...defaultFilter });

  const { loading, setQuery, data } = useGetCall(SERVICE.COMPANY_DOCUMENTS, {
    avoidFetch: true,
  });

  // Master switch: whether the "Company Docs" menu appears in the user app at
  // all, independent of how many documents are published.
  const {
    data: menuData,
    loading: menuLoading,
    fetchApi: refetchMenus,
  } = useGetCall(SERVICE.MENU_SETTINGS);
  const { Post: saveMenu, loading: savingMenu } = useActionCall(
    SERVICE.MENU_SETTINGS
  );

  const docsMenu = (menuData?.data ?? []).find(
    (m: any) => m.key === "company_docs"
  );
  const menuVisible = Boolean(docsMenu?.is_visible);

  const toggleMenu = async () => {
    const resp = await saveMenu({
      key: "company_docs",
      is_visible: menuVisible ? 0 : 1,
    });
    if (resp) refetchMenus({});
  };

  const { Patch: ToggleStatus, loading: togglingStatus } = useActionCall(
    SERVICE.COMPANY_DOCUMENT_STATUS_UPDATE
  );
  const { Delete: DeleteItem } = useActionCall(SERVICE.COMPANY_DOCUMENTS);

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
      title: "Delete this document?",
      text: "Users will no longer see it in Company Docs.",
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
      title: "Document",
      key: "title",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              Number(row.file_type) === FILE_TYPE_PDF
                ? "bg-red-50 text-red-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {Number(row.file_type) === FILE_TYPE_PDF ? (
              <FileText className="w-4 h-4" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
          </span>
          <div>
            <div className="text-sm font-medium text-gray-900">{row.title}</div>
            <div className="text-xs text-gray-500">{row.type_label}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Preview",
      key: "file_path",
      render: (_: any, row: any) => (
        <a
          href={Lib.CloudPath(row.file_path)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
          title="Open in a new tab (admin only)"
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
      render: (_: any, row: any) => (
        <button
          type="button"
          onClick={() => handleToggleActive(row)}
          disabled={togglingStatus}
          title="Click to show / hide"
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
                  Modal: MODAL_OPEN.COMPANY_DOCUMENT_MODAL,
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
              <FileText className="w-7 h-7 text-blue-600" />
              Company Documents
            </h1>
            <p className="mt-2 text-gray-600">
              Images and PDFs users can view under "Company Docs". Hidden
              documents stay in the list here but disappear for users.
            </p>
          </div>
          <button
            onClick={() =>
              updateSearchParam({
                options: { Modal: MODAL_OPEN.COMPANY_DOCUMENT_MODAL },
              })
            }
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Document
          </button>
        </div>
      </div>

      {/* Master menu switch */}
      <div className="mb-6 bg-white shadow-sm rounded-xl border border-gray-200 p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            "Company Docs" menu in the user app
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {menuVisible
              ? "Users can see the Company Docs menu."
              : "The menu is hidden — users won't see Company Docs at all, even if documents are published."}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleMenu}
          disabled={savingMenu || menuLoading}
          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
            menuVisible
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {menuVisible ? (
            <Eye className="w-4 h-4 mr-2" />
          ) : (
            <EyeOff className="w-4 h-4 mr-2" />
          )}
          {menuLoading
            ? "Loading..."
            : savingMenu
            ? "Saving..."
            : menuVisible
            ? "Menu Shown"
            : "Menu Hidden"}
        </button>
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
            setFilter((prv) => ({ ...prv, pageNo: 1, pageSize: pageSize }));
          }}
        />
      </div>

      {Modal === MODAL_OPEN.COMPANY_DOCUMENT_MODAL && (
        <CompanyDocumentFormModal recoilApi={refresh} />
      )}
    </div>
  );
}
