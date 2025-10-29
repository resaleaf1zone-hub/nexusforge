import React, { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

const SupportModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const context = useContext(AppContext);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (subject.trim() && message.trim()) {
            context?.createSupportTicket({ subject, message });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg border border-primary/20 sm:animate-slide-in-top animate-slide-in-bottom" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">Contact Support</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} required className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                    <textarea placeholder="Describe your issue..." value={message} onChange={e => setMessage(e.target.value)} required rows={5} className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary rounded-md hover:bg-primary-hover transition">Submit Ticket</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const SupportWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-hover transition-transform transform hover:scale-110 z-40"
                aria-label="Open support chat"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
            {isOpen && <SupportModal onClose={() => setIsOpen(false)} />}
        </>
    );
};

export default SupportWidget;