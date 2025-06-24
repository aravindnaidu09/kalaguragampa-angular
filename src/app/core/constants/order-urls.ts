export const ORDER_API_URLS = {
  order: {
    getAll: '/orders/api/v1/history/',
    invoiceDownload: (orderId: number) => `/orders/api/v1/${orderId}/invoice/`
  },
  coupon: {
    apply: '/orders/api/v1/coupons/apply'
  }
};
