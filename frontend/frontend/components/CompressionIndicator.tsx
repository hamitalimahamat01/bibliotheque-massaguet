import { Icons } from './Icons';

interface CompressionIndicatorProps {
  progress: number;
  isCompressing: boolean;
  fileSize: number;
  originalSize?: number;
}

export function CompressionIndicator({
  progress,
  isCompressing,
  fileSize,
  originalSize,
}: CompressionIndicatorProps) {
  if (!isCompressing && !originalSize) return null;

  const savedPercent = originalSize 
    ? Math.round(((originalSize - fileSize) / originalSize) * 100)
    : 0;

  return (
    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200/50">
      <div className="flex items-center gap-3">
        {isCompressing ? (
          <>
            <svg className="animate-spin w-5 h-5 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-700">Optimisation en cours...</p>
              <div className="w-48 h-1.5 bg-blue-200 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <Icons.Check className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-700">Optimisation terminée</p>
              {savedPercent > 0 && (
                <p className="text-xs text-green-600">
                  Taille réduite de {savedPercent}% ({formatFileSize(fileSize)})
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
