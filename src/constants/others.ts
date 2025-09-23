import { SERVICE } from "./services";
export const DATA_SELECT: any = {
    LINK_TYPE: [
        {
            label: 'category',
            value: 'category'
        },
        {
            label: 'concern',
            value: 'concern'
        },
        {
            label: 'ingredient',
            value: 'ingredient'
        },
    ],
    DISCOUNT_TYPE: [
        {
            label: 'amount',
            value: 'amount'
        },
        {
            label: 'percentage',
            value: 'percentage'
        },
    ]
}


export const SELECT_OVERLAY: any = {

    USERS: {
        formType: "FETCH_SELECT",
        title: "Select Users",
        placeHolder: "Search",
        isMulti: false,
        setQueryName: "user_id",
        api: SERVICE.USERS,
        label: "email",
        value: "id",
        filter: {
            attributes: ['email', 'id']
        },
    },

    INVITE_CODE: {
        formType: "FETCH_SELECT",
        title: "Invite Code",
        placeHolder: "Search Invite code",
        isMulti: false,
        setQueryName: "invitation",
        api: SERVICE.INVITE_CODE,
        label: "invitation_code",
        value: "id",
        filter: {
            attributes: ['id', 'invitation_code']
        },
    },

    CATEGORIES_TYPE: {
        formType: "SELECT",
        title: "Category Type",
        isMulti: false,
        setQueryName: "category_type",
        customOptions: DATA_SELECT.LINK_TYPE,
    },
    LOGIN_BY: {
        formType: "SELECT",
        title: "Login By",
        isMulti: false,
        setQueryName: "login_by",
        customOptions: [
            {
                label: "Facebook",
                value: "Facebook",
            },
            {
                label: "Email",
                value: "Email",
            },
            {
                label: "Linkedin",
                value: "Linkedin",
            },
            {
                label: "Gmail",
                value: "Gmail"
            }
        ],
    },

    CATEGORY: {
        formType: "FETCH_SELECT",
        title: "Select Category",
        placeHolder: "Search ...",
        isMulti: false,
        setQueryName: "category_id",
        api: SERVICE.CATEGORIES,
        label: "category_name",
        value: "id",
        filter: {
            category_type: "category"
        },
    },
    CORCEN: {
        formType: "FETCH_SELECT",
        title: "Select Concern",
        placeHolder: "Search ...",
        isMulti: false,
        setQueryName: "concern_id",
        api: SERVICE.CATEGORIES,
        label: "category_name",
        value: "id",
        filter: {
            category_type: "concern"
        },
    },
    INGREDIENT: {
        formType: "FETCH_SELECT",
        title: "Select Ingredient",
        placeHolder: "Search ...",
        isMulti: true,
        setQueryName: "ingredient_id",
        api: SERVICE.CATEGORIES,
        label: "category_name",
        value: "id",
        filter: {
            category_type: "ingredient"
        },
    },
    IS_BEST_SALE: {
        formType: "SELECT",
        title: "BEST SALE",
        isMulti: false,
        setQueryName: "is_best_sell",
        customOptions: [{
            label: 'is_best_sell',
            value: 1
        },
        {
            label: 'no_best_sell',
            value: 0
        }]
    },
    // INGREDIENCT: {
    //     formType: "FETCH_SELECT",
    //     title: "Select Ingredient",
    //     placeHolder: "Search ...",
    //     isMulti: true,
    //     setQueryName: "category_id",
    //     api: SERVICE.CATEGORIES,
    //     label: "category_name",
    //     value: "id",
    //     filter: {
    //         category_type: "ingredient"
    //     },
    // },

    INCOME_CATEGORY: {
        formType: "FETCH_SELECT",
        title: "Select Category",
        placeHolder: "Search ...",
        isMulti: false,
        setQueryName: "category_id",
        api: SERVICE.CATEGORIES,
        label: "category_name",
        value: "id",
        filter: {
            link_type: "Income"
        },
    },
    EXPENSE_CATEGORY: {
        formType: "FETCH_SELECT",
        title: "Select Category",
        placeHolder: "Search ...",
        isMulti: false,
        setQueryName: "category_id",
        api: SERVICE.CATEGORIES,
        label: "category_name",
        value: "id",
        filter: {
            link_type: "Expense"
        },
    },
    LIABLITY_CATEGORY: {
        formType: "FETCH_SELECT",
        title: "Select Category",
        placeHolder: "Search ...",
        isMulti: false,
        setQueryName: "category_id",
        api: SERVICE.CATEGORIES,
        label: "category_name",
        value: "id",
        filter: {
            link_type: "Liability"
        },
    },
    ASSET_CATEGORY: {
        formType: "FETCH_SELECT",
        title: "Select Category",
        placeHolder: "Search ...",
        isMulti: false,
        setQueryName: "category_id",
        api: SERVICE.CATEGORIES,
        label: "category_name",
        value: "id",
        filter: {
            link_type: "Asset"
        },
    },
};

