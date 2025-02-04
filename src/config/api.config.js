export const API_CONFIG = {
  newsapi: {
    key: import.meta.env.VITE_NEWSAPI_KEY,
    maxRequestsPerDay: 90,
    requestInterval: 3600000 * 4, // 4 heures entre chaque requête pour ne pas dépasser la limite
  },
};
