import { APP_SETTINGS } from "./app-settings";

// src/app/checkout/_constants/address-api.constants.ts
export const ADDRESS_API_URLS = {
  base: APP_SETTINGS.apiBaseUrl,
  address: {
    create: '/auth/api/v1/users/address/create',
    getAll: '/auth/api/v1/users/addresses/',
    update: (id: string | number) => `/auth/api/v1/users/addresses/${id}/`,
    delete: (id: string | number) => `/auth/api/v1/users/addresses/${id}/`,
  },
};
