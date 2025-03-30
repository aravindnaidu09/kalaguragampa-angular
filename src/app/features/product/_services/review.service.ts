import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { deserializeProductReview, IProductReview } from '../_models/product-review';
import { HttpClient } from '@angular/common/http';
import { APP_SETTINGS } from '../../../core/constants/app-settings';
import { PRODUCT_API_URLS } from '../../../core/constants/product-api-urls';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly baseUrl = APP_SETTINGS.apiBaseUrl;


  constructor(private httpClient: HttpClient) { }

  /**
    * Fetch product reviews
    */
  getProductReviews(productId: number): Observable<IProductReview[]> {
    return this.httpClient.get<IProductReview[]>(`${this.baseUrl}${PRODUCT_API_URLS.product.reviews.getByProductId(productId)}`)
      .pipe(map((reviews: any[]) => reviews.map(deserializeProductReview)));;
  }

  /**
   * Add a review for a product
   */
  addReview(productId: number, review: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}${PRODUCT_API_URLS.product.reviews.add(productId)}`, review);
  }

}
