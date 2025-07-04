import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes a filename by removing or replacing problematic characters
 * that are not allowed in Supabase Storage object keys
 */
export function sanitizeFilename(filename: string): string {
  return filename
    // Remove diacritics (accents) - convert 'è' to 'e', 'à' to 'a', etc.
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces with underscores
    .replace(/\s+/g, '_')
    // Remove any remaining special characters except alphanumeric, underscore, hyphen, and dot
    .replace(/[^a-zA-Z0-9._-]/g, '')
    // Remove multiple consecutive underscores
    .replace(/_+/g, '_')
    // Remove leading/trailing underscores
    .replace(/^_+|_+$/g, '');
}