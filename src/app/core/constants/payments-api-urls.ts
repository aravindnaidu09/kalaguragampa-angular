export const PAYMENT_API_URLS = {
  payment: {
    createOrder: '/payments/api/v1/order/',
    verifyPayment: (orderPk: string) => `/payments/api/v1/order/${orderPk}/verify-payment/`,
  },
}
