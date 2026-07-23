'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function UploadBookPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    author: '',
    category: 'general',
    subCategory: '',
    subject: '',
    year: '',
  });

  // Dropzone pour le fichier
  const { getRootProps: getFileRootProps, getInputProps: getFileInputProps, isDragActive: isFileDragActive } = useDropzone({
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

  // Dropzone pour la couverture
  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isDragActive: isCoverDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setCover(file);
        // Créer une prévisualisation
        const reader = new FileReader();
        reader.onloadend = () => {
          setCoverPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        toast.success(`Couverture ajoutée: ${file.name}`);
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRemoveCover = () => {
    setCover(null);
    setCoverPreview(null);
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

      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erreur lors du partage');
        return;
      }

      toast.success('Document partagé avec succès !');
      router.push('/books');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors du partage');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <Icons.User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Connexion requise</h2>
          <p className="text-gray-500 mb-6">Vous devez être connecté pour partager un document</p>
          <Link href="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 inline-flex items-center gap-2">
            <Icons.Login className="w-5 h-5" />
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Link href="/books" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm">
          <Icons.ArrowLeft className="w-4 h-4" />
          Retour à la bibliothèque
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Icons.Upload className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Partager un document</h1>
              <p className="text-gray-500 text-sm">Ajoutez un nouveau document à la bibliothèque</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre du document <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex: Cours de mathématiques niveau BAC"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {/* Auteur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auteur <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="author"
              value={form.author}
              onChange={handleChange}
              placeholder="Nom de l'auteur"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Décrivez brièvement le contenu du document..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-vertical transition-all"
            />
          </div>

          {/* Catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all"
              >
                <option value="">Aucune</option>
                <option value="bef">BEF</option>
                <option value="bac">BAC</option>
              </select>
            </div>
          </div>

          {/* Matière et année */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Ex: Mathématiques"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Fichier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fichier <span className="text-red-500">*</span>
            </label>
            <div
              {...getFileRootProps()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isFileDragActive 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : file 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }`}
            >
              <input {...getFileInputProps()} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Icons.Upload className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Icons.Close className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Icons.Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">
                    {isFileDragActive ? 'Déposez le fichier ici' : 'Glissez-déposez votre fichier ici ou'}
                  </p>
                  <p className="text-indigo-600 font-medium">Parcourir</p>
                  <p className="text-xs text-gray-400 mt-2">PDF, DOCX, PPT (max 50 MB)</p>
                </>
              )}
            </div>
          </div>

          {/* Couverture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo de couverture</label>
            <div
              {...getCoverRootProps()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isCoverDragActive 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : cover 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }`}
            >
              <input {...getCoverInputProps()} />
              
              {coverPreview ? (
                <div className="relative">
                  <img
                    src={coverPreview}
                    alt="Aperçu de la couverture"
                    className="max-h-40 mx-auto rounded-lg object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveCover(); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <Icons.Close className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Icons.Image className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    {isCoverDragActive ? 'Déposez l\'image ici' : 'Glissez-déposez une image ou'}
                  </p>
                  <p className="text-indigo-600 font-medium text-sm">Parcourir</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (max 5 MB)</p>
                </>
              )}
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Publication en cours...
              </>
            ) : (
              <>
                <Icons.Upload className="w-5 h-5" />
                Partager le document
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
