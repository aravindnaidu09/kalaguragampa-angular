import { Breadcrumb } from "../state/breadcrumb.state";

// ✅ Static breadcrumb entries
export const STATIC_BREADCRUMB_CONFIG: Record<string, Breadcrumb[]> = {
  home: [{ label: 'Home', url: '/' }],
  wishlist: [
    { label: 'Home', url: '/' },
    { label: 'Wishlist', url: '/wishlist' }
  ],
  cart: [
    { label: 'Home', url: '/' },
    { label: 'Cart', url: '/cart' }
  ],
  orders: [
    { label: 'Home', url: '/' },
    { label: 'My Orders', url: '/orders' }
  ],
  trackOrder: [
    { label: 'Home', url: '/' },
    { label: 'Track Order', url: '/track-order' }
  ],
  filters: [
    { label: 'Home', url: '/' },
    { label: 'Filter Results', url: '/filters' }
  ]
};

// ✅ Dynamic breadcrumb generator
export const getProductBreadcrumbs = (productId: string): Breadcrumb[] => [
  { label: 'Home', url: '/' },
  { label: 'Products', url: '/products' },
  { label: 'View Product', url: `/products/${productId}` }
];
