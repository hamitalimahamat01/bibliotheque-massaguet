'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Icons } from '@/components/Icons';
import { getImageUrl } from '@/lib/optimize';

interface Book {
  id: string;
  title: string;
  description: string;
  author: string;
  category: string;
  fileType?: string;
  downloads: number;
  views: number;
  createdAt: string;
  coverUrl: string;
  year?: string;
  subject?: string;
}

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const [imageError, setImageError] = useState(false);
  const coverImageUrl = getImageUrl(book.coverUrl);
  const hasCover = coverImageUrl && coverImageUrl.length > 0 && !imageError;

  // 🔥 Gérer le cas où fileType est undefined
  const fileType = book.fileType || 'pdf';
  const fileTypeUpper = fileType.toUpperCase();

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100/50 group">
      <Link href={`/books/${book.id}`} className="block h-full">
        <div className="relative h-48 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center overflow-hidden">
          {hasCover ? (
            <img
              src={coverImageUrl}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <Icons.Book className="w-12 h-12 text-indigo-400" />
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
              {fileTypeUpper}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-white text-sm font-medium">Voir le document</span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-gray-800 text-lg mb-1 line-clamp-1">
            {book.title}
          </h3>
          <p className="text-sm text-gray-500 mb-2">{book.author || 'Anonyme'}</p>
          {book.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {book.description}
            </p>
          )}
          <div className="flex items-center justify-between text-sm text-gray-400 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1.5">
              <Icons.Download className="w-4 h-4" />
              {book.downloads || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <Icons.View className="w-4 h-4" />
              {book.views || 0}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
