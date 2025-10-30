import React, { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Page, User } from '../types';

type SettingsTab = 'profile' | 'plan' | 'api';

const SettingsPage: React.FC = () => {
    const context = useContext(AppContext);
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    
    // State for profile updates
    const [username, setUsername] = useState(context?.user?.username || '');
    const [email, setEmail] = useState(context?.user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    if (!context || !context.user) {
        return (
             <div className="flex items-center justify-center min-h-screen">
                <p>You must be logged in to view this page.</p>
            </div>
        )
    }

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!context.user) return;

        const updates: Partial<Pick<User, 'username' | 'email' | 'password'>> = {};
        if (username !== context.user.username) updates.username = username;
        if (email !== context.user.email) updates.email = email;
        if (password) {
            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }
            updates.password = password;
        }
        context.updateUser(context.user.id, updates);
    }
    
    const { user, upgradePlan } = context;

    return (
        <div className="min-h-screen bg-grid">
            <header className="flex justify-between items-center p-4 bg-black/30 backdrop-blur-lg border-b border-[var(--border-color)] sticky top-0 z-10">
                <h1 className="text-2xl font-bold seasonal-header">Settings</h1>
                <button onClick={() => context.navigate(Page.DASHBOARD)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 rounded-md hover:bg-white/10 transition">
                    &larr; Back to Dashboard
                </button>
            </header>
             <main className="p-4 sm:p-8 max-w-4xl mx-auto">
                 <div className="border-b border-gray-700 mb-6">
                    <div className="overflow-x-auto">
                        <nav className="flex space-x-2 sm:space-x-4" aria-label="Tabs">
                            <button onClick={() => setActiveTab('profile')} className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-200'}`}>Profile</button>
                            <button onClick={() => setActiveTab('plan')} className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === 'plan' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-200'}`}>Plan & Billing</button>
                            <button onClick={() => setActiveTab('api')} className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === 'api' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-200'}`}>API Keys</button>
                        </nav>
                    </div>
                </div>

                {activeTab === 'profile' && (
                    <div className="glass-card p-6 rounded-lg animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">Account Information</h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-white/5 p-2 rounded-md focus:ring-2 focus:ring-primary outline-none border border-transparent focus:border-primary transition" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 p-2 rounded-md focus:ring-2 focus:ring-primary outline-none border border-transparent focus:border-primary transition" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current password" className="w-full bg-white/5 p-2 rounded-md focus:ring-2 focus:ring-primary outline-none border border-transparent focus:border-primary transition" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-white/5 p-2 rounded-md focus:ring-2 focus:ring-primary outline-none border border-transparent focus:border-primary transition" />
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="px-5 py-2 bg-primary rounded-lg font-semibold hover:bg-primary-hover transition">Save Changes</button>
                            </div>
                        </form>
                    </div>
                )}
                {activeTab === 'plan' && (
                    <div className="glass-card p-6 rounded-lg animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">Your Plan</h2>
                        <div className="bg-white/5 p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="text-lg font-semibold">You are currently on the <span className="text-primary">{user.plan}</span> plan.</p>
                                <p className="text-sm text-gray-400">
                                    {user.plan === 'Free' && 'Upgrade to unlock more features!'}
                                    {user.plan === 'Hobby' && 'You have access to most features.'}
                                    {user.plan === 'Pro' && 'You have access to all premium features.'}
                                    {user.plan === 'Enterprise' && 'You have access to all features and dedicated support.'}
                                </p>
                            </div>
                            {user.plan !== 'Pro' && user.plan !== 'Enterprise' && (
                                <button onClick={() => upgradePlan('Pro')} className="w-full sm:w-auto px-5 py-2 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition flex-shrink-0">Upgrade Plan</button>
                            )}
                        </div>
                    </div>
                )}
                 {activeTab === 'api' && (
                    <div className="glass-card p-6 rounded-lg animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">Your API Key</h2>
                        <div className="bg-white/5 p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                           <div className="flex-grow">
                             <p className="font-mono text-sm break-all">{user.apiKey || 'No API key generated.'}</p>
                           </div>
                           <div className="flex-shrink-0 flex gap-2 w-full sm:w-auto">
                             <button onClick={() => context.generateUserApiKey(user.id)} className="flex-1 sm:flex-none px-4 py-2 text-sm bg-primary hover:bg-primary-hover rounded transition">{user.apiKey ? 'Regenerate' : 'Generate'}</button>
                             {user.apiKey && <button onClick={() => context.revokeUserApiKey(user.id)} className="flex-1 sm:flex-none px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded transition">Revoke</button>}
                           </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Use this key to integrate with external services. Keep it secret!</p>
                    </div>
                )}

             </main>
        </div>
    )
}

export default SettingsPage;
