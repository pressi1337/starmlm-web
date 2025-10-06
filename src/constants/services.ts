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
    CHANGE_PASSWORD: "changepassword"

}