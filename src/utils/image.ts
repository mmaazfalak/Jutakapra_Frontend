/**
 * High-fidelity image optimization utility
 * Guarantees crisp, retina-sharp image rendering while maximizing network delivery speed.
 */

export interface ImageOptimizationOptions {
  width?: number;
  quality?: number; // 85 by default (high archival fidelity)
  fit?: 'crop' | 'clip' | 'scale';
}

export function getHighFidelityImageUrl(
  url: string | undefined | null,
  options: ImageOptimizationOptions = {}
): string {
  if (!url) return '';
  const { width = 800, quality = 85, fit = 'crop' } = options;

  // 1. Unsplash High-Fidelity Auto-Format
  if (url.includes('images.unsplash.com')) {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('auto', 'format');
      parsedUrl.searchParams.set('fit', fit);
      parsedUrl.searchParams.set('w', String(width));
      parsedUrl.searchParams.set('q', String(quality));
      return parsedUrl.toString();
    } catch {
      return url;
    }
  }

  // 2. Cloudinary Auto-Format
  if (url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', `/upload/f_auto,q_${quality},w_${width},c_${fit}/`);
  }

  // 3. Supabase Storage / Other origins - preserve original high quality
  return url;
}

/**
 * Generate standard and Retina (2x) srcset for crisp display on 4K/Retina displays
 */
export function getRetinaSrcSet(
  url: string | undefined | null,
  baseWidth: number = 400,
  quality: number = 85
): string {
  if (!url || !url.includes('images.unsplash.com')) return '';

  const img1x = getHighFidelityImageUrl(url, { width: baseWidth, quality });
  const img2x = getHighFidelityImageUrl(url, { width: baseWidth * 2, quality });

  return `${img1x} 1x, ${img2x} 2x`;
}
