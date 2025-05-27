import { Breadcrumb } from './breadcrumb.state';

export class SetBreadcrumbs {
  static readonly type = '[Breadcrumb] Set';
  constructor(public breadcrumbs: Breadcrumb[]) {}
}

export class ClearBreadcrumbs {
  static readonly type = '[Breadcrumb] Clear';
}
