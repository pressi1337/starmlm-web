import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Video as VideoIcon,
} from "lucide-react";
import VideoModal from "@/components/VideoModal";
import { useQueryParams } from "@/hooks";
import { MODAL_OPEN } from "@/constants/others";
import DailyVideoFormModal from "@/components/FormModals/DailyVideoModal/DailyVideoFormModal";

export default function DailyVideos() {
  const { extractFilterOnQuery, updateSearchParam, searchParams } =
    useQueryParams();
  const Modal = searchParams.get("Modal") || undefined;

  const [filter, setFilter] = useState({
    filter: extractFilterOnQuery([]),
    pageNo: 1,
    pageSize: 10,
    sortDir: "",
    sortBy: "",
    search: "",
  });

  const { dailyVideos, addVideo, updateVideo, deleteVideo } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("showingDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const itemsPerPage = 10;

  // Filter and sort videos
  const filteredVideos = dailyVideos
    .filter(
      (video) =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVideos = filteredVideos.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleAddVideo = () => {
    setEditingVideo(null);
    setIsModalOpen(true);
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setIsModalOpen(true);
  };

  const handleDeleteVideo = (videoId) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      deleteVideo(videoId, "daily");
    }
  };

  const handleSaveVideo = (videoData) => {
    if (editingVideo) {
      updateVideo(editingVideo.id, videoData, "daily");
    } else {
      addVideo({ ...videoData, type: "daily" }, "daily");
    }
    setIsModalOpen(false);
    setEditingVideo(null);
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
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Video
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="showingDate">Date</option>
                <option value="title">Title</option>
                <option value="type">Type</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title & Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Showing Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedVideos.map((video) => (
                <tr key={video.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <VideoIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {video.title}
                    </div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {video.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(video.showingDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        video.youtubeLink
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {video.youtubeLink ? "YouTube" : "Direct Upload"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() =>
                          window.open(video.youtubeLink || "#", "_blank")
                        }
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View Video"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditVideo(video)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Edit Video"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete Video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(startIndex + itemsPerPage, filteredVideos.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredVideos.length}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        } ${page === 1 ? "rounded-l-md" : ""} ${
                          page === totalPages ? "rounded-r-md" : ""
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Modal */}

      {/* Form Modals */}
      {Modal == MODAL_OPEN.DAILY_VIDEO_MODAL && <DailyVideoFormModal />}
      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVideo}
        video={editingVideo}
        type="daily"
      />
    </div>
  );
}
