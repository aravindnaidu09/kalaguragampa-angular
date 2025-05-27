import { Injectable } from "@angular/core";
import { State, Selector, Action, StateContext } from "@ngxs/store";
import { SetBreadcrumbs, ClearBreadcrumbs } from "./breadcrumb.actions";

export interface Breadcrumb {
  label: string;
  url: string;
}

export interface BreadcrumbStateModel {
  breadcrumbs: Breadcrumb[];
}

@State<BreadcrumbStateModel>({
  name: 'breadcrumb',
  defaults: {
    breadcrumbs: []
  }
})
@Injectable()
export class BreadcrumbState {
  @Selector()
  static breadcrumbs(state: BreadcrumbStateModel) {
    return state.breadcrumbs;
  }

  @Action(SetBreadcrumbs)
  setBreadcrumbs(ctx: StateContext<BreadcrumbStateModel>, action: SetBreadcrumbs) {
    ctx.patchState({ breadcrumbs: action.breadcrumbs });
  }

  @Action(ClearBreadcrumbs)
  clearBreadcrumbs(ctx: StateContext<BreadcrumbStateModel>) {
    ctx.patchState({ breadcrumbs: [] });
  }
}
