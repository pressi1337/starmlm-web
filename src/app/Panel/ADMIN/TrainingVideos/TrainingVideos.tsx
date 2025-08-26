import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Plus, Edit, Trash2, Eye, Calendar, GraduationCap, HelpCircle } from 'lucide-react';
import VideoModal from '@/components/VideoModal';
import QuizModal from '@/components/QuizModal';

export default function TrainingVideos() {
  const { trainingVideos, addVideo, updateVideo, deleteVideo, quizzes } = useData();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [selectedVideoForQuiz, setSelectedVideoForQuiz] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState('all');

  const itemsPerPage = 10;

  // Filter videos
  const filteredVideos = trainingVideos
    .filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           video.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDay = filterDay === 'all' || video.day?.toString() === filterDay;
      return matchesSearch && matchesDay;
    })
    .sort((a, b) => (a.day || 0) - (b.day || 0));

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVideos = filteredVideos.slice(startIndex, startIndex + itemsPerPage);

  const handleAddVideo = () => {
    setEditingVideo(null);
    setIsVideoModalOpen(true);
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setIsVideoModalOpen(true);
  };

  const handleDeleteVideo = (videoId) => {
    if (window.confirm('Are you sure you want to delete this training video?')) {
      deleteVideo(videoId, 'training');
    }
  };

  const handleSaveVideo = (videoData) => {
    if (editingVideo) {
      updateVideo(editingVideo.id, videoData, 'training');
    } else {
      addVideo({ ...videoData, type: 'training' }, 'training');
    }
    setIsVideoModalOpen(false);
    setEditingVideo(null);
  };

  const handleAddQuiz = (video) => {
    setSelectedVideoForQuiz(video);
    setIsQuizModalOpen(true);
  };

  const getVideoQuiz = (videoId) => {
    return quizzes.find(quiz => quiz.videoId === videoId);
  };

  const getDayDescription = (day) => {
    const descriptions = {
      1: 'Company Introduction',
      2: 'Company Plan & Vision',
      3: 'How to Work - Basics',
      4: 'How to Work - Advanced',
      5: 'Working Training - Level 1',
      6: 'Working Training - Level 2',
      7: 'Working Training - Level 3'
    };
    return descriptions[day] || `Day ${day} Training`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">7-Day Training Videos</h1>
            <p className="mt-2 text-gray-600">Manage the comprehensive 7-day training program</p>
          </div>
          <button
            onClick={handleAddVideo}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Training Video
          </button>
        </div>
      </div>

      {/* Training Program Overview */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Training Program Structure</h3>
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
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search training videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Day</label>
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Days</option>
                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                  <option key={day} value={day.toString()}>Day {day}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Training Videos Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Video Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quiz
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
              {paginatedVideos.map((video) => {
                const quiz = getVideoQuiz(video.id);
                return (
                  <tr key={video.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">{video.day}</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">Day {video.day}</div>
                          <div className="text-sm text-gray-500">{getDayDescription(video.day)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{video.title}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{video.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(video.showingDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {quiz ? (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-green-600 font-medium">
                            {quiz.questions.length} Question{quiz.questions.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddQuiz(video)}
                          className="inline-flex items-center px-2 py-1 border border-orange-300 rounded text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100"
                        >
                          <HelpCircle className="w-3 h-3 mr-1" />
                          Add Quiz
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        video.youtubeLink ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {video.youtubeLink ? 'YouTube' : 'Direct Upload'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => window.open(video.youtubeLink || '#', '_blank')}
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
                );
              })}
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
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredVideos.length)}</span> of{' '}
                  <span className="font-medium">{filteredVideos.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-green-50 border-green-500 text-green-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      } ${page === 1 ? 'rounded-l-md' : ''} ${page === totalPages ? 'rounded-r-md' : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSave={handleSaveVideo}
        video={editingVideo}
        type="training"
      />

      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        video={selectedVideoForQuiz}
      />
    </div>
  );
}