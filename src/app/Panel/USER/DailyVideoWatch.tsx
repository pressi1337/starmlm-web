import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Play, CheckCircle, Clock, Calendar } from 'lucide-react';

interface DailyVideoWatchProps {
  onVideoWatched: () => void;
}

export default function DailyVideoWatch({ onVideoWatched }: DailyVideoWatchProps) {
  const { dailyVideos } = useData();
  const { user } = useAuth();
  const [currentVideo, setCurrentVideo] = useState(null);
  const [hasWatched, setHasWatched] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    // Get today's video
    const today = new Date().toISOString().split('T')[0];
    const todayVideo = dailyVideos.find(video => video.showingDate === today);
    
    if (todayVideo) {
      setCurrentVideo(todayVideo);
      
      // Check if already watched
      const watchedVideos = JSON.parse(localStorage.getItem(`watchedVideos_${user?.id}`) || '[]');
      if (watchedVideos.includes(todayVideo.id)) {
        setHasWatched(true);
        onVideoWatched();
      }
    }
  }, [dailyVideos, user?.id, onVideoWatched]);

  useEffect(() => {
    let interval;
    if (isWatching && !hasWatched) {
      interval = setInterval(() => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          // Mark as watched after 30 seconds (simulating video watch)
          if (newTime >= 30) {
            handleVideoComplete();
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWatching, hasWatched]);

  const handleVideoComplete = () => {
    if (currentVideo && user) {
      const watchedVideos = JSON.parse(localStorage.getItem(`watchedVideos_${user.id}`) || '[]');
      watchedVideos.push(currentVideo.id);
      localStorage.setItem(`watchedVideos_${user.id}`, JSON.stringify(watchedVideos));
      
      setHasWatched(true);
      setIsWatching(false);
      onVideoWatched();
    }
  };

  const startWatching = () => {
    setIsWatching(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentVideo) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Daily Video Available</h3>
          <p className="mt-1 text-sm text-gray-500">
            There's no daily video scheduled for today. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Daily Information Video</h1>
        <p className="mt-2 text-gray-600">
          {hasWatched 
            ? "You've completed today's daily video! You can now access other features."
            : "Please watch today's daily video to continue using the platform."
          }
        </p>
      </div>

      {/* Video Player Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="aspect-video bg-gray-900 relative">
          {!isWatching && !hasWatched ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={startWatching}
                className="flex items-center justify-center w-20 h-20 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors group"
              >
                <Play className="w-8 h-8 ml-1 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {hasWatched ? (
                <div className="text-center text-white">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                  <p className="text-xl font-semibold">Video Completed!</p>
                  <p className="text-gray-300">You can now access all platform features</p>
                </div>
              ) : (
                <div className="text-center text-white">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xl font-semibold">Watching Video...</p>
                  <p className="text-gray-300">Time watched: {formatTime(watchTime)}</p>
                  <div className="w-64 bg-gray-700 rounded-full h-2 mt-4">
                    <div 
                      className="bg-blue-400 h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min((watchTime / 30) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{currentVideo.title}</h2>
              <p className="text-gray-600 mb-4">{currentVideo.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(currentVideo.showingDate).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Required viewing
                </div>
              </div>
            </div>
            
            {hasWatched && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">Important Instructions</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            You must watch the daily information video completely before accessing other features
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            The video contains important updates and information for your daily activities
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Once completed, you'll have full access to training, promotion videos, and other features
          </li>
          {currentVideo.youtubeLink && (
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              You can also watch this video on YouTube: 
              <a 
                href={currentVideo.youtubeLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 text-blue-600 hover:text-blue-800 underline"
              >
                Open in YouTube
              </a>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}