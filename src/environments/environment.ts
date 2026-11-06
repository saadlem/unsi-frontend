export const environment = {
  production: false,
  apiUrl: '/api',
  /** Local/dev only: skip route auth + accept default admin without API */
  skipAuth: true,
  defaultAdmin: {
    username: 'admin',
    password: 'admin123',
    name: 'Admin Dev'
  }
};