export const CURRENCY: any = {
    USD: {
        entity: "&dollar;",
        code: "USD",
        name: "US Dollar",
        symbol: "$",
        flag: "/assets/images/flags/US.svg"
    },
    CAD: {
        entity: "&dollar;",
        code: "CAD",
        name: "Canadian Dollar",
        symbol: "$",
        flag: "/assets/images/flags/US.svg"
    },
    BHD: {
        entity: "&#46;&#1603;&#46;&#1576;",
        code: "BHD",
        name: "Bahraini Dinar",
        symbol: "ك.ب",
        flag: "/assets/images/flags/US.svg"//TODO replace correct Flag
    },
    INR: {
        entity: "&#8377;",
        code: "INR",
        name: "Indian Rupee",
        symbol: "₹",
        flag: "/assets/images/flags/IN.svg"
    },
    GBP: {
        entity: "&pound;",
        code: "GBP",
        name: "British Pound Sterling",
        symbol: "£",
        flag: "/assets/images/flags/GB-ENG.svg"
    },
    OMR: {
        entity: "&#1585;&#46;&#1593;&#46;",
        code: "OMR",
        name: "Omani Rial",
        symbol: " ر.ع.",
        flag: "/assets/images/flags/US.svg"//TODO replace correct Flag
    },
    // PKR: {  // not got historical currency
    //   entity: "&#8360;",
    //   code: "PKR",
    //   name: "Pakistani Rupee",
    //   symbol: "₨",
    // },
    QAR: {
        entity: "&#81;&#82;",
        code: "QAR",
        name: "Qatari Rial",
        symbol: "QR",
        flag: "/assets/images/flags/US.svg"//TODO replace correct Flag
    },
    SAR: {
        entity: "&#65020;",
        code: "SAR",
        name: "Saudi Riyal",
        symbol: "﷼",
        flag: "/assets/images/flags/US.svg"//TODO replace correct Flag
    },
    SGD: {
        entity: "&dollar;",
        code: "SGD",
        name: "Singapore Dollar",
        symbol: "$",
        flag: "/assets/images/flags/US.svg"//TODO replace correct Flag
    },
    AED: {
        entity: "&#1583;&#46;&#1573;",
        code: "AED",
        name: "UAE Dirham",
        symbol: "د.إ",
        flag: "/assets/images/flags/US.svg"//TODO replace correct Flag
    },
    EUR: {
        entity: "&euro;",
        code: "EUR",
        name: "Eur",
        symbol: "€",
        flag: "/assets/images/flags/US.svg"//TODO replace correct Flag
    },
};


export const MODAL_OPEN: any = {
    PRODUCTS_MODAL: 'Products',
    BLOG_MODAL: 'Blog',
    COMBO_MODAL: 'ComboProduct',
    CATEGORY_MODAL: 'Category',
    TESTIMONIALS_MODAL: 'Testimonials',
    BANNER_MODAL: 'Banner',
    INVITE_MODAL: 'Invite',
    ENQURIES: 'Enquire',
    COUPONS: 'Coupons'
}

export const URL_QUERY: any = {
    QUERY_KEY: {
        VIEW: 'View',
        EDIT: 'Edit',
        MODAL: 'Modal',
        TAB: 'Tab',
        SEARCH: 'Search'
    }

}

export const ROLE: any = {
    ADMIN: 0,
    SUPER_ADMIN: 1,
    USER: 2
}