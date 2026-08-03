'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/Icons';
import { optimizeImage, formatFileSize } from '@/lib/optimize';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function UploadBookPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const [form, setForm] = useState({
    title: '',
    description: '',
    author: '',
    category: 'general',
    subCategory: '',
    subject: '',
    year: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bibliotheque-backend-wfkn.onrender.com/api';

  useEffect(() => {
    if (loading) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setTimeElapsed(elapsed);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const onFileDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Le fichier ne doit pas dépasser 50 MB');
        return;
      }
      setFile(file);
      toast.success(`Fichier ajouté: ${file.name}`);
    }
  }, []);

  const onCoverDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La couverture ne doit pas dépasser 5 MB');
        return;
      }
      
      setIsOptimizing(true);
      const toastId = toast.loading('Optimisation de l\'image...');
      
      try {
        const optimizedImage = await optimizeImage(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1200,
        });
        
        setCover(optimizedImage);
        const reader = new FileReader();
        reader.onloadend = () => {
          setCoverPreview(reader.result as string);
        };
        reader.readAsDataURL(optimizedImage);
        
        const savedSize = ((file.size - optimizedImage.size) / file.size * 100);
        if (savedSize > 10) {
          toast.success(`Image optimisée (${formatFileSize(optimizedImage.size)})`, { id: toastId });
        } else {
          toast.success(`Couverture ajoutée: ${optimizedImage.name}`, { id: toastId });
        }
      } catch (error) {
        console.warn('Erreur optimisation image:', error);
        setCover(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setCoverPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        toast.success(`Couverture ajoutée: ${file.name}`, { id: toastId });
      } finally {
        setIsOptimizing(false);
      }
    }
  }, []);

  const { getRootProps: getFileRootProps, getInputProps: getFileInputProps, isDragActive: isFileDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    maxFiles: 1,
    onDrop: onFileDrop,
    onDropRejected: (rejections) => {
      const error = rejections[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        toast.error('Le fichier ne doit pas dépasser 50 MB');
      } else if (error?.code === 'file-invalid-type') {
        toast.error('Format non supporté. Utilisez PDF, DOCX ou PPT');
      }
    },
  });

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isDragActive: isCoverDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    onDrop: onCoverDrop,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRemoveCover = () => {
    setCover(null);
    setCoverPreview(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
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

    setLoading(true);
    setUploadProgress(0);
    setShowSuccess(false);
    setTimeElapsed(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (cover) formData.append('cover', cover);
      formData.append('title', form.title);
      formData.append('description', form.description || '');
      formData.append('author', form.author || 'Anonyme');
      formData.append('category', form.category);
      formData.append('subCategory', form.subCategory || '');
      formData.append('subject', form.subject || '');
      formData.append('year', form.year || '');

      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Vous devez être connecté');
        setLoading(false);
        return;
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/books`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      const response = await new Promise<Response>((resolve, reject) => {
        xhr.onload = () => {
          const response = new Response(xhr.response, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: new Headers({
              'Content-Type': xhr.getResponseHeader('Content-Type') || 'application/json',
            }),
          });
          resolve(response);
        };
        xhr.onerror = () => reject(new Error('Erreur de réseau'));
        xhr.send(formData);
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Réponse non-JSON:', text);
        throw new Error('Le serveur a renvoyé une réponse invalide');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du partage');
      }

      setUploadProgress(100);
      setShowSuccess(true);
      toast.success('Document partagé avec succès !');
      
      setTimeout(() => {
        setFile(null);
        setCover(null);
        setCoverPreview(null);
        setForm({
          title: '',
          description: '',
          author: '',
          category: 'general',
          subCategory: '',
          subject: '',
          year: '',
        });
        setLoading(false);
        setUploadProgress(0);
        setShowSuccess(false);
        router.push('/books');
      }, 3000);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors du partage');
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <Icons.User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Connexion requise</h2>
          <p className="text-gray-500 mb-6">Vous devez être connecté pour partager un document</p>
          <Link href="/login" className="btn-primary">
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
        <Link href="/books" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm transition-colors">
          <Icons.ArrowLeft className="w-4 h-4" />
          Retour à la bibliothèque
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100/50">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Icons.Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Partager un document</h1>
              <p className="text-white/80 text-sm">Ajoutez un nouveau document à la bibliothèque</p>
            </div>
          </div>
        </div>

        {!showSuccess ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {isOptimizing && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <svg className="animate-spin w-5 h-5 text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm text-blue-700">Optimisation de l'image en cours...</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - uploadProgress / 100)}`} className="transition-all duration-300" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-indigo-600">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Téléchargement en cours...</p>
                      <p className="text-xs text-gray-400">
                        <Icons.Clock className="w-3 h-3 inline mr-1" />
                        {formatTime(timeElapsed)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{file?.name}</p>
                    <p className="text-xs text-gray-400">
                      {(file?.size || 0) / 1024 / 1024 > 1 
                        ? `${((file?.size || 0) / 1024 / 1024).toFixed(2)} MB` 
                        : `${((file?.size || 0) / 1024).toFixed(0)} KB`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                  disabled={loading || isOptimizing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
                <input
                  type="text"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  placeholder="Nom de l'auteur (optionnel)"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  disabled={loading || isOptimizing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Décrivez brièvement le contenu du document..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-vertical transition-all"
                  disabled={loading || isOptimizing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all"
                    disabled={loading || isOptimizing}
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all"
                    disabled={loading || isOptimizing}
                  >
                    <option value="">Aucune</option>
                    <option value="bef">BEF</option>
                    <option value="bac">BAC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Ex: Mathématiques"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    disabled={loading || isOptimizing}
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    disabled={loading || isOptimizing}
                  />
                </div>
              </div>

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
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                        <Icons.Upload className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-800">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                        className="ml-4 p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
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
                    <div className="relative inline-block">
                      <img src={coverPreview} alt="Aperçu" className="max-h-32 mx-auto rounded-lg object-contain" />
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
            </div>

            <button
              type="submit"
              disabled={loading || !file || isOptimizing}
              className="w-full btn-primary text-base py-4 justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
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
        ) : (
          <div className="p-12 text-center animate-fade-in">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Merci pour votre contribution !</h2>
            <p className="text-gray-500 mb-1">Votre document a été partagé avec succès.</p>
            <p className="text-sm text-gray-400">Vous contribuez à enrichir la bibliothèque de Massaguet.</p>
            <p className="text-xs text-gray-400 mt-4">Redirection vers la bibliothèque dans quelques secondes...</p>
          </div>
        )}
      </div>
    </div>
  );
}

