export const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";
export const SERVICE: any = {
    //Auth
    LOGIN: "auth/login",
    REGISTER: "auth/register",

    // Auth Routes
    DAILYVIDEOS: "daily-videos",
    YOUTUBECHANNELS: "youtube-channels",
    SCRATCHSETUP: "scratch-setup",
    TRAININGVIDEOS: "training-videos",
    TRAININGVIDEOQUIZES: "training-video-quizzes",
    PROMOTIONVIDEOS: "promotion-videos",
    PROMOTIONVIDEOQUIZES: "promotion-video-quizzes",
    GET_PROFILE: "auth-user",
    REFERRALS: 'referrals',
    PROFILE_UPDATE: "update-personal-details",
    CHANGE_PASSWORD: "changepassword",
    USER_PROMOTERS: "user-promoters",
    ADMIN_PIN_REQUESTS: "user-promoters",
    RIASE_TERM: "term-raised",
    GENERATE_PIN: "generate-pin",
    REJECT_REQUEST: "pin-rejected",
    GET_PIN_REQUESTS: "user-promoters/list",
    ACTIVATE_PIN: "activate-pin",
    ACCEPT_TERMS: "term-accepted",

    //User Service endpoint
    DAILY_VIDEO_STATUS: 'daily-videos-status',
    DAILY_VIDEO_TODAY: 'daily-videos-today',
    DAILY_VIDEO_STATUS_UPDATE: 'daily-videos-watched',
    GET_PROMOTION_VIDEO: 'user-promoter-video-get',
    PROMOTION_VIDEO_QUIZ_UPDATE: 'user-promoter-quiz-result-get',
    PROMOTION_VIDEO_QUIZ_CONFIRM: 'user-promoter-quiz-result-confirmation',


    USER_TRAINING_CURRENCT: 'user-training-current',
    TRAINING_STATUS_UPDATE: 'user-day-training-mark-as-completed',
    EARNINGS_HISTORY: 'earning-histories',

}