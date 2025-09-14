// breadcrumb.model.ts
export interface BreadcrumbItem {
  label: string;
  /** Absolute/relative URL or array for RouterLink */
  url?: string | any[];
  /** Optional query params for RouterLink */
  queryParams?: Record<string, any>;
  /** Optional Material icon name */
  icon?: string;
  /** Optional aria-label override */
  ariaLabel?: string;
}
