import React from 'react';

interface AnnouncementPopupProps {
  message: string;
  onClose: () => void;
}

const AnnouncementPopup: React.FC<AnnouncementPopupProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-lg border border-primary/30 animate-slide-in-top relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-white seasonal-header">
                A Message from the NexusForge Team
            </h2>
            <p className="text-gray-300 whitespace-pre-wrap">{message}</p>
        </div>
        <button 
          onClick={onClose} 
          className="w-full py-2 mt-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default AnnouncementPopup;
