/**
 * public/ altındaki bir görselin ölçüleri. Görsellere width/height verilerek
 * sayfa yüklenirken içerik sıçraması azaltılır.
 */
import path from 'node:path';
import sharp from 'sharp';

const cache = new Map<string, Promise<{ width: number; height: number } | null>>();

export function publicImageSize(src: string | undefined): Promise<{ width: number; height: number } | null> {
  if (!src || !src.startsWith('/') || src.startsWith('//')) return Promise.resolve(null);
  const publicDir = path.resolve('public');
  let file: string;
  try {
    file = path.join(publicDir, decodeURI(src.split(/[?#]/)[0] ?? ''));
  } catch {
    return Promise.resolve(null);
  }
  if (!file.startsWith(publicDir + path.sep)) return Promise.resolve(null);
  let size = cache.get(file);
  if (!size) {
    size = sharp(file)
      .metadata()
      .then(({ width, height }) => (width && height ? { width, height } : null))
      .catch(() => null);
    cache.set(file, size);
  }
  return size;
}
