export const PAGES_DATA = {
    home_page: `/`,
    search_page: `/search`,
    orders_page: `/orders`,
    profile_page: `/profile`,

    single_vendor_page: (id: string) => `/vendors/${id}`,
    vendor_product_page: (vendorId: string, prodId: string) => `/vendors/${vendorId}/${prodId}`,
}