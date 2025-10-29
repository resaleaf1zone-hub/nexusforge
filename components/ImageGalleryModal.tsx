import React, { useState, useRef, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

const initialImages = [
  'https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1620282433428-b1416757c913?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580894908361-967195033215?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1605810230464-4284e3f1341c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1639694931333-4886f339f4a1?q=80&w=800&auto=format&fit=crop',
];

interface ImageGalleryModalProps {
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ onSelect, onClose }) => {
  const context = useContext(AppContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files[0]) {
          const file = event.target.files[0];
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
              if (loadEvent.target && typeof loadEvent.target.result === 'string') {
                  context?.addCustomImage(loadEvent.target.result);
              }
          };
          reader.readAsDataURL(file);
      }
  };
  
  const allImages = [...(context?.customImages || []), ...initialImages];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-4xl border border-blue-500/30 animate-slide-in-top flex flex-col max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Select an Image</h2>
            <div>
              <button onClick={handleUploadClick} className="px-4 py-2 text-sm bg-primary rounded-md hover:bg-primary-hover transition mr-4">
                  Upload Image
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
        </div>
        <div className="overflow-y-auto pr-2 -mr-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allImages.map((url, index) => (
                <div key={index} className="aspect-square bg-gray-700 rounded-md overflow-hidden group cursor-pointer" onClick={() => onSelect(url)}>
                <img 
                    src={url} 
                    alt={`Gallery Image ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                />
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGalleryModal;