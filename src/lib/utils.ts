import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely, giving priority to the rightmost classes.
 * Perfect for combining default component classes with user-overridden classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
