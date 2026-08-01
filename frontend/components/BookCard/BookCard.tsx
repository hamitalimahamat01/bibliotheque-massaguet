'use client';

import Link from 'next/link';
import { Icons } from '@/components/Icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BookCardProps {
  book: {
    id: string;
    title: string;
    description: string;
    author: string;
    category: string;
    fileType: string;
    downloads: number;
    views: number;
    createdAt: string;
    coverUrl: string;
    year?: string;
    subject?: string;
  };
}

export default function BookCard({ book }: BookCardProps) {
  const getFileIcon = () => {
    const icons: Record<string, JSX.Element> = {
      pdf: <Icons.Book className="w-6 h-6" />,
      docx: <Icons.Book className="w-6 h-6" />,
      ppt: <Icons.Book className="w-6 h-6" />,
    };
    return icons[book.fileType] || <Icons.Book className="w-6 h-6" />;
  };

  const getFileColor = () => {
    const colors: Record<string, string> = {
      pdf: 'text-red-500 bg-red-50',
      docx: 'text-blue-500 bg-blue-50',
      ppt: 'text-orange-500 bg-orange-50',
    };
    return colors[book.fileType] || 'text-gray-500 bg-gray-50';
  };

  const getCategoryLabel = () => {
    if (book.category === 'prepa') {
      return book.subject || 'Prépa';
    }
    return 'Général';
  };

  const getCategoryColor = () => {
    if (book.category === 'prepa') {
      return 'bg-purple-100 text-purple-700';
    }
    return 'bg-indigo-100 text-indigo-700';
  };

  return (
    <Link href={`/books/${book.id}`} className="block group">
      <div className="card-modern h-full flex flex-col overflow-hidden">
        {/* Cover */}
        <div className="relative h-48 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center overflow-hidden">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className={`p-4 rounded-2xl ${getFileColor()}`}>
                {getFileIcon()}
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${getFileColor()}`}>
                {book.fileType.toUpperCase()}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 right-3 flex gap-2">
            <span className={`badge ${getCategoryColor()}`}>
              {getCategoryLabel()}
            </span>
            {book.year && (
              <span className="badge bg-white/90 backdrop-blur-sm text-gray-700">
                {book.year}
              </span>
            )}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-white text-sm font-medium flex items-center gap-2">
              <Icons.ArrowRight className="w-4 h-4" />
              Voir le document
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-800 text-lg mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-gray-500 mb-2">par {book.author}</p>
          {book.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
              {book.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-400 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1.5">
              <Icons.Download className="w-4 h-4" />
              {book.downloads || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <Icons.View className="w-4 h-4" />
              {book.views || 0}
            </span>
            <span className="text-xs">
              {format(new Date(book.createdAt), 'dd MMM yyyy', { locale: fr })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
