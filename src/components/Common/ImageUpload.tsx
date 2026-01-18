// components/ImageUpload.tsx
"use client";

import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { useState } from 'react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
}

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div>
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} // Create this in Cloudinary dashboard
        onUpload={(result: any) => {
          if (result.event === 'success') {
            onChange(result.info.secure_url);
            setIsUploading(false);
          }
        }}
        onOpen={() => setIsUploading(true)}
        onClose={() => setIsUploading(false)}
      >
        {({ open }) => (
          <div className="space-y-4">
            {value ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                <Image
                  src={value}
                  alt="Upload"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={onRemove}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => open()}
                disabled={isUploading}
                className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
              >
                {isUploading ? (
                  <span>Uploading...</span>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                  </div>
                )}
              </button>
            )}
          </div>
        )}
      </CldUploadWidget>
    </div>
  );
}