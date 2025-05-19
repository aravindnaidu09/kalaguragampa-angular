export const DELIVERY_API_URLS = {
  delivery: {
    estimate: '/delivery/api/v1/delivery/', // GET for shipping estimate
    createOrder: '/delivery/api/v1/delivery/', // POST to create delivery order
    cancelOrder: '/delivery/api/v1/delivery-order/cancel/', // POST to cancel delivery
    initiateReturn: '/delivery/api/v1/delivery-order/initiate-return/', // POST to start return
    track: (deliveryId: number) => `/delivery/api/v1/delivery/track/${deliveryId}/` // GET for tracking
  }
};
