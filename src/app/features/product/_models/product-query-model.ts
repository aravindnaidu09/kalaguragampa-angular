export interface IProductQueryParams {
  category?: string;        // Search products by category name
  category_id?: number;     // Category ID filter
  country?: string;         // Country code for pricing
  limit?: number;           // Number of results per page
  name?: string;            // Search products by name
  offset?: number;          // Initial index for results
  price_min?: number;       // Minimum price filter
  price_max?: number;       // Maximum price filter
  sort_by?: string;         // Sorting options (price, name)
  stock_status?: string;    // Availability filter
  rating?: number;          // Rating filter
}
