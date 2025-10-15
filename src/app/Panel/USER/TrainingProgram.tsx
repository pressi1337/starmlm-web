import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Crown,
  MessageCircleQuestion,
} from "lucide-react";
import { useActionCall, useGetCall } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Loader from "@/components/ui/Loader";
import ReactPlayer from "react-player";
import UIHelpers from "@/utils/UIhelper";
import Swal from "sweetalert2";
import DailyVideoWarning from "@/components/DailyVideoWarning";
import QuizForm from "@/components/QuizeForm";
import Lib from "@/utils/Lib";
import Error500 from "@/components/ui/Error500";

const TrainingProgramWatch = () => {
  const { data, loading, setQuery, error } = useGetCall(
    SERVICE.USER_TRAINING_CURRENCT
  );
  const { Post: updateTraningStatus, error: traningStatusUpdateError } =
    useActionCall(SERVICE.TRAINING_STATUS_UPDATE);

  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [takeQuiz, setTakeQuiz] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgress = (e: any) => {
    const video = e.target as HTMLVideoElement;
    if (video.duration) {
      const progress = video.currentTime / video.duration;
      setPlayed(progress);
      setCurrentTime(video.currentTime);
    }
  };

  const handleDurationChange = (e: any) => {
    const video = e.target as HTMLVideoElement;
    setDuration(video.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    const seekTime = percent * duration;

    // Access the internal player element
    const internalPlayer = playerRef.current?.getInternalPlayer();
    if (internalPlayer && "currentTime" in internalPlayer) {
      internalPlayer.currentTime = seekTime;
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error || traningStatusUpdateError) {
    return (
      <Error500
        title={traningStatusUpdateError ?? undefined}
        description={traningStatusUpdateError ? "" : undefined}
      />
    );
  }
  if (data?.data?.training_status === 2) {
    return (
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center justify-center">
        <div className="bg-green-50 border border-green-200 rounded-xl py-6 px-12 flex items-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center  justify-center gap-6">
            <Crown className="w-8 h-8  text-green-600 " />
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-lg font-semibold text-green-900">Congratulations!</h3>
              <p className="text-green-700">You have completed all the training videos for the 7-day training program. Great job!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!data?.data?.training?.id) {
    return (
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center justify-center">
        <div className="bg-green-50 border border-green-200 rounded-xl py-6 px-12 flex items-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center  justify-center gap-6">
            <Crown className="w-8 h-8  text-green-600 " />
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-lg font-semibold text-green-900">Day {data?.data?.nextday - 1} training Complete!</h3>
              <p className="text-green-700">Excellent progress! Get ready to continue your journey tomorrow with Day {data?.data?.nextday}.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlevideoWatchCompleted = async () => {
    // if already watched not need to trigger
    if (!data?.data?.training?.status) {
      Swal.fire({
        icon: "success",
        title: `Day ${data?.data?.nextday - 1} Training Video Completed`,
        text: "You've completed today's daily video! Please Take Quize",
        confirmButtonText: "OK",
        customClass: {
          confirmButton:
            "bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-all duration-200",
        },
      }).then((result) => {
        setQuery();
      });
      await updateTraningStatus(
        {
          status: data?.data?.training?.training_video?.quiz?.id ? 1 : 2,
        },
        ""
      );
    }
    setPlaying(false);
  };

  const handleTakeQuiz = () => {
    Swal.fire({
      icon: "info",
      title: `Read Instructions`,
      html: `
   <ul>
    <li>* Each question has 30 seconds to answer.</li>
    <li>* Once submitted, you cannot return to previous questions.</li>
    <li>* Unanswered questions after 30 seconds will auto-skip.</li>
    <li>* No pausing or refreshing during the quiz.</li>
   </ul>
  `,
      confirmButtonText: "Take Quiz",
      customClass: {
        confirmButton:
          "bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-all duration-200",
      },
    }).then((result) => {
      setTakeQuiz(true);
    });
  };

  const handleQuizSubmit = async (payload = []) => {
    Swal.fire({
      icon: "success",
      title: "Quiz Completed!",
      text: "Thank you for taking the quiz. Your responses have been submitted successfully.",
      confirmButtonText: "OK",
      customClass: {
        confirmButton:
          "bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-all duration-200",
      },
    }).then((result) => {
      setQuery();
    });
    setTakeQuiz(false);
    await updateTraningStatus(
      {
        status: 2,
      },
      ""
    );
  };
  return (
    <>
      {takeQuiz ? (
        <QuizForm
          title={`Day ${data?.data?.nextday - 1}: ${
            data?.data?.training?.training_video?.title
          }`}
          quizQuestion={Lib.transformQuestionsFromResponse(
            data?.data?.training?.training_video?.quiz?.questions
          )}
          handleQuizSubmit={handleQuizSubmit}
        />
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  7-Day Training Program
                </h1>
                <p className="mt-2 text-gray-600">
                  Day {data?.data?.training?.day} of 7
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Progress</div>
                <div className="text-2xl font-bold text-blue-600">
                  {data?.data?.training?.day - 1}/7
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${((data?.data?.training?.day - 1) / 7) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Training Structure
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-blue-600">
                  Days 1-2
                </div>
                <div className="text-gray-900 font-medium">
                  Company Introduction
                </div>
                <div className="text-sm text-gray-600">
                  Mission, values & business plan
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-green-600">
                  Days 3-4
                </div>
                <div className="text-gray-900 font-medium">How to Work</div>
                <div className="text-sm text-gray-600">
                  Basic & advanced techniques
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-purple-600">
                  Days 5-7
                </div>
                <div className="text-gray-900 font-medium">
                  Working Training
                </div>
                <div className="text-sm text-gray-600">
                  Practical skills & mastery
                </div>
              </div>
            </div>
          </div>

          {/* Video Player Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="aspect-video bg-gray-900 relative">
              <ReactPlayer
                ref={playerRef}
                src={
                  data?.data?.training?.training_video?.video_path ??
                  data?.data?.training?.training_video?.youtube_link
                }
                width="100%"
                height="100%"
                controls={false}
                playing={playing}
                onTimeUpdate={handleProgress}
                onDurationChange={handleDurationChange}
                onEnded={handlevideoWatchCompleted}
              />

              {/* Custom Play Button Overlay */}
              {!playing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <button
                    onClick={() => setPlaying(true)}
                    className="flex items-center justify-center w-20 h-20 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors group"
                  >
                    <Play className="w-8 h-8 ml-1 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              )}
            </div>

            {/* Custom Progress Bar */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex items-center space-x-4">
                {/* Play/Pause Button */}
                <button
                  onClick={() => setPlaying(!playing)}
                  className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors"
                >
                  {playing ? (
                    <div className="flex space-x-1">
                      <div className="w-1 h-4 bg-white"></div>
                      <div className="w-1 h-4 bg-white"></div>
                    </div>
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>

                {/* Time Display */}
                <div className="flex items-center text-sm text-gray-600 font-medium min-w-24">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="flex-1">
                  <div
                    className="h-2 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-200"
                      style={{ width: `${played * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Progress Percentage */}
                <div className="text-sm text-gray-600 font-medium min-w-12 text-right">
                  {Math.round(played * 100)}%
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {data?.data?.training?.training_video?.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {data?.data?.training?.training_video?.description}
                  </p>

                  {data?.data?.training?.status == 1 &&
                    data?.data?.training?.training_video?.quiz?.id && (
                      <button
                        onClick={handleTakeQuiz}
                        className="flex px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all"
                      >
                        <MessageCircleQuestion className="mr-2" /> Take Quiz
                      </button>
                    )}
                </div>

                {Boolean(data?.data?.training?.status) && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Watched!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">
              Important Instructions
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                You must watch the daily information video completely before
                accessing other features
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                The video contains important updates and information for your
                daily activities
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Once completed, you'll have full access to training, promotion
                videos, and other features
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default function TrainingProgram() {
  return (
    <DailyVideoWarning>
      <TrainingProgramWatch />
    </DailyVideoWarning>
  );
}
