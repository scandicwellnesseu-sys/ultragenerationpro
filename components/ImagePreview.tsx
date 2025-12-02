
import React from 'react';
import { ImageFile } from '../types';
import { XIcon } from './Icons';

interface ImagePreviewProps {
  imageFile: ImageFile;
  onClear: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageFile, onClear }) => {
  return (
    <div className="relative group">
      <img
        src={`data:${imageFile.mimeType};base64,${imageFile.base64}`}
        alt={imageFile.name}
        className="w-full h-auto max-h-60 object-contain rounded-md bg-gray-900"
      />
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
        <button
          onClick={onClear}
          className="flex items-center justify-center p-3 bg-red-600/80 hover:bg-red-500 rounded-full text-white transition-colors"
          aria-label="Remove image"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1 truncate" title={imageFile.name}>{imageFile.name}</p>
    </div>
  );
};

export default ImagePreview;
