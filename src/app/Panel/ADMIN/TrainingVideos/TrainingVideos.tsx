import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  HelpCircle,
  Eye,
} from "lucide-react";
import { useActionCall, useGetCall, useQueryParams } from "@/hooks";
import { MODAL_OPEN } from "@/constants/others";
import TrainingVideoFormModal from "@/components/FormModals/TrainingVideoModal/TrainingVideoFormModal";
import { SERVICE } from "@/constants/services";
import DataTable from "@/components/DataTable";
import UIHelpers from "@/utils/UIhelper";
import Swal from "sweetalert2";
import FilterTab from "@/components/FilterTab";

export default function TrainingVideos() {
  const Columns: any = [
    {
      title: "Video",
      key: "id",
      sortable: true,
      render: (index: any, row: any) => {
        console.log(row);
        return (
        <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">
                {row.day}
              </span>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                Day {row.day}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      title: "Title & Description",
      key: "title",
      render: (index: any, row: any) => (
        <div>
          <div className="text-sm font-medium text-gray-900" title={row.title}>
            {UIHelpers.truncateText(row.title, 100)}
          </div>
          <div className="text-sm text-gray-500 max-w-xs truncate" title={row.description}>
            {UIHelpers.truncateText(row.description, 100)}
          </div>
        </div>
      ),
    },
    {
      title: "Day",
      key: "day",
      sortable: true,
      render: (index: any, row: any) => {
        const dayMap: { [key: string]: string } = {
          '1': 'Monday',
          '2': 'Tuesday',
          '3': 'Wednesday',
          '4': 'Thursday',
          '5': 'Friday',
          '6': 'Saturday',
          '7': 'Sunday'
        };
        return (
          <div className="flex items-center text-sm text-gray-900">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            {dayMap[row.day] || row.day}
          </div>
        );
      },
    },
    {
      title: "Quiz",
      key: "quiz",
      render: (index: any, row: any) => (
        <div className="flex items-center">
          {row.quiz ? (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-600 font-medium">
                {row.quiz.questions?.length || 0} Question{row.quiz.questions?.length !== 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement handleAddQuiz function
                // handleAddQuiz(row);
              }}
              className="inline-flex items-center px-2 py-1 border border-orange-300 rounded text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100"
            >
              <HelpCircle className="w-3 h-3 mr-1" />
              Add Quiz
            </button>
          )}
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
      title: "Action",
      key: "video_path",
      render: (index: any, row: any) => (
        <div className="flex items-center justify-start space-x-2">
           <button
            onClick={() =>
              window.open(row.youtube_link || "#", "_blank")
            }
            className="text-blue-600 hover:text-blue-900 p-1"
            title="View Video"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              updateSearchParam({
                options: { Modal: MODAL_OPEN.TRAINING_VIDEO_MODAL, Edit: row.id },
              })
            }
            className="text-indigo-600 hover:text-indigo-900 p-1"
            title="Edit Video"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => ConfirmDeleteModal(row.id)}
            className="text-red-600 hover:text-red-900 p-1"
            title="Delete Video"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const { defaultFilter, updateSearchParam, searchParams } = useQueryParams();
  const Modal = searchParams.get("Modal") || undefined;
  const [filter, setFilter] = useState(defaultFilter);

  const { loading, setQuery, data } = useGetCall(SERVICE.TRAININGVIDEOS, {
    avoidFetch: true,
  });

  const { loading: deleteLoading, Delete: DeleteTrainingVideo } = useActionCall(
    SERVICE.TRAININGVIDEOS
  );

  const TrainingVideoAPI = () => {
    setQuery(filter);
  };

  useEffect(() => {
    TrainingVideoAPI();
  }, [filter]);

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
          const resp = await DeleteTrainingVideo(value);
          if (resp) {
            TrainingVideoAPI();
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
              7-Day Training Videos
            </h1>
            <p className="mt-2 text-gray-600">
              Manage the comprehensive 7-day training program
            </p>
          </div>
          <button
            onClick={() =>
              updateSearchParam({
                options: { Modal: MODAL_OPEN.TRAINING_VIDEO_MODAL },
              })
            }
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Training Video
          </button>
        </div>
      </div>

      {/* Training Program Overview */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          7-Day Training Program Structure
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-green-600">Days 1-2</div>
            <div className="text-gray-900">Company Introduction & Plan</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-blue-600">Days 3-4</div>
            <div className="text-gray-900">How to Work</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-purple-600">Days 5-7</div>
            <div className="text-gray-900">Working Training</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-orange-600">Each Day</div>
            <div className="text-gray-900">1 Quiz Question</div>
          </div>
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
          data={data?.data || []}
          loading={loading}
          filter={filter}
          setFilter={setFilter}
          totalCount={data?.total || 0}
          searchPlaceholder="Search training videos..."
          showSearch={true}
          showPagination={true}
        />
      </div>

      {/* Training Video Form Modal */}
      {Modal == MODAL_OPEN.TRAINING_VIDEO_MODAL && <TrainingVideoFormModal  recoilApi={TrainingVideoAPI}/>}
    </div>
  );
}
