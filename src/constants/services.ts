export const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";
export const SERVICE: any = {
    //Auth
    LOGIN: "auth/login",
    // Clears the server-side session marker so the token dies immediately
    // instead of staying valid for the rest of its lifetime.
    LOGOUT: "api-logout",
    REGISTER: "auth/register",

    // Auth Routes
    DAILYVIDEOS: "daily-videos",
    // On/off toggle for the single "default new-user video" (set from the list).
    DAILYVIDEO_DEFAULT_UPDATE: "daily-videos/default-update",
    // On/off toggle for membership of the daily rotation pool (multiple allowed).
    DAILYVIDEO_ROTATIONAL_UPDATE: "daily-videos/rotational-update",
    YOUTUBECHANNELS: "youtube-channels",
    SCRATCHSETUP: "scratch-setup",
    TRAININGVIDEOS: "training-videos",
    TRAININGVIDEOQUIZES: "training-video-quizzes",
    PROMOTIONVIDEOS: "promotion-videos",
    // On/off toggle for "Basic (L0-L2)" video eligibility (set from the list).
    PROMOTIONVIDEO_BASIC_LEVEL_UPDATE: "promotion-videos/basic-level-update",
    PROMOTIONVIDEOQUIZES: "promotion-video-quizzes",
    GET_PROFILE: "auth-user",
    GET_BANK_INFO: 'user-bank-detail',
    REFERRALS: 'referrals',
    GET_ALL_REFERRALS: 'all-referrals',
    PROFILE_UPDATE: "update-personal-details",
    GET_BANK_DETAILS: "user-bank-detail",
    BANK_DETAILS_UPDATE: "user-bank-detail/upsert",
    GET_ADMIN_BANK_DETAILS: "admin-bank-details",
    ADMIN_BANK_DETAILS_UPDATE: "admin-bank-details/upsert",
    GET_ADDITIONAL_SCRAT: "additional-scratch-referrals",
    ADDITIONAL_SCRAT_UPDATE: "additional-scratch-referrals/upsert",
    CHANGE_PASSWORD: "changepassword",
    USER_PROMOTERS: "user-promoters",
    ADMIN_PIN_REQUESTS: "user-promoters",
    RIASE_TERM: "term-raised",
    GENERATE_PIN: "generate-pin",
    REJECT_REQUEST: "pin-rejected",
    GET_PIN_REQUESTS: "user-promoters/list",
    ACTIVATE_PIN: "activate-pin",
    ACCEPT_TERMS: "term-accepted",
    GET_SCRATCH: 'scratch-setup',
    WITHDRAW_UPDATE_STATUS: 'withdraw-status-update',
    SCRATCH_CARDS: "get-scratch-cards",
    SCRATCHED_STATUS_UPDATE: "scratched-status-update",
    USER_DASHBOARD: "user-dashboard",
    ADMIN_DASHBOARD: "admin-dashboard",

    // Sub-admin management (super-admin only on the backend)
    SUB_ADMINS: "sub-admins",
    SUB_ADMIN_STATUS_UPDATE: "sub-admins/status-update",

    // Multi-level referral tree for the User Management drill-down. Path is
    // built per-call as `referral-tree/{userId}`; useGetCall falls through
    // unknown keys to literal paths so this prefix works as a base.
    REFERRAL_TREE: "referral-tree",

    // Support & Help Q&A — admin CRUD endpoint.
    SUPPORT_HELPS: "support-helps",
    SUPPORT_HELP_STATUS_UPDATE: "support-helps/status-update",

    // Company Documents — admin CRUD + show/hide toggle.
    COMPANY_DOCUMENTS: "company-documents",
    COMPANY_DOCUMENT_STATUS_UPDATE: "company-documents/status-update",

    // Show / hide user-facing menus (generic — one row per menu).
    MENU_SETTINGS: "menu-settings",

    // Login history — read-only audit list (super-admin only).
    LOGIN_LOGS: "login-logs",

    // Company Personal Documents — internal docs (image / PDF / Excel).
    // Sub-admin needs the personal_documents permission; status change is
    // super-admin only.
    COMPANY_PERSONAL_DOCUMENTS: "company-personal-documents",
    COMPANY_PERSONAL_DOCUMENT_STATUS: "company-personal-documents/status-update",

    // Admin-side wipe of a user's locked bank details. POST { user_id }.
    CLEAR_USER_BANK_DETAIL: "user-bank-detail/clear",

    // Terms & Conditions — single-document admin editor.
    // Bill template — seller block + invoice settings for the
    // plan-product invoice. Single document, upsert like T&C.
    BILL_TEMPLATE: "bill-template",
    BILL_TEMPLATE_UPSERT: "bill-template/upsert",
    TERMS_AND_CONDITIONS: "terms-and-conditions",
    TERMS_AND_CONDITIONS_UPSERT: "terms-and-conditions/upsert",

    // Suggestions — admin read-only list + mark-as-read PATCH.
    ADMIN_SUGGESTIONS: "admin-suggestions",
    ADMIN_SUGGESTIONS_MARK_READ: "admin-suggestions/mark-read",

    // Promotion Log — read-only audit of promotion-video quiz attempts.
    // Detail (full per-question answers) via key: admin-promotion-quiz-logs/{id}.
    PROMOTION_QUIZ_LOGS: "admin-promotion-quiz-logs",

    // Offer module — master config, per-upgrade point values, and the
    // per-user points tab. History drill-down via key: admin-offer-points/{userId}.
    OFFER_CONFIG: "offers/config",
    OFFER_SETTINGS: "offer-settings",
    OFFER_SETTINGS_UPSERT: "offer-settings/upsert",
    ADMIN_OFFER_POINTS: "admin-offer-points",
    // Manual, display-only leaderboard rows + merged preview of the user list.
    OFFER_DUMMY_ENTRIES: "offer-dummy-entries",
    OFFER_DUMMY_UPSERT: "offer-dummy-entries/upsert",
    ADMIN_OFFER_TOP_LIST: "admin-offer-top-list",

    // Promoter box requests — admin list + mark-as-sent / mark-as-delivered.
    ADMIN_BOX_REQUESTS: "admin-box-requests",
    ADMIN_BOX_MARK_SENT: "admin-box-requests/mark-sent",
    ADMIN_BOX_MARK_DELIVERED: "admin-box-requests/mark-delivered",
    ADMIN_BOX_UPDATE_QUANTITY: "admin-box-requests/update-quantity",


    //Export
    EXPORT_EXCEL: 'withdraws/export/excel',
    EXPORT_WITHDRAW_FILTERED: 'withdraws/export/filtered/excel',
    EXPORT_USERS: 'all-referrals/export/excel',
    EXPORT_PIN_REQUESTS: 'user-promoters/export/excel',
    EXPORT_BOX_REQUESTS: 'admin-box-requests/export/excel',

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
    WITHDRAW_HISTRY: 'withdraw-histories',
    WITHDRAW_REQUEST: 'withdraws'


}