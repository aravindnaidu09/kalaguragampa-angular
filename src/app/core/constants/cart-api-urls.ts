export const CART_API_URLS = {
  cart: {
    getCart: '/products/api/v1/cart/',
    clearCart: '/products/api/v1/cart/',
    addItem: '/products/api/v1/cart/',
    updateItem: (id: string) => `/products/api/v1/cart/${id}/`,
    removeItem: (id: string) => `/products/api/v1/cart/${id}/`,
  },

}
