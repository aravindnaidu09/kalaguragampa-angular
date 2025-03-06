export const APP_SETTINGS = {
  environment: getEnvironment(), // Dev, Test, or Prod
  apiBaseUrl: getApiBaseUrl(),
};

/**
 * Determine the current environment dynamically
 */
function getEnvironment(): 'development' | 'test' | 'production' {
  const hostname = window.location.hostname;

  if (hostname.includes('test')) {
    return 'test';
  } else if (hostname.includes('prod') || hostname.includes('example.com')) {
    return 'production';
  } else {
    return 'development';
  }
}

/**
 * Get the API base URL based on the environment
 */
function getApiBaseUrl(): string {
  const env = getEnvironment();

  const apiUrls = {
    development: 'http://45.149.205.253:8000',  // Dev API
    test: 'https://test-api.example.com',        // Test API
    production: 'https://45.149.205.253:2025'       // Production API
  };

  return apiUrls[env];
}
