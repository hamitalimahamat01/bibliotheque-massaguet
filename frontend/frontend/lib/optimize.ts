import imageCompression from 'browser-image-compression';

interface OptimizeImageOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
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

  const supportsAvif = await checkAvifSupport();
  const preferredFormat = supportsAvif ? 'image/avif' : 'image/webp';

  const compressionOptions = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker,
    fileType: preferredFormat,
    initialQuality: 0.85,
    alwaysKeepResolution: false,
  };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    const ext = supportsAvif ? 'avif' : 'webp';
    const newName = file.name.replace(/\.[^.]+$/, '') + '.' + ext;
    
    return new File([compressedFile], newName, {
      type: preferredFormat,
    });
  } catch (error) {
    console.warn('Erreur compression AVIF, fallback WebP:', error);
    const fallbackOptions = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.85,
    };
    const fallbackFile = await imageCompression(file, fallbackOptions);
    const newName = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([fallbackFile], newName, {
      type: 'image/webp',
    });
  }
}

async function checkAvifSupport(): Promise<boolean> {
  try {
    const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    
    const response = await fetch(avifData);
    const blob = await response.blob();
    
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(true);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };
      
      img.src = url;
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve(false);
      }, 3000);
    });
  } catch (e) {
    return false;
  }
}

export function optimizeDocument(file: File): File {
  if (file.type === 'application/pdf' && file.size > 10 * 1024 * 1024) {
    console.warn('PDF volumineux, une compression sera effectuée côté serveur');
  }
  return file;
}

export async function optimizeFile(
  file: File,
  type: 'image' | 'document'
): Promise<File> {
  if (type === 'image') {
    return await optimizeImage(file);
  }
  return optimizeDocument(file);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mimeTypes: Record<string, string> = {
    'avif': 'image/avif',
    'webp': 'image/webp',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
