import imageCompression from 'browser-image-compression';

interface OptimizeImageOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

export async function optimizeImage(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<File> {
  const {
    maxSizeMB = 0.5,
    maxWidthOrHeight = 1200,
    useWebWorker = true,
  } = options;

  const compressionOptions = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker,
    fileType: 'image/webp',
    initialQuality: 0.85,
    alwaysKeepResolution: false,
  };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    const newName = file.name.replace(/\.[^.]+$/, '') + '.webp';
    
    return new File([compressedFile], newName, {
      type: 'image/webp',
    });
  } catch (error) {
    console.warn('Erreur compression, utilisation du fichier original:', error);
    return file;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // Si c'est déjà une URL complète, la retourner
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  
  // Utiliser la base URL pour les images (sans /api)
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://bibliotheque-backend-wfkn.onrender.com';
  
  // Nettoyer l'URL
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  
  // Construire l'URL complète
  const fullUrl = `${baseUrl}${cleanUrl}`;
  
  console.log('📸 Image URL:', { original: url, full: fullUrl }); // Pour déboguer
  
  return fullUrl;
}
