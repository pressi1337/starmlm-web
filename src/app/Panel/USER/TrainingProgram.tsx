import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Calendar, 
  GraduationCap, 
  ArrowRight,
  Award,
  HelpCircle,
  Timer
} from 'lucide-react';

export default function TrainingProgram() {
  const { trainingVideos, quizzes } = useData();
  const { user, updateUser } = useAuth();
  const [currentDayVideo, setCurrentDayVideo] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [hasWatchedToday, setHasWatchedToday] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const trainingDayDescriptions = {
    1: 'Company Introduction - Learn about our mission and values',
    2: 'Company Plan & Vision - Understanding our business model',
    3: 'How to Work - Basic fundamentals',
    4: 'How to Work - Advanced techniques',
    5: 'Working Training - Level 1 practical skills',
    6: 'Working Training - Level 2 advanced skills',
    7: 'Working Training - Level 3 mastery'
  };

  useEffect(() => {
    if (user && user.trainingDay <= 7) {
      const dayVideo = trainingVideos.find(video => video.day === user.trainingDay);
      if (dayVideo) {
        setCurrentDayVideo(dayVideo);
        const quiz = quizzes.find(q => q.videoId === dayVideo.id);
        setCurrentQuiz(quiz);
        
        // Check if already watched today
        const watchedKey = `training_${user.id}_day_${user.trainingDay}`;
        const hasWatched = localStorage.getItem(watchedKey) === 'true';
        setHasWatchedToday(hasWatched);
        
        // Check if quiz completed
        const quizKey = `quiz_${user.id}_day_${user.trainingDay}`;
        const quizDone = localStorage.getItem(quizKey) === 'true';
        setQuizCompleted(quizDone);
      }
    }
  }, [user, trainingVideos, quizzes]);

  useEffect(() => {
    let interval;
    if (isWatching && !hasWatchedToday) {
      interval = setInterval(() => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          if (newTime >= 30) { // 30 seconds to complete video
            handleVideoComplete();
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWatching, hasWatchedToday]);

  useEffect(() => {
    let timer;
    if (showQuiz && timeLeft > 0 && !quizCompleted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleQuizSubmit(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showQuiz, timeLeft, quizCompleted]);

  const handleVideoComplete = () => {
    if (currentDayVideo && user) {
      const watchedKey = `training_${user.id}_day_${user.trainingDay}`;
      localStorage.setItem(watchedKey, 'true');
      setHasWatchedToday(true);
      setIsWatching(false);
      
      // Show quiz if available
      if (currentQuiz) {
        setShowQuiz(true);
        setTimeLeft(currentQuiz.questions[0]?.timeLimit || 30);
      }
    }
  };

  const startWatching = () => {
    setIsWatching(true);
    setWatchTime(0);
  };

  const handleQuizAnswer = (questionId, choiceId) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  const handleQuizSubmit = () => {
    if (currentQuiz && user) {
      // Calculate score
      let correctAnswers = 0;
      currentQuiz.questions.forEach(question => {
        const selectedChoice = quizAnswers[question.id];
        const correctChoice = question.choices.find(c => c.isCorrect);
        if (selectedChoice === correctChoice?.id) {
          correctAnswers++;
        }
      });

      const score = (correctAnswers / currentQuiz.questions.length) * 100;
      
      // Award earnings based on user level
      const earnings = currentQuiz.earnings[user.role] || 0;
      if (score >= 70) { // Pass threshold
        updateUser({
          earnings: {
            ...user.earnings,
            scratch: user.earnings.scratch + earnings
          }
        });
      }

      // Mark quiz as completed
      const quizKey = `quiz_${user.id}_day_${user.trainingDay}`;
      localStorage.setItem(quizKey, 'true');
      setQuizCompleted(true);
      setShowQuiz(false);

      // Advance to next day if passed
      if (score >= 70 && user.trainingDay < 7) {
        updateUser({
          trainingDay: user.trainingDay + 1
        });
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user || user.trainingDay > 7) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <GraduationCap className="mx-auto h-16 w-16 text-green-500" />
          <h3 className="mt-4 text-2xl font-bold text-gray-900">Training Completed!</h3>
          <p className="mt-2 text-lg text-gray-600">
            Congratulations! You've successfully completed the 7-day training program.
          </p>
          <div className="mt-6 p-6 bg-green-50 rounded-xl border border-green-200">
            <Award className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h4 className="text-lg font-semibold text-green-900">Training Certificate Earned</h4>
            <p className="text-green-700">You're now ready to access all platform features!</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentDayVideo) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Training Video Available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Training video for day {user.trainingDay} is not available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">7-Day Training Program</h1>
            <p className="mt-2 text-gray-600">
              Day {user.trainingDay} of 7 - {trainingDayDescriptions[user.trainingDay]}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-2xl font-bold text-blue-600">{user.trainingDay}/7</div>
            <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(user.trainingDay / 7) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Training Progress Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-blue-600">Days 1-2</div>
            <div className="text-gray-900 font-medium">Company Introduction</div>
            <div className="text-sm text-gray-600">Mission, values & business plan</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-green-600">Days 3-4</div>
            <div className="text-gray-900 font-medium">How to Work</div>
            <div className="text-sm text-gray-600">Basic & advanced techniques</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-purple-600">Days 5-7</div>
            <div className="text-gray-900 font-medium">Working Training</div>
            <div className="text-sm text-gray-600">Practical skills & mastery</div>
          </div>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="aspect-video bg-gray-900 relative">
          {!isWatching && !hasWatchedToday ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <button
                  onClick={startWatching}
                  className="flex items-center justify-center w-20 h-20 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors group mb-4"
                >
                  <Play className="w-8 h-8 ml-1 group-hover:scale-110 transition-transform" />
                </button>
                <p className="text-lg font-semibold">Day {user.trainingDay} Training Video</p>
                <p className="text-gray-300">Click to start your training</p>
              </div>
            </div>
          ) : hasWatchedToday ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                <p className="text-xl font-semibold">Video Completed!</p>
                <p className="text-gray-300">
                  {quizCompleted ? 'Quiz completed - Ready for next day!' : 'Complete the quiz to proceed'}
                </p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xl font-semibold">Watching Training Video...</p>
                <p className="text-gray-300">Time watched: {formatTime(watchTime)}</p>
                <div className="w-64 bg-gray-700 rounded-full h-2 mt-4">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min((watchTime / 30) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{currentDayVideo.title}</h2>
              <p className="text-gray-600 mb-4">{currentDayVideo.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Day {currentDayVideo.day}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Training Video
                </div>
                {currentQuiz && (
                  <div className="flex items-center">
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Quiz Available
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              {hasWatchedToday && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Video Completed</span>
                </div>
              )}
              {quizCompleted && (
                <div className="flex items-center text-blue-600">
                  <Award className="w-5 h-5 mr-2" />
                  <span className="font-medium">Quiz Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Section */}
      {showQuiz && currentQuiz && !quizCompleted && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Training Quiz - Day {user.trainingDay}</h3>
            <div className="flex items-center text-orange-600">
              <Timer className="w-5 h-5 mr-2" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {currentQuiz.questions.map((question, index) => (
            <div key={question.id} className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Question {index + 1}: {user.language === 'tamil' ? question.questionTa : question.questionEn}
              </h4>
              
              <div className="space-y-3">
                {question.choices.map((choice) => (
                  <label
                    key={choice.id}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={choice.id}
                      checked={quizAnswers[question.id] === choice.id}
                      onChange={() => handleQuizAnswer(question.id, choice.id)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-900">
                      {user.language === 'tamil' ? choice.textTa : choice.textEn}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Earnings: ₹{currentQuiz.earnings[user.role]} (70% score required)
            </div>
            <button
              onClick={handleQuizSubmit}
              disabled={Object.keys(quizAnswers).length < currentQuiz.questions.length}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit Quiz
            </button>
          </div>
        </div>
      )}

      {/* Next Steps */}
      {hasWatchedToday && quizCompleted && user.trainingDay < 7 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">Day {user.trainingDay} Complete!</h3>
              <p className="text-green-700">
                Great job! Come back tomorrow for Day {user.trainingDay + 1} training.
              </p>
            </div>
            <ArrowRight className="w-6 h-6 text-green-600 ml-auto" />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">Training Instructions</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Watch the complete training video for your current day
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Answer the quiz question after watching the video
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Score 70% or higher to earn rewards and advance to the next day
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Complete all 7 days to unlock full platform access
          </li>
        </ul>
      </div>
    </div>
  );
}