import { inject, Injectable } from "@angular/core";
import { Store } from "@ngxs/store";
import { Breadcrumb, BreadcrumbState } from "./breadcrumb.state";
import { ClearBreadcrumbs, SetBreadcrumbs } from "./breadcrumb.actions";

@Injectable({ providedIn: 'root' })
export class BreadcrumbFacade {
  private store = inject(Store);

  /**
   * Selects the current breadcrumbs from the state.
   * This is a signal that will automatically update when the state changes.
   */
  readonly breadcrumbs = this.store.selectSignal(BreadcrumbState.breadcrumbs);

  /**
   * Sets the breadcrumbs in the state.
   * @param breadcrumbs - An array of Breadcrumb objects to set.
   */
  setBreadcrumb(breadcrumbs: Breadcrumb[]) {
    this.store.dispatch(new SetBreadcrumbs(breadcrumbs));
  }

  /**
   * Clears the breadcrumbs from the state.
   * This will reset the breadcrumbs to an empty array.
   */
  clearBreadcrumb() {
    this.store.dispatch(new ClearBreadcrumbs());
  }
}
