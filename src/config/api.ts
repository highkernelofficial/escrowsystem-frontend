export const API_URL = "/api/backend";

/**
 * buildUrl Helper
 * 
 * Constructs a full API URL by appending the provided path to the base API_URL.
 * Use this to ensure consistent URL management across the application.
 */
export const buildUrl = (path: string) => `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
