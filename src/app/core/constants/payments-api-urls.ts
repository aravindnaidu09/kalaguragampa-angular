export const PAYMENT_API_URLS = {
  payment: {
    createOrder: '/orders/api/v1/create/',
    verifyPayment: (orderPk: string) => `/orders/api/v1/${orderPk}/verify-payment/`,
  },
}
