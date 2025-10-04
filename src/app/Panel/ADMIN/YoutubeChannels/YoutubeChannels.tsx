//@ts-nocheck
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Plus, Edit, Trash2, ExternalLink, Youtube } from 'lucide-react';
import { useQueryParams } from '@/hooks';
import { MODAL_OPEN } from "@/constants/others";
import YoutubeFormModal from '@/components/FormModals/YoutubeModal/YoutubeFormModal';
import VideoModal from '@/components/VideoModal';

export default function YoutubeChannels() {
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
  const { youtubeChannels, setYoutubeChannels } = useData();
  const [channels, setChannels] = useState(youtubeChannels);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: ''
  });

  const handleAddChannel = () => {
    setEditingChannel(null);
    setFormData({ name: '', url: '', description: '' });
    setIsModalOpen(true);
  };

  const handleEditChannel = (channel) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      url: channel.url,
      description: channel.description
    });
    setIsModalOpen(true);
  };

  const handleDeleteChannel = (channelId) => {
    if (window.confirm('Are you sure you want to delete this YouTube channel?')) {
      const newChannels = channels.filter(c => c.id !== channelId);
      setChannels(newChannels);
      setYoutubeChannels(newChannels);
    }
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
    
  //   if (editingChannel) {
  //     const newChannels = channels.map(c => 
  //       c.id === editingChannel.id 
  //         ? { ...c, ...formData }
  //         : c
  //     );
  //     setChannels(newChannels);
  //     setYoutubeChannels(newChannels);
  //   } else {
  //     const newChannel = {
  //       id: Date.now().toString(),
  //       ...formData
  //     };
  //     const newChannels = [...channels, newChannel];
  //     setChannels(newChannels);
  //     setYoutubeChannels(newChannels);
  //   }
    
  //   setIsModalOpen(false);
  //   setEditingChannel(null);
  //   setFormData({ name: '', url: '', description: '' });
  // };
  const handleSubmit = (videoData) => {
    setIsModalOpen(false);
    setEditingChannel(null);
  };

  const isValidYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">YouTube Channels</h1>
            <p className="mt-2 text-gray-600">Manage YouTube channels for user reference</p>
          </div>
          <button
            onClick={() =>
              updateSearchParam({
                options: { Modal: MODAL_OPEN.YOUTUBE_MODAL },
              })
            }
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Channel
          </button>
        </div>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel) => (
          <div key={channel.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Youtube className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(channel.url, '_blank')}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Open Channel"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditChannel(channel)}
                    className="text-indigo-600 hover:text-indigo-800 p-1"
                    title="Edit Channel"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteChannel(channel.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete Channel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{channel.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{channel.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  <Youtube className="w-3 h-3 mr-1" />
                  YouTube
                </span>
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Visit Channel →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {channels.length === 0 && (
        <div className="text-center py-12">
          <Youtube className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No YouTube channels</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first YouTube channel.
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddChannel}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Channel
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {Modal == MODAL_OPEN.YOUTUBE_MODAL && <YoutubeFormModal />}
      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSubmit}
        video={editingChannel}
        type="youtube"
      />
    </div>
  );
}