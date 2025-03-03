import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PRODUCT_API_URLS } from '../../../core/constants/product-api-urls';
import { deserializeProductReview, IProductReview } from '../_models/product-review';
import { deserializeProductPricing, IProductPricing } from '../_models/product-pricing-model';
import { deserializeProduct, deserializeProducts, IProduct } from '../_models/product-model';
import { deserializeWishlist, IWishlist } from '../_models/wishlist-model';
import { deserializeProductImage, IProductImage } from '../_models/upload-image-model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly baseUrl = APP_SETTINGS.apiBaseUrl;

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Fetch all products
   */
  getAllProducts(
    category?: string,
    name?: string,
    priceMin?: number,
    priceMax?: number,
    sortBy?: string,
    stockStatus?: string
  ): Observable<IProduct[]> {

    // Building query params dynamically
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (name) params = params.set('name', name);
    if (priceMin !== undefined) params = params.set('price_min', priceMin.toString());
    if (priceMax !== undefined) params = params.set('price_max', priceMax.toString());
    if (sortBy) params = params.set('sort_by', sortBy);
    if (stockStatus) params = params.set('stock_status', stockStatus);

    return this.httpClient.get<any>(`${this.baseUrl}${PRODUCT_API_URLS.product.product.list}`, { params })
    .pipe(
      map((response) => {
        // Check if `results` key exists (Paginated Response)
        const products = response?.results ? response.results : response;
        return deserializeProducts(products);
      })
    );
  }

  /**
   * Fetch product by ID
   */
  getProductById(productPk: string): Observable<IProduct> {
    return this.httpClient.get<IProduct>(`${this.baseUrl}${PRODUCT_API_URLS.product.product.getById(productPk)}`)
    .pipe(map((data) => deserializeProduct(data)));;
  }

  /**
   * Create a new product
   */
  addProduct(productData: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}${PRODUCT_API_URLS.product.product.create}`, productData);
  }

  /**
   * Update a product
   */
  updateProduct(productPk: string, productData: any): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}${PRODUCT_API_URLS.product.product.update(productPk)}`, productData);
  }

  /**
   * Fetch all categories
   */
  getCategories(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}${PRODUCT_API_URLS.product.categories}`);
  }

  /**
   * Fetch category by ID
   */
  getCategoryById(id: string): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}${PRODUCT_API_URLS.product.category.getById(id)}`);
  }

  /**
   * Create a new category
   */
  addCategory(categoryData: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}${PRODUCT_API_URLS.product.category.create}`, categoryData);
  }

  /**
   * Update category by ID
   */
  updateCategory(id: string, categoryData: any): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}${PRODUCT_API_URLS.product.category.update(id)}`, categoryData);
  }

  /**
   * Get product pricing
   */
  getProductPricing(): Observable<IProductPricing> {
    return this.httpClient.post<IProductPricing>(`${this.baseUrl}${PRODUCT_API_URLS.product.pricing}`, {})
    .pipe(map((data) => deserializeProductPricing(data)));;
  }

  /**
   * Fetch product reviews
   */
  getProductReviews(productId: string): Observable<IProductReview[]> {
    return this.httpClient.get<IProductReview[]>(`${this.baseUrl}${PRODUCT_API_URLS.product.reviews.getByProductId(productId)}`)
    .pipe(map((reviews: any[]) => reviews.map(deserializeProductReview)));;
  }

  /**
   * Add a review for a product
   */
  addReview(productId: string, review: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}${PRODUCT_API_URLS.product.reviews.add(productId)}`, review);
  }

  /**
   * Upload product image
   */
  uploadProductImage(productId: number, imageFile: File, isPrimary: boolean): Observable<IProductImage> {

    const formData = new FormData();
    formData.append('product', productId.toString());
    formData.append('image', imageFile);
    formData.append('is_primary', String(isPrimary));

    return this.httpClient.post<IProductImage>(`${this.baseUrl}${PRODUCT_API_URLS.product.uploadImage}`, formData)
    .pipe(
      map(response => deserializeProductImage(response))
    );;
  }

  /**
   * Fetch wishlist items
   */
  getWishlist(): Observable<IWishlist[]> {
    return this.httpClient
      .get<IWishlist[]>(`${this.baseUrl}${PRODUCT_API_URLS.product.wishlist.get}`)
      .pipe(map((data) => deserializeWishlist(data)));
  }

  /**
   * Add a product to wishlist
   */
  addToWishlist(productId: string): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}${PRODUCT_API_URLS.product.wishlist.add(productId)}`, {});
  }

  /**
   * Remove a product from wishlist
   */
  removeFromWishlist(productId: string): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}${PRODUCT_API_URLS.product.wishlist.remove(productId)}`);
  }

}
