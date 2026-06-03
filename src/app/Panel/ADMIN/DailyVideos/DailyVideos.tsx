import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  CopyPlus,
  Video as VideoIcon,
} from "lucide-react";
import { useActionCall, useGetCall, useQueryParams } from "@/hooks";
import { MODAL_OPEN, ROLE } from "@/constants/others";
import { useAuth } from "@/context/AuthContext";
import DailyVideoFormModal from "@/components/FormModals/DailyVideoModal/DailyVideoFormModal";
import { SERVICE } from "@/constants/services";
import DataTable from "@/components/DataTable";
import UIHelpers from "@/utils/UIhelper";
import Swal from "sweetalert2";
import FilterTab from "@/components/FilterTab";
import Lib from "@/utils/Lib";

export default function DailyVideos() {
  const { role } = useAuth();
  // Delete is super-admin only — sub-admin can view/create/edit but not remove.
  const canDelete = role === ROLE.SUPER_ADMIN;
  const Columns: any = [
    {
      title: "Video",
      key: "id",
      sortable: true,
      render: (index: any, row: any) => (
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-yellow-600 rounded-lg flex items-center justify-center">
            <a
              href={
                row?.video_path
                  ? Lib.CloudPath(row?.video_path)
                  : row?.youtube_link
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <VideoIcon className="w-6 h-6 text-white" />
            </a>
          </div>
        </div>
      ),
    },
    {
      title: "Title & Description",
      key: "title",
      render: (index: any, row: any) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {UIHelpers.truncateText(row.title, 60)}
          </div>
          <div className="text-sm text-gray-500 max-w-xs truncate">
            {UIHelpers.truncateText(row.description, 60)}
          </div>
        </div>
      ),
    },
    {
      title: "Showing Date",
      key: "showing_date",
      dataIndex: "showing_date",
      sortable: true,
      render: (index: any, row: any) => (
        <div className="flex items-center text-sm text-gray-900">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          {row.showing_date ? UIHelpers.DateFormat(row.showing_date) : "—"}
        </div>
      ),
    },
    {
      title: "Source",
      key: "video_path",
      render: (index: any, row: any) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            row.video_path
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.video_path ? "Direct Upload" : "YouTube"}
        </span>
      ),
    },
    {
      // On/off switch for the single "default new-user video". Turning one on
      // turns every other off (enforced server-side); the list refreshes so
      // the change is reflected across rows.
      title: "Default",
      key: "is_default",
      render: (index: any, row: any) => {
        const on = Number(row?.is_default) === 1;
        return (
          <button
            type="button"
            role="switch"
            aria-checked={on}
            disabled={defaultUpdating}
            onClick={() => handleToggleDefault(row)}
            title={
              on
                ? "Default new-user video — click to unset"
                : "Set as the default video shown to brand-new users"
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              on ? "bg-amber-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                on ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        );
      },
    },
    {
      title: "Action",
      key: "video_path",
      render: (index: any, row: any) => (
        <div className="flex items-center justify-start space-x-2">
          <button
            onClick={() =>
              updateSearchParam({
                options: {
                  Modal: MODAL_OPEN.DAILY_VIDEO_MODAL,
                  Duplicate: row.id,
                },
              })
            }
            className="text-blue-600 hover:text-blue-900 p-1"
            title="View Video"
          >
            <CopyPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              updateSearchParam({
                options: { Modal: MODAL_OPEN.DAILY_VIDEO_MODAL, Edit: row.id },
              })
            }
            className="text-indigo-600 hover:text-indigo-900 p-1"
            title="Edit Video"
          >
            <Edit className="w-4 h-4" />
          </button>
          {canDelete && (
            <button
              onClick={() => ConfirmDeleteModal(row.id)}
              className="text-red-600 hover:text-red-900 p-1"
              title="Delete Video"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];
  const { defaultFilter, updateSearchParam, searchParams } = useQueryParams();
  const Modal = searchParams.get("Modal") || undefined;

  const [filter, setFilter] = useState(defaultFilter);

  const [open, setOpen] = useState(false);

  const { loading, setQuery, data } = useGetCall(SERVICE.DAILYVIDEOS, {
    avoidFetch: true,
  });

  const { loading: deleteLoading, Delete: DeleteDailyVideo } = useActionCall(
    SERVICE.DAILYVIDEOS
  );
  const { loading: defaultUpdating, Patch: SetDefaultVideo } = useActionCall(
    SERVICE.DAILYVIDEO_DEFAULT_UPDATE
  );
  const DailyVideoAPI = () => {
    setQuery(filter);
  };
  useEffect(() => {
    DailyVideoAPI();
  }, [filter]);

  // Toggle which video is the default for new users. Only one can be on at a
  // time — the backend clears the others — so refresh the list after a change.
  const handleToggleDefault = async (row: any) => {
    const next = Number(row?.is_default) === 1 ? 0 : 1;
    const resp = await SetDefaultVideo({ id: row.id, is_default: next });
    if (resp) DailyVideoAPI();
  };

  const ConfirmDeleteModal = async (value: string) => {
    const swalWithTailwind = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md shadow-sm transition-all duration-200 ml-3",
        cancelButton:
          "bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-md shadow-sm transition-all duration-200",
        popup:
          "rounded-xl shadow-2xl border border-gray-200 bg-white p-6 dark:bg-gray-800 dark:border-gray-700",
        title: "text-lg font-semibold text-gray-800 dark:text-gray-100",
        htmlContainer: "text-gray-600 dark:text-gray-300",
      },
      buttonsStyling: false,
    });

    swalWithTailwind
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
        padding: "2em",
        backdrop: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const resp = await DeleteDailyVideo(value);
          if (resp) {
            DailyVideoAPI();
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: "Your record has been deleted successfully.",
              confirmButtonText: "OK",
              customClass: {
                confirmButton:
                  "bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-all duration-200",
              },
            });
          }
        }
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Daily Information Videos
            </h1>
            <p className="mt-2 text-gray-600">
              Manage daily videos that users must watch first
            </p>
          </div>
          <button
            onClick={() =>
              updateSearchParam({
                options: { Modal: MODAL_OPEN.DAILY_VIDEO_MODAL },
              })
            }
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-yellow-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Video
          </button>
        </div>
      </div>

      {/* Filters and Search */}
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
      {Modal == MODAL_OPEN.DAILY_VIDEO_MODAL && (
        <DailyVideoFormModal recoilApi={DailyVideoAPI} />
      )}
    </div>
  );
}
