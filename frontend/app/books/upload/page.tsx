'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { booksApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function UploadBookPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    author: '',
    category: 'general',
    subCategory: '',
    subject: '',
    year: '',
  });

  const { getRootProps: getFileRootProps, getInputProps: getFileInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    maxSize: 50 * 1024 * 1024,
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        toast.success(`Fichier ajouté: ${acceptedFiles[0].name}`);
      }
    },
    onDropRejected: (rejections) => {
      const error = rejections[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        toast.error('Le fichier ne doit pas dépasser 50 MB');
      } else if (error?.code === 'file-invalid-type') {
        toast.error('Format non supporté. Utilisez PDF, DOCX ou PPT');
      }
    },
  });

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setCover(acceptedFiles[0]);
        toast.success(`Couverture ajoutée: ${acceptedFiles[0].name}`);
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    if (!form.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    if (!form.author.trim()) {
      toast.error('L\'auteur est requis');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (cover) formData.append('cover', cover);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('author', form.author);
      formData.append('category', form.category);
      formData.append('subCategory', form.subCategory);
      formData.append('subject', form.subject);
      formData.append('year', form.year);

      await booksApi.create(formData);
      toast.success('Livre partagé avec succès !');
      router.push('/books');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors du partage');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Connexion requise</h2>
        <p className="text-gray-500 mb-6">Vous devez être connecté pour partager un document</p>
        <Link href="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Partager un document</h1>
      <p className="text-gray-500 mb-6">Ajoutez un nouveau document à la bibliothèque</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
        {/* Titre */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Titre du document"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            required
          />
        </div>

        {/* Auteur */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Auteur *</label>
          <input
            type="text"
            name="author"
            value={form.author}
            onChange={handleChange}
            placeholder="Nom de l'auteur"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description du document"
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-vertical"
          />
        </div>

        {/* Catégorie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
            >
              <option value="general">Bibliothèque générale</option>
              <option value="prepa">Prépa BEF/BAC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sous-catégorie</label>
            <select
              name="subCategory"
              value={form.subCategory}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">Aucune</option>
              <option value="bef">BEF</option>
              <option value="bac">BAC</option>
            </select>
          </div>
        </div>

        {/* Matière et année */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Ex: Mathématiques"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
            <input
              type="text"
              name="year"
              value={form.year}
              onChange={handleChange}
              placeholder="2024-2025"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Fichier */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Fichier *</label>
          <div
            {...getFileRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-indigo-400'
            }`}
          >
            <input {...getFileInputProps()} />
            {file ? (
              <div>
                <svg className="w-12 h-12 mx-auto text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <>
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600">Glissez-déposez votre fichier ici ou</p>
                <p className="text-indigo-600 font-medium">Parcourir</p>
                <p className="text-xs text-gray-400 mt-2">PDF, DOCX, PPT (max 50 MB)</p>
              </>
            )}
          </div>
        </div>

        {/* Couverture */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Couverture (optionnel)</label>
          <div
            {...getCoverRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              cover ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-indigo-400'
            }`}
          >
            <input {...getCoverInputProps()} />
            {cover ? (
              <div>
                <svg className="w-8 h-8 mx-auto text-green-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium text-gray-800">{cover.name}</p>
                <p className="text-sm text-gray-500">{(cover.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600">Ajouter une image de couverture</p>
                <p className="text-xs text-gray-400">JPG, PNG, WEBP (max 5 MB)</p>
              </>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Publication en cours...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Partager le document
            </>
          )}
        </button>
      </form>
    </div>
  );
}
