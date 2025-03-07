import { Injectable, Signal, signal } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { catchError, map, of } from 'rxjs';
import { ProductService } from '../_services/product.service';
import { IProduct } from '../_models/product-model';

// ✅ Actions for NGXS State
export class SearchProducts {
  static readonly type = '[Search] Get Products';
  constructor(public query: string) {}
}

export interface SearchStateModel {
  products: IProduct[];
  totalCount: number;
}

@State<SearchStateModel>({
  name: 'search',
  defaults: {
    products: [],
    totalCount: 0
  }
})
@Injectable()
export class SearchState {
  constructor(private readonly productService: ProductService) {}

  @Selector()
  static products(state: SearchStateModel): IProduct[] {
    return state.products;
  }

  @Selector()
  static totalCount(state: SearchStateModel): number {
    return state.totalCount;
  }

  @Action(SearchProducts)
  searchProducts(ctx: StateContext<SearchStateModel>, action: SearchProducts) {
    return this.productService.getAllProducts({ name: action.query, limit: 10 }).pipe(
      map(response => {
        ctx.patchState({
          products: response.products,
          totalCount: response.totalCount
        });
      }),
      catchError(() => of(ctx.patchState({ products: [] })))
    );
  }
}
