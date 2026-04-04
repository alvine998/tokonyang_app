import axios from 'axios';

/**
 * Centralized API utility for Tokonyang App
 */
const api = axios.create({
  baseURL: 'https://api.tokotitoh.co.id',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'bearer-token': 'tokotitohapi',
    'x-partner-code': 'id.marketplace.tokotitoh',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can modify request config here (e.g., adding dynamic auth tokens if needed)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Detailed error logging to help debug "Network Error" on Android
    if (!error.response && error.request) {
      console.error('[API_ERROR] No response received. Full Error JSON:', {
        message: error.message,
        code: error.code,
        config: error.config?.url,
        request: error.request?._url || 'N/A',
        toJSON: error.toJSON ? error.toJSON() : 'N/A'
      });
    } else if (error.response) {
      console.error(`[API_ERROR] Server responded with code ${error.response.status}:`, error.response.data);
    } else {
      console.error('[API_ERROR] Error message:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
