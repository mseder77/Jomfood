const ACCESS_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const authStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY) || null,
  setAccessToken: (token) => localStorage.setItem(ACCESS_TOKEN_KEY, token || ''),
  clearAccessToken: () => localStorage.removeItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY) || null,
  setRefreshToken: (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token || ''),
  clearRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),
  clearAll: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export default authStorage;


