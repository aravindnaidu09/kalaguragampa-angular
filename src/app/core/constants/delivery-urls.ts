export const DELIVERY_API_URLS = {
  delivery: {
    getAll: '/delivery/api/v1/delivery/',
    create: '/delivery/api/v1/delivery/',
    update: '/delivery/api/v1/delivery/',
    track: (deliveryId: string) => `/delivery/api/v1/delivery/track/${deliveryId}/`
  }
};
