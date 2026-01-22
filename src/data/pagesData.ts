export const PAGES_DATA = {
    home_page: `/`,
    qr_code_redirect_page: `/q`,
    search_page: `/search`,
    orders_page: `/orders`,
    profile_page: `/profile`,

    single_vendor_page: (id: string) => `/vendors/${id}`,
    single_vendor_info_page: (id: string) => `/vendors/${id}/info`,
    single_vendor_product_page: (vendorId: string, prodId: string) => `/vendors/${vendorId}/${prodId}`,
    single_vendor_reviews_page: (vendorId: string) => `/vendors/${vendorId}/reviews`,
    single_vendor_rate_page: (vendorId: string) => `/vendors/${vendorId}/rate`,

    // orders pages
    tray_page: '/orders/tray',
    ongoing_orders_page: '/orders/ongoing-orders',
    completed_orders_page: '/orders/completed-orders',

    completed_order_info_page: (orderId: string) => `/orders/${orderId}/completed-order-info`,
    summary_page: (orderId: string) => `/orders/${orderId}/order-summary`,
    order_info_page: (orderId: string) => `/orders/${orderId}/order-info`,
    checkout_page: (vendorId: string) => `/orders/vendor/${vendorId}/checkout`, order_summary_page: (vendorId: string) => `/orders/vendor/${vendorId}/order-summary`,


    profile_account_page: `/profile/account`,
    profile_favorites_page: `/profile/favorites`,
    profile_notifications_page: `/profile/notifications`,
    profile_referral_page: `/profile/referral`,
    profile_faqs_page: `/profile/faqs`,

    profile_verify_phone_page: `/profile/verify-phone`,

    profile_addresses_page: `/profile/addresses`,
    profile_set_address_manually: `/profile/addresses/set-manually`,

    // admin dashboard pages
    admin_dashboard_page: `/profile/admin-dashboard`,
    admin_dashboard_areas_page: `/profile/admin-dashboard/areas`,
    admin_dashboard_vendor_requests_page: `/profile/admin-dashboard/vendor-requests`,
    admin_dashboard_vendor_request_details_page: (id: string) => `/profile/admin-dashboard/vendor-requests/${id}`,
    admin_dashboard_settings_page: `/profile/admin-dashboard/settings`,

    // operator dashboard pages
    operator_dashboard_page: `/profile/operator-dashboard`,
    operator_dashboard_orders_page: `/profile/operator-dashboard/orders`,
    operator_dashboard_riders_page: `/profile/operator-dashboard/riders`,
    operator_dashboard_categories_page: `/profile/operator-dashboard/categories`,
    operator_dashboard_vendors_page: `/profile/operator-dashboard/vendors`,

    // auth pages
    onboarding_step_one_page: `/onboarding/step-1`,
    onboarding_step_two_page: `/onboarding/step-2`,
    onboarding_step_three_page: `/onboarding/step-3`,
    onboarding_last_step_page: `/onboarding/step-last`,

    onboarding_verify_number_page: `/onboarding/verify-number`,
    onboarding_create_password_page: `/onboarding/create-password`,
    onboarding_set_address_page: `/onboarding/address`,
    onboarding_forgot_password_page: `/onboarding/forgot-password`,
    onboarding_verify_password_reset_page: `/onboarding/forgot-password/verify-otp`,

    onboarding_signup_page: `/onboarding`,
    login_page: `/sign-in`,
    auth_status_page: `/auth-status`,

    // vendor onboarding pages
    vendor_onboarding_step_one_page: `/vendor-onboarding/step-1`,
    vendor_onboarding_step_two_page: `/vendor-onboarding/step-2`,
    vendor_onboarding_step_three_page: `/vendor-onboarding/step-3`,
    vendor_onboarding_personal_details_page: `/vendor-onboarding/personal-details`,
    vendor_onboarding_location_page: '/vendor-onboarding/location',
    vendor_onboarding_verify_email_page: '/vendor-onboarding/verify-email',
    vendor_onboarding_terms_page: `/vendor-onboarding/vendor-terms`,
    vendor_onboarding_create_password_page: `/vendor-onboarding/create-password`,
    vendor_onboarding_progress_page: `/vendor-onboarding/progress`,
    vendor_onboarding_complete_profile_phone: `/vendor-onboarding/profile/verify-phone`,
    vendor_onboarding_complete_profile_image: `/vendor-onboarding/profile/upload-image`,
    vendor_onboarding_complete_profile_identity: `/vendor-onboarding/profile/verify-identity`,
    vendor_onboarding_complete_profile_payment_info: `/vendor-onboarding/payment-info`,

    // vendor dashboard pages
    vendor_dashboard_page: `/profile/vendor-dashboard`,
    vendor_dashboard_request_bike_page: `/profile/vendor-dashboard/request-bike`,
    vendor_dashboard_menu_page: `/profile/vendor-dashboard/menu`,
    vendor_dashboard_payouts_page: `/profile/vendor-dashboard/payouts`,
    vendor_dashboard_payouts_history_page: `/profile/vendor-dashboard/payouts/earnings`,
    vendor_dashboard_single_payout_page: (id: string) => `/profile/vendor-dashboard/payouts/${id}`,

    vendor_dashboard_orders_page: `/profile/vendor-dashboard/orders`,
    vendor_dashboard_new_orders_page: `/profile/vendor-dashboard/orders/new`,
    vendor_dashboard_ongoing_orders_page: `/profile/vendor-dashboard/orders/ongoing`,
    vendor_dashboard_ready_orders_page: `/profile/vendor-dashboard/orders/ready`,
    vendor_dashboard_given_to_rider_orders_page: `/profile/vendor-dashboard/orders/given-to-rider`,
    vendor_dashboard_out_for_delivery_orders_page: `/profile/vendor-dashboard/orders/out-for-delivery`,
    vendor_dashboard_completed_orders_page: `/profile/vendor-dashboard/orders/completed`,
    vendor_dashboard_cancelled_orders_page: `/profile/vendor-dashboard/orders/cancelled`,

    vendor_dashboard_profile_page: `/profile/vendor-dashboard/profile`,
    vendor_dashboard_profile_details_page: `/profile/vendor-dashboard/profile/details`,
    vendor_dashboard_profile_addresses_page: `/profile/vendor-dashboard/profile/addresses`,
    vendor_dashboard_profile_opening_hours_page: `/profile/vendor-dashboard/profile/opening-hours`,
    vendor_dashboard_profile_bank_details_page: `/profile/vendor-dashboard/profile/bank-details`,
}
