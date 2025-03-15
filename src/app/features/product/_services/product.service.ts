import { Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PRODUCT_API_URLS } from '../../../core/constants/product-api-urls';
import { deserializeProductReview, IProductReview } from '../_models/product-review';
import { deserializeProductPricing, IProductPricing } from '../_models/product-pricing-model';
import { deserializeProduct, deserializeProducts, IProduct } from '../_models/product-model';
import { deserializeWishlist, IWishlist } from '../_models/wishlist-model';
import { deserializeProductImage, IProductImage } from '../_models/upload-image-model';
import { IProductQueryParams } from '../_models/product-query-model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly baseUrl = APP_SETTINGS.apiBaseUrl;
  wishlistCount = signal<number>(0);

  constructor(private readonly httpClient: HttpClient) { }

  /**
 * Fetch all products with dynamic query parameters using rest operator
 */
  getAllProducts(params: IProductQueryParams): Observable<{
    totalCount: number;
    nextPage: string | null;
    previousPage: string | null;
    products: IProduct[]
  }> {

    let httpParams = new HttpParams();

    // ✅ Dynamically add only defined parameters
    Object.keys(params).forEach(key => {
      if (params[key as keyof IProductQueryParams] !== undefined) {
        httpParams = httpParams.set(key, params[key as keyof IProductQueryParams]!.toString());
      }
    });

    return this.httpClient
      .get<{
        statusCode: number;
        message: string;
        data: {
          count: number;
          next: string | null;
          previous: string | null;
          results: any[]
        }
      }>(
        `${this.baseUrl}${PRODUCT_API_URLS.product.product.list}`,
        { params: httpParams }
      )
      .pipe(
        map((response) => {
          if (!response?.data?.results) {
            throw new Error('Invalid response format');
          }

          return {
            totalCount: response.data.count,  // ✅ Total product count for pagination
            nextPage: response.data.next,     // ✅ Next page URL
            previousPage: response.data.previous, // ✅ Previous page URL
            products: deserializeProducts(response.data.results), // ✅ Extract and deserialize products
          };
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
    return this.httpClient.get(`${this.baseUrl}${PRODUCT_API_URLS.product.categories}`)
      .pipe(
        map((response: any) => response.data),
      );;
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
      .pipe(map((data: any) => deserializeWishlist(data.data)));
  }

  /**
   * Add a product to wishlist
   */
  addToWishlist(productId: number): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}${PRODUCT_API_URLS.product.wishlist.add(productId)}`, {});
  }

  /**
   * Remove a product from wishlist
   */
  removeFromWishlist(productId: number): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}${PRODUCT_API_URLS.product.wishlist.remove(productId)}`);
  }

  /**
   * Method to get the items length in wishlist
   */
  fetchWishlistCount(): void {
    this.httpClient.get<{ count: number }>(`${this.baseUrl}${PRODUCT_API_URLS.product.wishlist.get}`)
      .subscribe((response: any) => {
        this.wishlistCount.set(response.data.length);
      });
  }

}
