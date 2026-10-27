import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Link,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ChangePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_AVATARS = [
  {
    id: 'ian-pm',
    title: 'Ian Tumulak',
    role: 'Civil Project Manager',
    url: '/src/assets/images/avatar_ian_tumulak_1792219353962.jpg',
  },
  {
    id: 'sarah-exec',
    title: 'Sarah Vance',
    role: 'Executive Director',
    url: '/src/assets/images/avatar_female_exec_1792222022444.jpg',
  },
  {
    id: 'kenji-site',
    title: 'Kenji Tanaka',
    role: 'Site Project Engineer',
    url: '/src/assets/images/avatar_site_engineer_1792222022767.jpg',
  },
  {
    id: 'marcus-finance',
    title: 'Marcus Hayes',
    role: 'Financial Controller',
    url: '/src/assets/images/avatar_finance_exec_1792222042739.jpg',
  },
];

export const ChangePhotoModal: React.FC<ChangePhotoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, updateAvatar } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<string>(
    currentUser?.avatarUrl || PRESET_AVATARS[0].url
  );
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Process uploaded file and compress if needed to ensure quick storage
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, or WEBP)');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to a maximum of 400x400 for optimal avatar profile performance
        const canvas = document.createElement('canvas');
        const maxSize = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setSelectedPhoto(compressedDataUrl);
        } else {
          setSelectedPhoto(event.target?.result as string);
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
        alert('Could not process this image. Please try another file.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    setUrlError('');
    if (!urlInput.trim()) {
      setUrlError('Please enter an image URL');
      return;
    }
    try {
      new URL(urlInput.trim());
      setSelectedPhoto(urlInput.trim());
      setUrlInput('');
    } catch {
      setUrlError('Please enter a valid URL (e.g. https://...)');
    }
  };

  const handleSave = () => {
    updateAvatar(selectedPhoto);
    setSuccessToast(true);
    if (onSuccess) onSuccess();
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 700);
  };

  const handleResetDefault = () => {
    setSelectedPhoto(PRESET_AVATARS[0].url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Personalize Profile Photo</h3>
              <p className="text-xs text-slate-500">
                Change your avatar picture displayed across reports & header
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Avatar Preview Spotlight */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="relative group shrink-0">
              <img
                src={selectedPhoto}
                alt="Selected Avatar Preview"
                className="w-24 h-24 rounded-full object-cover border-3 border-white shadow-md ring-2 ring-blue-500/20"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change Photo"
                className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active User
                </span>
                <span className="text-[11px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                  {currentUser?.role || 'Project Manager'}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                {currentUser?.displayName || 'Ian Tumulak'}
              </h4>
              <p className="text-xs text-slate-500 font-mono">{currentUser?.email}</p>
              <p className="text-[11px] text-slate-400">
                Preview reflects your updated corporate headshot
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'presets'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Preset Avatars</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'url'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>Web Link</span>
            </button>
          </div>

          {/* Tab 1: Upload from local */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {isProcessing ? 'Processing image...' : 'Click to browse or drop an image'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports PNG, JPG, or WEBP up to 5MB (auto-cropped & optimized)
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Preset Avatars */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">
                Choose from verified professional corporate and engineering portraits:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {PRESET_AVATARS.map((avatar) => {
                  const isSelected = selectedPhoto === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedPhoto(avatar.url)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={avatar.url}
                        alt={avatar.title}
                        className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {avatar.title}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{avatar.role}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Image URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Direct Image Link (HTTPS)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setUrlError('');
                  }}
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Apply
                </button>
              </div>
              {urlError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{urlError}</span>
                </div>
              )}
              <p className="text-[11px] text-slate-400">
                Paste any direct link to your personal photo or company portrait avatar.
              </p>
            </div>
          )}

          {/* Quick reset option */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={handleResetDefault}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default Photo</span>
            </button>
            <span className="text-slate-400 text-[11px]">Personalized for current account</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {successToast && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                Updated!
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
