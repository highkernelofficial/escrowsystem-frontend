export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lianoid-jung-nonappendicular.ngrok-free.dev";

/**
 * buildUrl Helper
 * 
 * Constructs a full API URL by appending the provided path to the base API_URL.
 * Use this to ensure consistent URL management across the application.
 */
export const buildUrl = (path: string) => `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
