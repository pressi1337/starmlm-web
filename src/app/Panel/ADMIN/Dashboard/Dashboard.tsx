import React from "react";
import {
  Video,
  Users,
  Trophy,
  Award,
} from "lucide-react";
import { useQueryParams, useGetCall } from "@/hooks";
import { MODAL_OPEN } from "@/constants/others";
import { SERVICE } from "@/constants/services";
import DailyVideoFormModal from "@/components/FormModals/DailyVideoModal/DailyVideoFormModal";
import TrainingVideoFormModal from "@/components/FormModals/TrainingVideoModal/TrainingVideoFormModal";
import PromotionVideoFormModal from "@/components/FormModals/PromotionVideoModal/PromotionVideoFormModal";
import UserFormModal from "@/components/FormModals/UserModal/UserFormModal";

interface StatCard {
  name: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change: string;
  changeType: 'positive' | 'negative' | '';
}

interface Activity {
  id: number;
  action: string;
  user: string;
  time: string;
}

export default function Dashboard() {
  const { updateSearchParam, searchParams } = useQueryParams();
  const Modal = searchParams.get("Modal") || undefined;

  // Fetch counts for each module
  const { data: dailyVideosData, loading: dailyVideosLoading } = useGetCall(SERVICE.DAILYVIDEOS);
  const { data: trainingVideosData, loading: trainingVideosLoading } = useGetCall(SERVICE.TRAININGVIDEOS);
  const { data: promotionVideosData, loading: promotionVideosLoading } = useGetCall(SERVICE.PROMOTIONVIDEOS);
  const { data: youtubeChannelsData, loading: youtubeChannelsLoading } = useGetCall(SERVICE.YOUTUBECHANNELS);
  const isLoading = dailyVideosLoading || trainingVideosLoading || promotionVideosLoading || youtubeChannelsLoading;

  const stats: StatCard[] = [
    {
      name: "Daily Videos",
      value: isLoading ? '...' : dailyVideosData?.pageInfo?.total_records || 0,
      icon: Video,
      color: "bg-blue-500",
      change: "",
      changeType: "positive",
    },
    {
      name: "Training Videos",
      value: isLoading ? '...' : trainingVideosData?.pageInfo?.total_records || 0,
      icon: Trophy,
      color: "bg-green-500",
      change: "",
      changeType: "positive",
    },
    {
      name: "Promotion Videos",
      value: isLoading ? '...' : promotionVideosData?.pageInfo?.total_records || 0,
      icon: Award,
      color: "bg-purple-500",
      change: "",
      changeType: "positive",
    },
    {
      name: "YouTube Channels",
      value: isLoading ? '...' : youtubeChannelsData?.pageInfo?.total_records || 0,
      icon: Users,
      color: "bg-red-500",
      change: "",
      changeType: "positive",
    },
  ];

  const recentActivities: Activity[] = [
    {
      id: 1,
      action: "New user registered",
      user: "john_doe",
      time: "2 hours ago",
    },
    {
      id: 2,
      action: "Pin request submitted",
      user: "jane_smith",
      time: "4 hours ago",
    },
    {
      id: 3,
      action: "Daily video uploaded",
      user: "admin",
      time: "6 hours ago",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div
                className={`p-3 rounded-lg ${stat.color} text-white mr-4`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Activities
            </h3>
          </div>
          <div className="p-6">
            {recentActivities.length > 0 ? (
              <ul className="space-y-4">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.user}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.action} • {activity.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() =>
                  updateSearchParam({
                    options: { Modal: MODAL_OPEN.DAILY_VIDEO_MODAL },
                  })
                }
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Video className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Add Daily Video
                </span>
              </button>
              <button
                onClick={() =>
                  updateSearchParam({
                    options: { Modal: MODAL_OPEN.TRAINING_VIDEO_MODAL },
                  })
                }
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <Trophy className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Add Training Video
                </span>
              </button>
              <button
                onClick={() =>
                  updateSearchParam({
                    options: { Modal: MODAL_OPEN.PROMOTION_VIDEO_MODAL },
                  })
                }
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <Award className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Add Promotion Video
                </span>
              </button>
              <button
                onClick={() =>
                  updateSearchParam({
                    options: { Modal: MODAL_OPEN.USER_MODAL },
                  })
                }
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
              >
                <Users className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Manage Users
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <div className="mt-8 bg-white shadow-sm rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Status</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Video Streaming
                </p>
                <p className="text-xs text-gray-500">All systems operational</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  User Authentication
                </p>
                <p className="text-xs text-gray-500">All systems operational</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Payment Processing
                </p>
                <p className="text-xs text-gray-500">Minor delays expected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {Modal === MODAL_OPEN.DAILY_VIDEO_MODAL && <DailyVideoFormModal />}
      {Modal === MODAL_OPEN.TRAINING_VIDEO_MODAL && <TrainingVideoFormModal />}
      {Modal === MODAL_OPEN.PROMOTION_VIDEO_MODAL && <PromotionVideoFormModal />}
      {Modal === MODAL_OPEN.USER_MODAL && <UserFormModal />}
    </div>
  );
}