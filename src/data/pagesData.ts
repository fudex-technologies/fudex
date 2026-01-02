export const PAGES_DATA = {
    home_page: `/`,
    search_page: `/search`,
    orders_page: `/orders`,
    profile_page: `/profile`,

    single_vendor_page: (id: string) => `/vendors/${id}`,
    single_vendor_product_page: (vendorId: string, prodId: string) => `/vendors/${vendorId}/${prodId}`,
    single_vendor_reviews_page: (vendorId: string) => `/vendors/${vendorId}/reviews`,
    single_vendor_rate_page: (vendorId: string) => `/vendors/${vendorId}/rate`,

    // orders pages
    tray_page: '/orders/tray',
    ongoing_orders_page: '/orders/ongoing-orders',
    completed_orders_page: '/orders/completed-orders',

    order_summary_page: (orderId: string) => `/orders/${orderId}/order-summary`,
    completed_order_info_page: (orderId: string) => `/orders/${orderId}/completed-order-info`,
    summary_page: (orderId: string) => `/orders/${orderId}/order-summary`,
    order_info_page: (orderId: string) => `/orders/${orderId}/order-info`,
    checkout_page: (orderId: string) => `/orders/${orderId}/checkout`,

    profile_account_page: `/profile/account`,
    profile_favorites_page: `/profile/favorites`,
    profile_notifications_page: `/profile/notifications`,
    profile_faqs_page: `/profile/faqs`,

    profile_addresses_page: `/profile/addresses`,
    profile_set_address_manually: `/profile/addresses/set-manually`,

    // vendor dashboard pages
    vendor_dashboard_page: `/profile/vendor-dashboard`,
    vendor_dashboard_profile_page: `/profile/vendor-dashboard/profile`,
    vendor_dashboard_products_page: `/profile/vendor-dashboard/products`,
    vendor_dashboard_orders_page: `/profile/vendor-dashboard/orders`,

    // auth pages
    onboarding_step_one_page: `/onboarding/step-1`,
    onboarding_step_two_page: `/onboarding/step-2`,
    onboarding_step_three_page: `/onboarding/step-3`,
    onboarding_last_step_page: `/onboarding/step-last`,

    onboarding_verify_number_page: `/onboarding/verify-number`,
    onboarding_create_password_page: `/onboarding/create-password`,
    onboarding_set_address_page: `/onboarding/address`,

    onboarding_signup_page: `/onboarding`,
    login_page: `/sign-in`,
    auth_status_page: `/auth-status`,
}
