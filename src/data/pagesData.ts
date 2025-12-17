export const PAGES_DATA = {
    home_page: `/`,
    search_page: `/search`,
    orders_page: `/orders`,
    profile_page: `/profile`,

    single_vendor_page: (id: string) => `/vendors/${id}`,
    vendor_product_page: (vendorId: string, prodId: string) => `/vendors/${vendorId}/${prodId}`,

    // orders pages
    tray_page: '/orders/tray',
    ongoing_orders_page: '/orders/ongoing-orders',
    completed_orders_page: '/orders/completed-orders',
}