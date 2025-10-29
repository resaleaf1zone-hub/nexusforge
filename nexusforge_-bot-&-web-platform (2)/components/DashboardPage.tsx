import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Page, ProjectType, Plan } from '../types';
import type { BotConfig, Project, WebsiteConfig } from '../types';
import SupportWidget from './SupportWidget';
import TutorialModal from './TutorialModal';
import HireProModal from './HireProModal';
import ProjectSettingsModal from './ProjectSettingsModal';

const Header: React.FC = () => {
    const context = useContext(AppContext);
    const [isHireModalOpen, setIsHireModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <header className="flex justify-between items-center p-4 border-b border-gray-800">
                <h1 className="text-2xl font-bold seasonal-header">Nexus<span className="text-primary">Forge</span></h1>
                
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-4">
                    <span className="text-gray-400">Welcome, {context?.user?.username} ({context?.user?.plan} Plan)</span>
                    <button
                        onClick={() => setIsHireModalOpen(true)}
                        className="hidden sm:inline-block px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-transform transform hover:scale-105"
                    >
                        Hire a Pro
                    </button>
                    <button 
                        onClick={() => context?.navigate(Page.SETTINGS)}
                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-md hover:bg-gray-700 transition"
                    >
                        Settings
                    </button>
                    {(context?.user?.role === 'admin' || context?.user?.role === 'owner') && (
                    <button 
                        onClick={() => context.navigate(Page.ADMIN_PANEL)}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition"
                    >
                        Admin Panel
                    </button>
                    )}
                    <button
                        onClick={context?.logout}
                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-md hover:bg-gray-700 transition"
                    >
                        Logout
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 ring-primary">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Mobile Dropdown Menu */}
            {isMenuOpen && (
                 <div className="md:hidden bg-gray-800 border-b border-gray-700 animate-slide-in-top">
                    <div className="p-4 space-y-3">
                         <span className="block text-gray-400 text-center text-sm">Welcome, {context?.user?.username} ({context?.user?.plan} Plan)</span>
                         <button
                            onClick={() => {setIsHireModalOpen(true); setIsMenuOpen(false);}}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition"
                        >
                            Hire a Pro
                        </button>
                        <button 
                            onClick={() => {context?.navigate(Page.SETTINGS); setIsMenuOpen(false);}}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition"
                        >
                            Settings
                        </button>
                        {(context?.user?.role === 'admin' || context?.user?.role === 'owner') && (
                        <button 
                            onClick={() => {context.navigate(Page.ADMIN_PANEL); setIsMenuOpen(false);}}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition"
                        >
                            Admin Panel
                        </button>
                        )}
                        <button
                            onClick={() => {context?.logout(); setIsMenuOpen(false);}}
                            className="w-full text-left px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
            {isHireModalOpen && <HireProModal onClose={() => setIsHireModalOpen(false)} />}
        </>
    );
};

const CreateProjectModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const context = useContext(AppContext);
    const [name, setName] = useState('');
    const [type, setType] = useState<ProjectType>('bot');

    const handleSubmit = () => {
        if (!name.trim() || !context?.user) return;

        const { user, projects, upgradePlan } = context;

        const planLimits: Record<Plan, number> = {
            Free: 2,
            Hobby: 5,
            Pro: 15,
            Enterprise: Infinity,
        };

        const currentPlanLimit = planLimits[user.plan] || 0;

        if (projects.length >= currentPlanLimit) {
            alert(`You have reached your project limit of ${currentPlanLimit} for the ${user.plan} plan. Please upgrade to create more projects.`);
            if (user.plan !== 'Pro' && user.plan !== 'Enterprise') {
                const nextPlan: Plan = user.plan === 'Free' ? 'Hobby' : 'Pro';
                if (window.confirm(`Would you like to upgrade to the ${nextPlan} plan now?`)) {
                    upgradePlan(nextPlan);
                }
            }
            onClose();
            return;
        }
        
        if (type === 'bot') {
            const newProject: Omit<Project, 'id' | 'createdAt' | 'hostingStatus' | 'liveUrl' | 'ownerId' | 'ownerUsername'> = {
                name,
                type,
                config: {
                    token: '',
                    clientId: '',
                    avatarUrl: '',
                    bannerUrl: '',
                    scraperEndpoint: 'https://api.bbdbuy.com/scrape',
                    status: { enabled: false, activityType: 'playing', text: '' },
                    features: {
                        welcomeMessage: { 
                            enabled: true, 
                            channel: '#general', 
                            message: 'Welcome {user} to the server!',
                            sendCard: false,
                            cardConfig: { backgroundColor: '#2c2f33', textColor: '#ffffff', title: 'Welcome!' },
                            leaveMessage: { enabled: false, channel: '#general', message: '{user} has left the server.'},
                            joinRoles: []
                        },
                        moderation: { 
                            enabled: true, 
                            adminRole: 'Moderator',
                            autoModeration: { enabled: false, bannedWords: [], antiSpam: false, antiLink: false }
                        },
                        ticketSystem: { 
                            enabled: true, 
                            transcripts: true, 
                            transcriptChannel: 'transcripts',
                            panels: [] 
                        },
                        imageScraper: false,
                        logging: { enabled: true, channel: 'bot-logs' },
                        leveling: { enabled: false, levelUpMessage: 'Congrats {user}, you reached level {level}!', roleRewards: [], voiceXpRate: 10, cardConfig: { backgroundColor: '#23272A', textColor: '#FFFFFF', barColor: '#7289DA' } },
                        reactionRoles: { enabled: false, configs: [] },
                        music: { enabled: false, djRole: 'DJ' },
                        socialFeeds: [],
                        birthdays: { enabled: false, channel: '#birthdays', wishMessage: 'Happy Birthday {user}!' },
                        polls: { enabled: false },
                        suggestions: { enabled: false, channel: '#suggestions', upvoteEmoji: '👍', downvoteEmoji: '👎' },
                        starboard: { enabled: false, channel: '#starboard', starEmoji: '⭐', starCount: 5 },
                        counting: { enabled: false, channel: '' },
                        chatGPT: { enabled: false, openAIApiKey: '' },
                        imageGeneration: { enabled: false },
                        modmail: { enabled: false, category: 'ModMail', modRole: 'Moderator' },
                        verification: { enabled: false, channel: '#verify', verifiedRole: 'Member' },
                        autoReact: { enabled: false, configs: [] },
                        globalChat: { enabled: false, channel: '#global' },
                        robloxVerification: { enabled: false },
                        tempVoiceChannels: { enabled: false, category: 'Voice Channels' },
                        mediaChannels: { enabled: false, channels: [] },
                        inviteTracker: { enabled: false },
                        stickyRoles: { enabled: false },
                        statisticChannels: { enabled: false },
                        qotd: { enabled: false, channel: '#qotd', role: 'QOTD Master' },
                        translation: { enabled: false },
                        emojiManager: { enabled: false },
                        stickyMessages: { enabled: false, configs: [] },
                        webhooks: { enabled: false, hooks: [] },
                        ifttt: { enabled: false, key: '' }
                    },
                    customCommands: [],
                    customEvents: [],
                    embeds: []
                } as BotConfig,
            };
            context.addProject(newProject);
        } else if (type === 'website') {
            context.setNewProjectName(name.trim());
            context.navigate(Page.MARKETPLACE);
        }

        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md sm:animate-slide-in-top animate-slide-in-bottom" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Project Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-primary outline-none transition" />
                    <div className="flex gap-4">
                       <button onClick={() => setType('bot')} className={`w-full p-3 rounded-md transition transform hover:scale-105 ${type === 'bot' ? 'bg-primary' : 'bg-gray-700 hover:bg-gray-600'}`}>Discord Bot</button>
                       <button onClick={() => setType('website')} className={`w-full p-3 rounded-md transition transform hover:scale-105 ${type === 'website' ? 'bg-primary' : 'bg-gray-700 hover:bg-gray-600'}`}>Website</button>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition">Cancel</button>
                        <button onClick={handleSubmit} className="px-4 py-2 bg-primary rounded-md hover:bg-primary-hover transition">Create</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const HostingStatusIndicator: React.FC<{ status: Project['hostingStatus'] }> = ({ status }) => {
    const statusMap: Record<Project['hostingStatus'], { text: string; dotClass: string; textClass: string }> = {
        undeployed: { text: 'Undeployed', dotClass: 'bg-gray-500', textClass: 'text-gray-400' },
        offline: { text: 'Offline', dotClass: 'bg-gray-500', textClass: 'text-gray-400' },
        deploying: { text: 'Deploying', dotClass: 'bg-yellow-500 animate-pulse', textClass: 'text-yellow-400' },
        online: { text: 'Online', dotClass: 'bg-green-500', textClass: 'text-green-400' },
    };
    const { text, dotClass, textClass } = statusMap[status] || statusMap.undeployed;

    return (
        <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${dotClass}`}></div>
            <span className={`text-xs font-semibold ${textClass}`}>{text}</span>
        </div>
    );
};


const DashboardPage: React.FC = () => {
    const context = useContext(AppContext);
    const [isModalOpen, setModalOpen] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedProjectForSettings, setSelectedProjectForSettings] = useState<Project | null>(null);

    useEffect(() => {
      // Show tutorial only if the user is logged in and has no projects.
      if (context?.user && context.projects.length === 0) {
          setShowTutorial(true);
      }
    }, [context?.user, context?.projects]);

    if (!context || !context.user) {
        return null; // Should be redirected to login by App.tsx
    }
    
    const { user, projects } = context;

    const planLimits: Record<Plan, number> = {
        Free: 2,
        Hobby: 5,
        Pro: 15,
        Enterprise: Infinity,
    };

    const openSettingsModal = (project: Project) => {
        setSelectedProjectForSettings(project);
        setIsSettingsModalOpen(true);
    };

    const currentPlanLimit = planLimits[user.plan] || 0;
    const canCreateProject = projects.length < currentPlanLimit;


    return (
        <div className="min-h-screen bg-gray-900 snow-bg">
            <Header />
            <main className="p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold">Your Projects</h2>
                    </div>
                    <div className="w-full sm:w-auto flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-4">
                         <p className="text-sm text-gray-400 text-center sm:text-right whitespace-nowrap">
                            Projects: {projects.length} / {currentPlanLimit === Infinity ? 'Unlimited' : currentPlanLimit}
                        </p>
                        <button 
                            onClick={() => canCreateProject && setModalOpen(true)} 
                            disabled={!canCreateProject}
                            title={!canCreateProject ? `Project limit reached for ${user.plan} plan. Upgrade to create more.` : "Create a new project"}
                            className="px-6 py-3 bg-primary rounded-lg font-semibold hover:bg-primary-hover transition-transform transform hover:scale-105 shadow-lg shadow-primary disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                        >
                            + New Project
                        </button>
                    </div>
                </div>

                {context?.projects.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-lg">
                        <p className="text-gray-400">No projects yet. Click 'New Project' to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {context?.projects.map((project, index) => (
                            <div 
                                key={project.id} 
                                className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-primary hover:shadow-2xl hover:shadow-primary transition-all flex flex-col justify-between stagger-fade-in group"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold mb-2 truncate pr-2">{project.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${project.type === 'bot' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-green-500/20 text-green-300'}`}>
                                                {project.type}
                                            </span>
                                             <button 
                                                onClick={() => openSettingsModal(project)} 
                                                className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                                                aria-label={`Settings for ${project.name}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4">Created: {project.createdAt.toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <HostingStatusIndicator status={project.hostingStatus} />
                                    {project.liveUrl && (
                                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm mt-2 block truncate hover:underline">
                                            {project.liveUrl}
                                        </a>
                                    )}
                                     <button onClick={() => context.viewProject(project.id)} className="w-full mt-4 py-2 bg-gray-700 group-hover:bg-primary rounded-md text-sm font-semibold transition-all duration-300 transform group-hover:scale-105">
                                        Open Builder
                                     </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            {isModalOpen && <CreateProjectModal onClose={() => setModalOpen(false)} />}
            {isSettingsModalOpen && selectedProjectForSettings && (
                <ProjectSettingsModal 
                    project={selectedProjectForSettings}
                    onClose={() => setIsSettingsModalOpen(false)} 
                />
            )}
            {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
            {context?.featureFlags.supportSystem && <SupportWidget />}
        </div>
    );
};

export default DashboardPage;