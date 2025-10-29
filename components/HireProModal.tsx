import React, { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

const HireProModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const context = useContext(AppContext);
    const [name, setName] = useState(context?.user?.username || '');
    const [email, setEmail] = useState(context?.user?.email || '');
    const [details, setDetails] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && email.trim() && details.trim()) {
            context?.createSupportTicket({
                subject: `Hire a Pro Inquiry from: ${name}`,
                message: `Client Name: ${name}\nClient Email: ${email}\n\nProject Details:\n${details}`
            });
            setSubmitted(true);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg border border-primary/20 animate-slide-in-top" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2">Hire a Professional</h2>
                
                {submitted ? (
                    <div className="text-center py-8">
                        <div className="text-5xl mb-4">✅</div>
                        <p className="text-lg text-gray-200 mb-4">Your inquiry has been sent!</p>
                        <p className="text-gray-400">Our team will review your request and get back to you at {email} within 2 business days. Your request has been filed as a support ticket.</p>
                        <button onClick={onClose} className="mt-6 px-6 py-2 bg-primary rounded-md hover:bg-primary-hover transition">Close</button>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-400 mb-6">Don't have time or need a fully custom solution? Let our experts build the perfect website for you.</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                            <input type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                            <textarea placeholder="Tell us about your project..." value={details} onChange={e => setDetails(e.target.value)} required rows={5} className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary rounded-md hover:bg-primary-hover transition">Submit Inquiry</button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default HireProModal;