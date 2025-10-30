import React, { useContext, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Page, Plan, UserRole } from '../types';

type AdminTab = 'dashboard' | 'users' | 'tickets' | 'projects' | 'bans' | 'api' | 'maintenance' | 'settings' | 'logs';

const StatCard: React.FC<{ title: string; value: string | number; icon: string }> = ({ title, value, icon }) => (
    <div className="glass-card p-4 rounded-lg flex items-center">
        <div className="p-3 rounded-full bg-primary/20 text-primary mr-4 text-2xl">{icon}</div>
        <div>
            <p className="text-2xl font-bold text-gray-100">{value}</p>
            <p className="text-sm text-gray-400">{title}</p>
        </div>
    </div>
);

const MaintenanceToggle: React.FC<{ featureName: string }> = ({ featureName }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { maintenanceFlags, toggleMaintenanceFlag } = context;
    const isEnabled = !maintenanceFlags[featureName];

    return (
        <div className="bg-white/5 p-4 rounded-md flex justify-between items-center">
            <div>
                <h3 className="font-bold text-gray-100">{featureName}</h3>
                <p className={`text-sm ${isEnabled ? 'text-green-400' : 'text-yellow-400'}`}>
                    {isEnabled ? 'Operational' : 'Under Maintenance'}
                </p>
            </div>
            <button
                onClick={() => toggleMaintenanceFlag(featureName)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition ${isEnabled ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
                {isEnabled ? 'Activate Maintenance' : 'Deactivate Maintenance'}
            </button>
        </div>
    );
};

const AdminPanelPage: React.FC = () => {
    const context = useContext(AppContext);
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [announcementText, setAnnouncementText] = useState(context?.announcement.message || '');

    if (!context || (context.user?.role !== 'admin' && context.user?.role !== 'owner')) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Access Denied. This area is for administrators only.</p>
            </div>
        );
    }
    
    const openTickets = context.supportTickets.filter(t => t.status === 'open');
    const plans: Plan[] = ['Free', 'Hobby', 'Pro', 'Enterprise'];
    const roles: UserRole[] = ['user', 'admin'];
    const isOwner = context.user.role === 'owner';

    const handleSetAnnouncement = () => {
        context.setAnnouncement(announcementText, true);
        alert('Announcement has been broadcast!');
    };
    const handleDeactivateAnnouncement = () => {
        setAnnouncementText('');
        context.setAnnouncement('', false);
        alert('Announcement deactivated.');
    }

    const handleDeleteProject = (projectId: string) => {
        if(window.confirm('Are you sure you want to permanently delete this project? This action cannot be undone.')) {
            context.deleteProject(projectId);
        }
    }

    const userPlanCounts = context.users.reduce((acc, user) => {
        acc[user.plan] = (acc[user.plan] || 0) + 1;
        return acc;
    }, {} as Record<Plan, number>);

    return (
        <div className="min-h-screen bg-grid">
            <header className="flex justify-between items-center p-4 bg-black/30 backdrop-blur-lg border-b border-[var(--border-color)] sticky top-0 z-10">
                <h1 className="text-2xl font-bold seasonal-header">Admin Panel</h1>
                <button onClick={() => context?.navigate(Page.DASHBOARD)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 rounded-md hover:bg-white/10 transition">
                    &larr; Back to Dashboard
                </button>
            </header>
            <main className="p-4 sm:p-8">
                <div className="border-b border-gray-700 mb-6">
                    <div className="overflow-x-auto">
                        <nav className="flex space-x-2 sm:space-x-4" aria-label="Tabs">
                            <button onClick={() => setActiveTab('dashboard')} className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-200'}`}>Dashboard</button>
                            <button onClick={() => setActiveTab('users')} className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-200'}`}>Users</button>
                            <button onClick={() => setActiveTab('projects')} className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === 'projects' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-200'}`}>Projects</button>
                            <button onClick={() => setActiveTab('tickets')} className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium relative transition-colors whitespace-nowrap ${activeTab === 'tickets' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-200'}`}>
                                Tickets
                                {openTickets.length > 0 && <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{openTickets.length}</span>}
                            </button>
                             <button onClick={() => setActiveTab('logs')} className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === 'logs' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-200'}`}>System Logs</button>
                            <button onClick={() => setActiveTab('bans')} className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === 'bans' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-200'}`}>IP Bans</button>
                            <button onClick={() => setActiveTab('api')} className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === 'api' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-200'}`}>API Keys</button>
                            <button onClick={() => setActiveTab('maintenance')} className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === 'maintenance' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-200'}`}>Maintenance</button>
                            <button onClick={() => setActiveTab('settings')} className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-200'}`}>Global Settings</button>
                        </nav>
                    </div>
                </div>

                {activeTab === 'dashboard' && (
                     <div className="animate-fade-in space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Total Users" value={context.users.length} icon="👥" />
                            <StatCard title="Total Projects" value={context.projects.length} icon="📂" />
                            <StatCard title="Open Tickets" value={openTickets.length} icon="🎫" />
                            <StatCard title="Banned IPs" value={context.bannedIPs.length} icon="🚫" />
                        </div>
                        <div className="glass-card p-6 rounded-lg">
                            <h2 className="text-xl font-bold mb-4">User Plan Distribution</h2>
                            <div className="bg-black/20 p-4 rounded-md">
                                <div className="flex justify-around">
                                    {plans.map(plan => (
                                        <div key={plan} className="text-center">
                                            <p className="text-3xl font-bold text-primary">{userPlanCounts[plan] || 0}</p>
                                            <p className="text-sm text-gray-400">{plan}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'users' && (
                    <div className="glass-card p-6 rounded-lg animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">Users</h2>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full min-w-max text-left">
                                <thead>
                                    <tr className="border-b border-gray-600">
                                        <th className="p-3">Username</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Plan</th><th className="p-3">IP Address</th><th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {context.users.map(u => (
                                        <tr key={u.id} className="border-b border-gray-700 hover:bg-white/5">
                                            <td className="p-3">{u.username}</td>
                                            <td className="p-3">{u.email}</td>
                                            <td className="p-3 capitalize">
                                                {isOwner && u.role !== 'owner' ? (
                                                    <select value={u.role} onChange={(e) => context.updateUserRole(u.id, e.target.value as UserRole)} className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-primary focus:border-primary">
                                                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                ) : (
                                                    <span className={`font-semibold ${u.role === 'owner' ? 'text-purple-400' : u.role === 'admin' ? 'text-blue-400' : ''}`}>{u.role}</span>
                                                )}
                                            </td>
                                            <td className="p-3 capitalize">
                                                <select value={u.plan} onChange={(e) => context.setUserPlan(u.id, e.target.value as Plan)} className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-primary focus:border-primary" disabled={u.role === 'owner'}>
                                                    {plans.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-3 font-mono">{u.ip}</td>
                                            <td className="p-3 space-x-2 text-right">
                                                <button onClick={() => context.banUserIP(u.ip)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded transition disabled:opacity-50" disabled={u.role === 'admin' || u.role === 'owner'}>Ban IP</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Mobile Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                            {context.users.map(u => (
                                <div key={u.id} className="bg-white/5 p-4 rounded-lg space-y-3">
                                    <div>
                                        <p className="font-bold text-lg">{u.username}</p>
                                        <p className="text-sm text-gray-400">{u.email}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                         <span className="font-mono">{u.ip}</span>
                                         <span className={`font-semibold capitalize ${u.role === 'owner' ? 'text-purple-400' : u.role === 'admin' ? 'text-blue-400' : ''}`}>{u.role}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-600">
                                         <select value={u.plan} onChange={(e) => context.setUserPlan(u.id, e.target.value as Plan)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-primary focus:border-primary" disabled={u.role === 'owner'}>
                                            {plans.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        <button onClick={() => context.banUserIP(u.ip)} className="w-full px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded transition disabled:opacity-50" disabled={u.role === 'admin' || u.role === 'owner'}>Ban IP</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'projects' && (
                     <div className="glass-card p-6 rounded-lg animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">All Projects</h2>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full min-w-max text-left">
                                <thead>
                                    <tr className="border-b border-gray-600">
                                        <th className="p-3">Project Name</th><th className="p-3">Owner</th><th className="p-3">Type</th><th className="p-3">Status</th><th className="p-3">Created At</th><th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {context.projects.map(p => (
                                        <tr key={p.id} className="border-b border-gray-700 hover:bg-white/5">
                                            <td className="p-3">{p.name}</td>
                                            <td className="p-3">{p.ownerUsername}</td>
                                            <td className="p-3 capitalize">{p.type}</td>
                                            <td className="p-3 capitalize">{p.hostingStatus}</td>
                                            <td className="p-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                                            <td className="p-3 text-right">
                                                <button onClick={() => handleDeleteProject(p.id)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded transition">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Mobile Cards */}
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                            {context.projects.map(p => (
                                <div key={p.id} className="bg-white/5 p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between">
                                        <p className="font-bold text-lg">{p.name}</p>
                                         <button onClick={() => handleDeleteProject(p.id)} className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition">Delete</button>
                                    </div>
                                    <p className="text-sm text-gray-400">Owner: {p.ownerUsername}</p>
                                    <div className="flex justify-between text-sm pt-2 border-t border-gray-600">
                                        <span className="capitalize font-semibold">{p.type}</span>
                                        <span className="capitalize">{p.hostingStatus}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'tickets' && (
                     <div className="glass-card p-6 rounded-lg animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">Open Support Tickets</h2>
                        <div className="space-y-4">
                            {openTickets.length > 0 ? openTickets.map(t => (
                                <div key={t.id} className="bg-white/5 p-4 rounded-md">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">{t.subject} <span className="font-normal text-gray-400">- from {t.username} on {new Date(t.createdAt).toLocaleDateString()}</span></p>
                                            <p className="text-gray-300 mt-2 whitespace-pre-wrap">{t.message}</p>
                                        </div>
                                        <button onClick={() => context.resolveSupportTicket(t.id)} className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded transition flex-shrink-0">Resolve</button>
                                    </div>
                                </div>
                            )) : <p className="text-gray-400">No open tickets. All clear!</p>}
                        </div>
                    </div>
                )}
                {activeTab === 'logs' && (
                    <div className="glass-card p-6 rounded-lg animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">System Event Logs</h2>
                        <div className="bg-black/50 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm">
                            {context.logs.map(log => {
                                const levelColor = { info: 'text-blue-400', warn: 'text-yellow-400', error: 'text-red-400'}[log.level];
                                return (
                                    <p key={log.id} className="whitespace-pre-wrap">
                                        <span className="text-gray-500">{new Date(log.timestamp).toISOString()}</span>
                                        <span className={`font-bold mx-2 ${levelColor}`}>{log.level.toUpperCase()}</span>
                                        <span className="text-gray-300">{log.message}</span>
                                    </p>
                                )
                            })}
                        </div>
                    </div>
                )}
                {activeTab === 'bans' && (
                    <div className="glass-card p-6 rounded-lg animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">Banned IP Addresses</h2>
                        <ul className="space-y-2">
                            {context.bannedIPs.length > 0 ? context.bannedIPs.map(ip => (
                                <li key={ip} className="flex justify-between items-center bg-white/5 p-3 rounded-md">
                                    <span className="font-mono">{ip}</span>
                                    <button onClick={() => context.unbanUserIP(ip)} className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 rounded transition">Unban</button>
                                </li>
                            )) : <p className="text-gray-400">No IPs are currently banned.</p>}
                        </ul>
                    </div>
                )}
                 {activeTab === 'api' && (
                    <div className="glass-card p-6 rounded-lg animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">API Key Management</h2>
                         <div className="overflow-x-auto">
                            <table className="w-full min-w-max text-left">
                                <thead>
                                    <tr className="border-b border-gray-600">
                                        <th className="p-3">Username</th>
                                        <th className="p-3">API Key</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {context.users.map(u => (
                                        <tr key={u.id} className="border-b border-gray-700 hover:bg-white/5">
                                            <td className="p-3">{u.username} <span className="text-xs text-purple-400 ml-1">({u.role})</span></td>
                                            <td className="p-3 font-mono">
                                                {u.apiKey ? `${u.apiKey.substring(0, 10)}...` : <span className="text-gray-500">No key assigned</span>}
                                            </td>
                                            <td className="p-3 space-x-2 text-right">
                                                <button onClick={() => context.generateUserApiKey(u.id)} className="px-3 py-1 text-sm bg-primary hover:bg-primary-hover rounded transition disabled:opacity-50" disabled={u.role === 'owner'}>
                                                    {u.apiKey ? 'Regenerate' : 'Generate'}
                                                </button>
                                                <button onClick={() => context.revokeUserApiKey(u.id)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded transition disabled:opacity-50" disabled={u.role === 'owner' || !u.apiKey}>
                                                    Revoke
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'maintenance' && (
                    <div className="glass-card p-6 rounded-lg animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">Maintenance Mode</h2>
                        <div className="space-y-4">
                            <MaintenanceToggle featureName="Bot Builder" />
                            <MaintenanceToggle featureName="Website Builder" />
                            <MaintenanceToggle featureName="Embed Builder" />
                        </div>
                    </div>
                )}
                 {activeTab === 'settings' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="glass-card p-6 rounded-lg">
                            <h2 className="text-xl font-bold mb-4">Global Announcement</h2>
                             <textarea 
                                placeholder="Enter announcement text here... This will be shown as a popup to all users." 
                                value={announcementText} 
                                onChange={e => setAnnouncementText(e.target.value)} 
                                rows={3} 
                                className="w-full bg-white/5 p-2 rounded-md" 
                            />
                            <div className="flex gap-4 mt-2">
                                <button onClick={handleSetAnnouncement} className="px-4 py-2 text-sm bg-primary hover:bg-primary-hover rounded-md">Broadcast Announcement</button>
                                <button onClick={handleDeactivateAnnouncement} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md">Deactivate</button>
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-lg">
                            <h2 className="text-xl font-bold mb-4">Feature Flags</h2>
                            <div className="space-y-4">
                                <div className="bg-white/5 p-4 rounded-md flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-gray-100">Customer Support Widget</h3>
                                        <p className="text-sm text-gray-400">Toggles the support chat bubble across the entire platform.</p>
                                    </div>
                                    <label className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only" 
                                                checked={context.featureFlags.supportSystem} 
                                                onChange={() => context.toggleFeatureFlag('supportSystem')} 
                                                aria-label="Toggle Customer Support Widget"
                                            />
                                            <div className={`block w-14 h-8 rounded-full transition ${context.featureFlags.supportSystem ? 'bg-primary' : 'bg-gray-600'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${context.featureFlags.supportSystem ? 'transform translate-x-6' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                 )}
            </main>
        </div>
    );
}

export default AdminPanelPage;
