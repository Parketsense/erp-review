'use client';

import React, { useState, useRef } from 'react';

interface MediaFile {
  url: string;
  name: string;
  type: string;
  size?: number;
}

interface MediaUploaderProps {
  productId?: string;
  mediaType: 'images' | 'documents' | 'models3d' | 'textures';
  files: MediaFile[];
  onFilesUpdate: (files: MediaFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  disabled?: boolean;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  productId,
  mediaType,
  files,
  onFilesUpdate,
  maxFiles = 10,
  maxFileSize = 50,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptedTypes = () => {
    switch (mediaType) {
      case 'images':
        return '.jpg,.jpeg,.png,.gif,.webp,.svg';
      case 'documents':
        return '.pdf,.doc,.docx,.txt,.rtf';
      case 'models3d':
        return '.obj,.fbx,.gltf,.glb,.3ds,.max,.blend';
      case 'textures':
        return '.jpg,.jpeg,.png,.tga,.bmp,.hdr,.exr';
      default:
        return '*';
    }
  };

  const getMediaTypeIcon = () => {
    switch (mediaType) {
      case 'images':
        return '🖼️';
      case 'documents':
        return '📄';
      case 'models3d':
        return '🧊';
      case 'textures':
        return '🎨';
      default:
        return '📁';
    }
  };

  const getMediaTypeLabel = () => {
    switch (mediaType) {
      case 'images':
        return 'Изображения';
      case 'documents':
        return 'Документи';
      case 'models3d':
        return '3D Модели';
      case 'textures':
        return 'Текстури';
      default:
        return 'Файлове';
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Файлът ${file.name} е твърде голям. Максимален размер: ${maxFileSize}MB`;
    }

    // Check file type
    const allowedTypes = getAcceptedTypes().split(',');
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExt) && !allowedTypes.includes('*')) {
      return `Файлът ${file.name} не е от поддържан тип`;
    }

    return null;
  };

  const handleFileSelect = async (selectedFiles: FileList) => {
    if (disabled || uploading) return;

    const newFiles = Array.from(selectedFiles);
    
    // Validate files
    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }
    }

    // Check total file count
    if (files.length + newFiles.length > maxFiles) {
      alert(`Максимален брой файлове: ${maxFiles}`);
      return;
    }

    // If productId is provided, upload immediately
    if (productId) {
      await uploadFiles(newFiles);
    } else {
      // For new products, just add to local state
      const mediaFiles: MediaFile[] = newFiles.map(file => ({
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        size: file.size
      }));
      
      onFilesUpdate([...files, ...mediaFiles]);
    }
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    if (!productId) return;

    setUploading(true);
    
    try {
      const formData = new FormData();
      filesToUpload.forEach(file => {
        formData.append('files', file);
      });
      formData.append('mediaType', mediaType);

      const response = await fetch(`/api/products/${productId}/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Update files from server response
        const newFiles = result.data[mediaType] || [];
        const mediaFiles: MediaFile[] = newFiles.map((url: string) => ({
          url,
          name: url.split('/').pop() || '',
          type: getFileTypeFromUrl(url)
        }));
        
        onFilesUpdate(mediaFiles);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Грешка при качване на файловете');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (fileUrl: string) => {
    if (disabled) return;

    if (productId && fileUrl.startsWith('/uploads/')) {
      // Remove from server
      try {
        const filename = fileUrl.split('/').pop();
        const response = await fetch(`/api/products/${productId}/media/${mediaType}/${filename}`, {
          method: 'DELETE',
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Грешка при изтриване на файла');
        return;
      }
    }

    // Remove from local state
    const updatedFiles = files.filter(file => file.url !== fileUrl);
    onFilesUpdate(updatedFiles);
  };

  const getFileTypeFromUrl = (url: string): string => {
    const ext = url.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return 'image';
    } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
      return 'document';
    } else if (['obj', 'fbx', 'gltf', 'glb', '3ds', 'max', 'blend'].includes(ext)) {
      return 'model3d';
    } else if (['tga', 'bmp', 'hdr', 'exr'].includes(ext)) {
      return 'texture';
    }
    
    return 'unknown';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (disabled || uploading) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  const renderFilePreview = (file: MediaFile, index: number) => {
    const isImage = file.type.startsWith('image/') || getFileTypeFromUrl(file.url) === 'image';
    
    return (
      <div
        key={index}
        className="relative group bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
      >
        {/* Remove button */}
        <button
          onClick={() => removeFile(file.url)}
          disabled={disabled}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 disabled:opacity-50 z-10"
        >
          ×
        </button>

        {/* File preview */}
        <div className="flex flex-col items-center space-y-2">
          {isImage ? (
            <img
              src={file.url}
              alt={file.name}
              className="w-16 h-16 object-cover rounded-md border"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-2xl">
              {getMediaTypeIcon()}
            </div>
          )}
          
          <div className="text-center">
            <p className="text-xs font-medium text-gray-900 truncate max-w-[80px]" title={file.name}>
              {file.name}
            </p>
            {file.size && (
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
          <span>{getMediaTypeIcon()}</span>
          <span>{getMediaTypeLabel()}</span>
          <span className="text-gray-500">({files.length}/{maxFiles})</span>
        </h4>
      </div>

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={getAcceptedTypes()}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || uploading}
        />

        {uploading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Качване...</span>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-2">{getMediaTypeIcon()}</div>
            <p className="text-sm text-gray-600 mb-1">
              Натиснете или плъзнете файлове тук
            </p>
            <p className="text-xs text-gray-500">
              Поддържани формати: {getAcceptedTypes()}<br />
              Максимален размер: {maxFileSize}MB
            </p>
          </>
        )}
      </div>

      {/* Files Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {files.map((file, index) => renderFilePreview(file, index))}
        </div>
      )}

      {/* File count warning */}
      {files.length >= maxFiles && (
        <p className="text-xs text-amber-600 text-center">
          Достигнат е максималният брой файлове за този тип
        </p>
      )}
    </div>
  );
};

export default MediaUploader; 