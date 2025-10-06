//@ts-nocheck
import React from "react";
import { useData } from "@/context/DataContext";
import {
  Video,
  Users,
  Trophy,
  TrendingUp,
  Calendar,
  Award,
} from "lucide-react";
import DailyVideoFormModal from "@/components/FormModals/DailyVideoModal/DailyVideoFormModal";
import { MODAL_OPEN } from "@/constants/others";
import { useQueryParams } from "@/hooks";
import TrainingVideoFormModal from "@/components/FormModals/TrainingVideoModal/TrainingVideoFormModal";
import PromotionVideoFormModal from "@/components/FormModals/PromotionVideoModal/PromotionVideoFormModal";
import UserFormModal from "@/components/FormModals/UserModal/UserFormModal";

export default function Dashboard() {
  const { dailyVideos, trainingVideos, promotionVideos, pinRequests } =
    useData();
    const { defaultFilter, updateSearchParam, searchParams } = useQueryParams();
    const Modal = searchParams.get("Modal") || undefined;

  const stats = [
    {
      name: "Daily Videos",
      value: dailyVideos.length,
      icon: Video,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "positive",
    },
    {
      name: "Training Videos",
      value: trainingVideos.length,
      icon: Trophy,
      color: "bg-green-500",
      change: "+8%",
      changeType: "positive",
    },
    {
      name: "Promotion Videos",
      value: promotionVideos.length,
      icon: Award,
      color: "bg-purple-500",
      change: "+15%",
      changeType: "positive",
    },
    {
      name: "Pending Pin Requests",
      value: pinRequests.filter((pr) => pr.status === "pending").length,
      icon: Users,
      color: "bg-orange-500",
      change: "+3",
      changeType: "neutral",
    },
  ];

  const recentActivities = [
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
    {
      id: 4,
      action: "Quiz completed",
      user: "mike_wilson",
      time: "8 hours ago",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's what's happening with your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : stat.changeType === "negative"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Activities
            </h3>
          </div>
          <div className=" flex items-center justify-center h-full">
              <p>Coming Soon</p>
              {/* <ul className="-mb-8">
                {recentActivities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivities.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <TrendingUp className="w-4 h-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {activity.action} by{" "}
                              <span className="font-medium text-gray-900">
                                {activity.user}
                              </span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul> */}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                onClick={() =>
                  updateSearchParam({
                    options: { Modal: MODAL_OPEN.DAILY_VIDEO_MODAL },
                  })
                }
              >
                <Video className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Add Daily Video
                </span>
              </button>
              <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
               onClick={() =>
                  updateSearchParam({
                    options: { Modal: MODAL_OPEN.TRAINING_VIDEO_MODAL },
                  })
                }
              >
                <Trophy className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Add Training
                </span>
              </button>
              <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                onClick={() =>
                  updateSearchParam({
                    options: { Modal: MODAL_OPEN.PROMOTION_VIDEO_MODAL },
                  })
                }
              >
                <Award className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Add Promotion
                </span>
              </button>
              <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
               onClick={() =>
                updateSearchParam({
                  options: { Modal: MODAL_OPEN.USER_MODAL },
                })
              }
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

      {/* System Status */}
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
      {Modal == MODAL_OPEN.DAILY_VIDEO_MODAL && <DailyVideoFormModal />}
      {Modal == MODAL_OPEN.TRAINING_VIDEO_MODAL && <TrainingVideoFormModal />}
      {Modal == MODAL_OPEN.PROMOTION_VIDEO_MODAL && <PromotionVideoFormModal />}
      {Modal == MODAL_OPEN.USER_MODAL && <UserFormModal />}
    </div>
  );
}
