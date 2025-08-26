import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Trophy, 
  Timer,
  Award,
  HelpCircle,
  RefreshCw,
  Star
} from 'lucide-react';

export default function PromotionVideos() {
  const { promotionVideos, quizzes } = useData();
  const { user, updateUser } = useAuth();
  const [currentSession, setCurrentSession] = useState('12am-12pm');
  const [sessionVideos, setSessionVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 1;
  const maxVideosForLevel = user?.role === 'promotor3' || user?.role === 'promotor4' ? 4 : 2;

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayVideos = promotionVideos.filter(video => 
      video.showingDate === today && video.session === currentSession
    );
    setSessionVideos(todayVideos.slice(0, maxVideosForLevel));
    
    // Load completed videos from localStorage
    const completedKey = `promotion_${user?.id}_${today}_${currentSession}`;
    const completed = JSON.parse(localStorage.getItem(completedKey) || '[]');
    setCompletedVideos(completed);
  }, [currentSession, promotionVideos, user?.id, maxVideosForLevel]);

  useEffect(() => {
    let interval;
    if (isWatching) {
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
  }, [isWatching]);

  useEffect(() => {
    let timer;
    if (showQuiz && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleQuizSubmit(true); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showQuiz, timeLeft]);

  const handleVideoSelect = (video) => {
    if (completedVideos.includes(video.id)) return;
    
    setSelectedVideo(video);
    const quiz = quizzes.find(q => q.videoId === video.id);
    setCurrentQuiz(quiz);
    setWatchTime(0);
    setQuizAnswers({});
    setRetryCount(0);
  };

  const startWatching = () => {
    setIsWatching(true);
    setWatchTime(0);
  };

  const handleVideoComplete = () => {
    setIsWatching(false);
    if (currentQuiz) {
      setShowQuiz(true);
      setTimeLeft(currentQuiz.questions[0]?.timeLimit || 30);
    } else {
      markVideoCompleted();
    }
  };

  const handleQuizAnswer = (questionId, choiceId) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  const handleQuizSubmit = (timeUp = false) => {
    if (!currentQuiz || !selectedVideo) return;

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
    const passed = score >= 70;

    if (passed) {
      // Award earnings based on user level
      const earnings = currentQuiz.earnings[user.role] || 0;
      updateUser({
        earnings: {
          ...user.earnings,
          scratch: user.earnings.scratch + earnings
        }
      });
      markVideoCompleted();
    } else if (retryCount < maxRetries) {
      // Allow retry
      setRetryCount(prev => prev + 1);
      setShowQuiz(false);
      setQuizAnswers({});
      alert(`Quiz failed (${score.toFixed(0)}%). You have ${maxRetries - retryCount} retry left.`);
    } else {
      // No more retries
      setShowQuiz(false);
      alert(`Quiz failed (${score.toFixed(0)}%). No more retries available for this video.`);
      setSelectedVideo(null);
    }
  };

  const markVideoCompleted = () => {
    if (!selectedVideo || !user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const completedKey = `promotion_${user.id}_${today}_${currentSession}`;
    const completed = [...completedVideos, selectedVideo.id];
    
    localStorage.setItem(completedKey, JSON.stringify(completed));
    setCompletedVideos(completed);
    setShowQuiz(false);
    setSelectedVideo(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionIcon = (session) => {
    return session === '12am-12pm' ? '🌅' : '🌙';
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours < 12 ? '12am-12pm' : '12pm-12am';
  };

  const isSessionActive = (session) => {
    return getCurrentTime() === session;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Education & Promotion Videos</h1>
        <p className="mt-2 text-gray-600">
          Watch session-based promotional content and earn rewards through quizzes
        </p>
      </div>

      {/* Session Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Session</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentSession('12am-12pm')}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentSession === '12am-12pm'
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-200 hover:border-yellow-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🌅</span>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Morning Session</div>
                    <div className="text-sm text-gray-600">12:00 AM - 12:00 PM</div>
                  </div>
                </div>
                {isSessionActive('12am-12pm') && (
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </button>

            <button
              onClick={() => setCurrentSession('12pm-12am')}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentSession === '12pm-12am'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🌙</span>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Evening Session</div>
                    <div className="text-sm text-gray-600">12:00 PM - 12:00 AM</div>
                  </div>
                </div>
                {isSessionActive('12pm-12am') && (
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Level Benefits */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Level Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <Trophy className="w-5 h-5 text-purple-600 mr-2" />
              <span className="font-medium text-gray-900">Current Level</span>
            </div>
            <div className="text-lg font-bold text-purple-600">{user?.level}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <Play className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-gray-900">Videos Available</span>
            </div>
            <div className="text-lg font-bold text-blue-600">{maxVideosForLevel} per session</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <RefreshCw className="w-5 h-5 text-orange-600 mr-2" />
              <span className="font-medium text-gray-900">Retries</span>
            </div>
            <div className="text-lg font-bold text-orange-600">{maxRetries} per video</div>
          </div>
        </div>
      </div>

      {/* Video Selection */}
      {!selectedVideo ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              {getSessionIcon(currentSession)}
              <span className="ml-2">
                {currentSession === '12am-12pm' ? 'Morning' : 'Evening'} Session Videos
              </span>
            </h3>
          </div>
          <div className="p-6">
            {sessionVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sessionVideos.map((video, index) => {
                  const isCompleted = completedVideos.includes(video.id);
                  const quiz = quizzes.find(q => q.videoId === video.id);
                  
                  return (
                    <div
                      key={video.id}
                      className={`border-2 rounded-lg p-6 transition-all cursor-pointer ${
                        isCompleted
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                      onClick={() => !isCompleted && handleVideoSelect(video)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            isCompleted ? 'bg-green-500' : 'bg-purple-500'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-6 h-6 text-white" />
                            ) : (
                              <Trophy className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-500">Video {index + 1}</div>
                            <div className="text-lg font-semibold text-gray-900">{video.title}</div>
                          </div>
                        </div>
                        {isCompleted && (
                          <div className="flex items-center text-green-600">
                            <Star className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{video.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Promotion Video
                          </div>
                          {quiz && (
                            <div className="flex items-center">
                              <HelpCircle className="w-4 h-4 mr-1" />
                              Quiz Available
                            </div>
                          )}
                        </div>
                        {quiz && (
                          <div className="text-sm font-medium text-purple-600">
                            Earn ₹{quiz.earnings[user?.role] || 0}
                          </div>
                        )}
                      </div>
                      
                      {!isCompleted && (
                        <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                          Watch Video
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Videos Available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No promotion videos are available for this session today.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Video Player */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="aspect-video bg-gray-900 relative">
            {!isWatching ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <button
                    onClick={startWatching}
                    className="flex items-center justify-center w-20 h-20 bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-colors group mb-4"
                  >
                    <Play className="w-8 h-8 ml-1 group-hover:scale-110 transition-transform" />
                  </button>
                  <p className="text-lg font-semibold">{selectedVideo.title}</p>
                  <p className="text-gray-300">Click to start watching</p>
                  {retryCount > 0 && (
                    <p className="text-yellow-300 mt-2">Retry {retryCount}/{maxRetries}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xl font-semibold">Watching Video...</p>
                  <p className="text-gray-300">Time watched: {formatTime(watchTime)}</p>
                  <div className="w-64 bg-gray-700 rounded-full h-2 mt-4">
                    <div 
                      className="bg-purple-400 h-2 rounded-full transition-all duration-1000" 
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedVideo.title}</h2>
                <p className="text-gray-600 mb-4">{selectedVideo.description}</p>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back to Videos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Section */}
      {showQuiz && currentQuiz && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Promotion Quiz</h3>
            <div className="flex items-center space-x-4">
              {retryCount > 0 && (
                <span className="text-orange-600 font-medium">
                  Retry {retryCount}/{maxRetries}
                </span>
              )}
              <div className="flex items-center text-red-600">
                <Timer className="w-5 h-5 mr-2" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {currentQuiz.questions.map((question, index) => (
            <div key={question.id} className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Question {index + 1}: {user?.language === 'tamil' ? question.questionTa : question.questionEn}
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
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-3 text-gray-900">
                      {user?.language === 'tamil' ? choice.textTa : choice.textEn}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Earnings: ₹{currentQuiz.earnings[user?.role]} (70% score required)
            </div>
            <button
              onClick={() => handleQuizSubmit()}
              disabled={Object.keys(quizAnswers).length < currentQuiz.questions.length}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}