export const PRODUCT_API_URLS = {

  product: {
    categories: '/products/api/v1/categories/',
    category: {
      create: '/products/api/v1/category/',
      getById: (id: string) => `/products/api/v1/category/${id}/`,
      update: (id: string) => `/products/api/v1/category/${id}/`,
    },
    product: {
      create: '/products/api/v1/product/',
      getById: (productPk: string) => `/products/api/v1/product/${productPk}/`,
      update: (productPk: string) => `/products/api/v1/product/${productPk}/update/`,
      list: '/products/api/v1/products/',
    },
    pricing: '/products/api/v1/pricing/',
    reviews: {
      getByProductId: (productId: number) => `/products/api/v1/${productId}/reviews/`,
      add: (productId: number) => `/products/api/v1/reviews/${productId}/`,
    },
    uploadImage: '/products/api/v1/upload-image/',
    wishlist: {
      get: '/products/api/v1/wishlist/',
      add: (productId: number) => `/products/api/v1/wishlist/${productId}/`,
      remove: (productId: number) => `/products/api/v1/wishlist/${productId}/`,
    },
  },
}
