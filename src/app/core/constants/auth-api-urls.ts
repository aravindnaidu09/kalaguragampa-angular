export const AUTH_API_URLS = {
  auth: {
    login: '/auth/api/v1/login/',
    logout: '/auth/api/v1/logout/',
    sendOtp: '/auth/api/v1/send-otp/',
    resendOtp: '/auth/api/v1/resend-otp/',
    verifyOtp: '/auth/api/v1/verify-otp/',
    tokenRefresh: '/auth/api/v1/token/refresh/',
    tokenVerify: '/auth/api/v1/token/verify/',
  },
  user: {
    register: '/auth/api/v1/users/register',
    changePassword: '/auth/api/v1/users/change-pwd',
    passwordReset: '/auth/api/v1/users/password-reset',
  },
};
