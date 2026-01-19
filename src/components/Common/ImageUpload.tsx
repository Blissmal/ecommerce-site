'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  id: string; // Crucial for multiple instances on one page
  value?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ 
  id,
  value = [], 
  onChange, 
  maxImages = 5 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  // Sync local state with props whenever value changes
  const [previewUrls, setPreviewUrls] = useState<string[]>(value);

  useEffect(() => {
    setPreviewUrls(value);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (previewUrls.length + files.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      const newUrls = [...previewUrls, ...uploadedUrls];
      onChange(newUrls); 
      toast.success(`${uploadedUrls.length} image(s) uploaded`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = async (index: number) => {
  const urlToRemove = previewUrls[index];
  
  // 1. Extract Public ID from Cloudinary URL
  // Example: .../upload/v1234/products/my_image.jpg -> products/my_image
  const getPublicIdFromUrl = (url: string) => {
    const parts = url.split('/');
    const fileNameWithExtension = parts[parts.length - 1];
    const fileName = fileNameWithExtension.split('.')[0];
    const folder = parts[parts.length - 2]; 
    return `${folder}/${fileName}`;
  };

  const publicId = getPublicIdFromUrl(urlToRemove);

  // 2. Optimistic UI update (remove from screen immediately)
  const newUrls = previewUrls.filter((_, i) => i !== index);
  onChange(newUrls);

  // 3. Call the Delete API
  try {
    const response = await fetch('/api/upload-image', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) throw new Error('Failed to delete from server');
    
    toast.success('Image permanently deleted');
  } catch (error) {
    console.error('Delete error:', error);
    toast.error('Removed from form, but failed to delete from cloud storage');
  }
};

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label
          htmlFor={id} // Unique ID
          className={`
            flex items-center justify-center px-6 py-3 
            border-2 border-dashed border-gray-300 rounded-lg
            cursor-pointer hover:border-blue transition-colors
            ${uploading || previewUrls.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              {uploading ? 'Uploading...' : 'Upload Images'}
            </span>
            <span className="text-xs text-gray-400">
              {previewUrls.length}/{maxImages}
            </span>
          </div>
        </label>

        <input
          id={id} // Unique ID
          type="file"
          accept="image/*"
          multiple={maxImages > 1}
          onChange={handleFileChange}
          disabled={uploading || previewUrls.length >= maxImages}
          className="hidden"
        />
      </div>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {previewUrls.map((url, index) => (
            <div key={url + index} className="relative group aspect-square">
              <Image
                src={url}
                alt="Product"
                fill
                className="object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}