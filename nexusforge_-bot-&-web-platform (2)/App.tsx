
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
// FIX: BotBuilderPage is a named export, not a default export.
import { BotBuilderPage } from './components/BotBuilderPage';
import WebsiteBuilderPage from './components/WebsiteBuilderPage';
import AdminPanelPage from './components/AdminPanelPage';
import SettingsPage from './components/SettingsPage';
import TemplateMarketplacePage from './components/TemplateMarketplacePage';
import AnnouncementPopup from './components/AnnouncementPopup';
import PaymentModal from './components/PaymentModal';
import { AppContext } from './contexts/AppContext';
import type { Project, User, SupportTicket, BotConfig, WebsiteConfig, Plan, UserRole, SystemLog } from './types';
import { Page } from './types';
import useSeasonalTheme from './hooks/useSeasonalTheme';

const MOCK_USERS: User[] = [
  { id: 'user_owner_afi', username: 'afi', email: 'afi@nexusforge.com', password: 'password', role: 'owner', plan: 'Enterprise', ip: '127.0.0.1', apiKey: null },
  { id: 'user_admin', username: 'admin', email: 'admin@nexusforge.com', password: 'password', role: 'admin', plan: 'Enterprise', ip: '127.0.0.1', apiKey: null },
  { id: 'user_free', username: 'testuser', email: 'test@user.com', password: 'password', role: 'user', plan: 'Free', ip: '192.168.1.10', apiKey: `nf_live_0a1b2c3d4e5f6a7b8c9d0e1f` },
  { id: 'user_pro', username: 'pro_user', email: 'pro@user.com', password: 'password', role: 'user', plan: 'Pro', ip: '192.168.1.12', apiKey: null },
];

const MOCK_LOGS: SystemLog[] = [
    { id: 'log_1', timestamp: new Date(Date.now() - 1000 * 60 * 5), level: 'info', message: 'System initialized successfully.' },
    { id: 'log_2', timestamp: new Date(Date.now() - 1000 * 60 * 3), level: 'info', message: 'User \'admin\' logged in from 127.0.0.1' },
    { id: 'log_3', timestamp: new Date(Date.now() - 1000 * 60 * 2), level: 'warn', message: 'High CPU usage detected on bot_host_02.' },
]

function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue, (k, v) => {
           if (k === 'createdAt' || k === 'timestamp') return new Date(v);
           return v;
        });
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}


const MaintenanceNotice: React.FC<{ featureName: string }> = ({ featureName }) => (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h1 className="text-4xl font-bold text-gray-100">Under Maintenance</h1>
        <p className="mt-2 text-gray-400 max-w-md">The {featureName} is currently undergoing scheduled maintenance to improve your experience. Please check back soon!</p>
    </div>
);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LOGIN);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = usePersistentState<User[]>('nexusforge_users', MOCK_USERS);
  const [projects, setProjects] = usePersistentState<Project[]>('nexusforge_projects', []);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [bannedIPs, setBannedIPs] = usePersistentState<string[]>('nexusforge_banned_ips', ['10.0.0.99']);
  const [supportTickets, setSupportTickets] = usePersistentState<SupportTicket[]>('nexusforge_tickets', []);
  const [logs, setLogs] = usePersistentState<SystemLog[]>('nexusforge_logs', MOCK_LOGS);
  const [planToUpgrade, setPlanToUpgrade] = useState<{ plan: Plan; cycle: 'monthly' | 'yearly' } | null>(null);
  const [newProjectName, setNewProjectName] = useState<string | null>(null);
  const [customImages, setCustomImages] = usePersistentState<string[]>('nexusforge_custom_images', []);

  const [featureFlags, setFeatureFlags] = usePersistentState<{ [key: string]: boolean }>('nexusforge_features', {
    supportSystem: true,
  });
  const [maintenanceFlags, setMaintenanceFlags] = usePersistentState<{ [key: string]: boolean }>('nexusforge_maintenance', {
    'Website Builder': false,
    'Bot Builder': false,
    'Embed Builder': false,
  });
  const [announcement, setAnnouncement] = usePersistentState<{ message: string, active: boolean }>('nexusforge_announcement', {
    message: '',
    active: false,
  });
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const seasonalTheme = useSeasonalTheme();

   useEffect(() => {
    try {
      const sessionUser = sessionStorage.getItem('nexusforge_session');
      if (sessionUser) {
        const loggedInUser: User = JSON.parse(sessionUser);
        const fullUser = users.find(u => u.id === loggedInUser.id);
        if (fullUser) {
           setUser(fullUser);
           setCurrentPage(Page.DASHBOARD);
        } else {
           sessionStorage.removeItem('nexusforge_session');
        }
      }
    } catch(e) {
        console.error("Failed to parse session user", e);
        sessionStorage.removeItem('nexusforge_session');
    }
  }, [users]);
  
  const addLog = (level: SystemLog['level'], message: string) => {
    const newLog: SystemLog = { id: `log_${Date.now()}`, timestamp: new Date(), level, message };
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep logs from growing indefinitely
  };

  useEffect(() => {
      if(announcement.active && localStorage.getItem('announcementSeen') !== announcement.message) {
          setShowAnnouncement(true);
      }
  }, [announcement]);

  const handleCloseAnnouncement = () => {
      setShowAnnouncement(false);
      localStorage.setItem('announcementSeen', announcement.message);
  }

  const login = useCallback((username: string, email: string, password: string, plan: Plan = 'Free') => {
    const userIP = `10.0.0.${Math.floor(Math.random() * 254) + 1}`;
    
    if (bannedIPs.includes(userIP)) {
      alert('Your IP address has been banned.');
      return;
    }

    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    let userToLogin: User;

    if (foundUser) {
        if (foundUser.password !== password) {
            alert('Incorrect password.');
            return;
        }
        userToLogin = { ...foundUser, ip: userIP, plan: plan !== 'Free' ? plan : foundUser.plan };
        setUsers(prevUsers => prevUsers.map(u => u.id === userToLogin.id ? userToLogin : u));
    } else {
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            alert('An account with this email already exists.');
            return;
        }
        userToLogin = { 
            id: `user_${Date.now()}`, 
            username, 
            email,
            password,
            role: username.toLowerCase().includes('afi') ? 'owner' : 'user', 
            plan: plan,
            ip: userIP,
            apiKey: null
        };
        setUsers(prev => [...prev, userToLogin]);
        addLog('info', `New user registered: ${username} (Plan: ${plan})`);
    }
    
    setUser(userToLogin);
    sessionStorage.setItem('nexusforge_session', JSON.stringify(userToLogin));
    addLog('info', `User '${userToLogin.username}' logged in from ${userToLogin.ip}.`);
    
    if (userToLogin.role === 'admin' || userToLogin.role === 'owner') {
        setCurrentPage(Page.ADMIN_PANEL);
    } else {
        setCurrentPage(Page.DASHBOARD);
    }
  }, [bannedIPs, users, setUsers]);

  const logout = useCallback(() => {
    if(user) addLog('info', `User '${user.username}' logged out.`);
    setUser(null);
    sessionStorage.removeItem('nexusforge_session');
    setCurrentPage(Page.LOGIN);
  }, [user]);

  const updateUser = useCallback((userId: string, updates: Partial<Pick<User, 'username' | 'email' | 'password'>>) => {
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, ...updates } : u));
      if (user?.id === userId) {
          const updatedUser = { ...user, ...updates };
          setUser(updatedUser);
          sessionStorage.setItem('nexusforge_session', JSON.stringify(updatedUser));
      }
      addLog('info', `User account ${userId} was updated.`);
      alert('Account updated successfully!');
  }, [user, setUsers]);

  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt' | 'hostingStatus' | 'liveUrl' | 'ownerId' | 'ownerUsername'>) => {
    if(!user) return;
    const newProject: Project = { 
        ...project, 
        id: `proj_${Date.now()}`, 
        createdAt: new Date(),
        hostingStatus: 'undeployed',
        liveUrl: null,
        ownerId: user.id,
        ownerUsername: user.username,
    };
    setProjects(prev => [...prev, newProject]);
    addLog('info', `Project '${project.name}' created by ${user.username}.`);
    setCurrentPage(Page.DASHBOARD);
  }, [user, setProjects]);

  const updateProjectName = useCallback((projectId: string, newName: string) => {
      addLog('info', `Project ${projectId} was renamed to '${newName}'.`);
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name: newName } : p));
      if (selectedProject?.id === projectId) {
          setSelectedProject(prev => prev ? { ...prev, name: newName } : null);
      }
  }, [selectedProject, setProjects, addLog]);

  const duplicateProject = useCallback((projectId: string) => {
    if (!user) return;
    const originalProject = projects.find(p => p.id === projectId);
    if (!originalProject) return;

    const planLimits: Record<Plan, number> = {
        Free: 2,
        Hobby: 5,
        Pro: 15,
        Enterprise: Infinity,
    };
    const currentPlanLimit = planLimits[user.plan] || 0;
    if (projects.length >= currentPlanLimit) {
        alert(`You have reached your project limit of ${currentPlanLimit} for the ${user.plan} plan.`);
        return;
    }

    const newProject: Project = {
        ...JSON.parse(JSON.stringify(originalProject)), // Deep copy config
        id: `proj_${Date.now()}`,
        name: `${originalProject.name} (Copy)`,
        createdAt: new Date(),
        hostingStatus: 'undeployed',
        liveUrl: null,
        botInviteUrl: undefined,
    };
    
    setProjects(prev => [...prev, newProject]);
    addLog('info', `Project '${originalProject.name}' was duplicated by ${user.username}.`);
  }, [user, projects, setProjects, addLog]);

  const deleteProject = useCallback((projectId: string) => {
      const projectToDelete = projects.find(p => p.id === projectId);
      if(projectToDelete) {
        addLog('warn', `Project '${projectToDelete.name}' (ID: ${projectId}) was deleted by an admin.`);
      }
      setProjects(prev => prev.filter(p => p.id !== projectId));
  }, [projects, setProjects]);
  
  const updateProjectConfig = useCallback((projectId: string, newConfig: BotConfig | WebsiteConfig) => {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, config: newConfig } : p));
      if (selectedProject?.id === projectId) {
          setSelectedProject(prev => prev ? { ...prev, config: newConfig } : null);
      }
  }, [selectedProject, setProjects]);

  const updateProjectHosting = useCallback((projectId: string, status: Project['hostingStatus'], url: string | null = null, botInviteUrl?: string) => {
      const project = projects.find(p => p.id === projectId);
      if(project) {
        addLog('info', `Project '${project.name}' status changed to ${status}.`);
        
        let finalBotInviteUrl = botInviteUrl;
        if (project.type === 'bot' && status === 'online') {
            const botConfig = project.config as BotConfig;
            if (botConfig.clientId) {
                finalBotInviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${botConfig.clientId}&permissions=8&scope=bot`;
            }
        }

        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, hostingStatus: status, liveUrl: url, botInviteUrl: finalBotInviteUrl } : p));
        if (selectedProject?.id === projectId) {
            setSelectedProject(prev => prev ? { ...prev, hostingStatus: status, liveUrl: url, botInviteUrl: finalBotInviteUrl } : null);
        }
      }
  }, [selectedProject, projects, setProjects, addLog]);
  
  const syncBotData = useCallback((projectId: string, data: { channels: string[], roles: string[] }) => {
    setProjects(prevProjects => prevProjects.map(p => {
        if (p.id === projectId && p.type === 'bot') {
            const newConfig = { ...p.config as BotConfig, syncedChannels: data.channels, syncedRoles: data.roles };
            return { ...p, config: newConfig };
        }
        return p;
    }));
    if (selectedProject?.id === projectId) {
        setSelectedProject(prev => {
            if (prev && prev.type === 'bot') {
                const newConfig = { ...prev.config as BotConfig, syncedChannels: data.channels, syncedRoles: data.roles };
                return { ...prev, config: newConfig };
            }
            return prev;
        });
    }
    addLog('info', `Synced channels and roles for project ${selectedProject?.name}.`);
  }, [setProjects, selectedProject]);

  const viewProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      if (project.type === 'bot') {
        setCurrentPage(Page.BOT_BUILDER);
      } else {
        setCurrentPage(Page.WEBSITE_BUILDER);
      }
    }
  }, [projects]);

  const navigate = useCallback((page: Page) => {
    if (page === Page.ADMIN_PANEL && user?.role !== 'admin' && user?.role !== 'owner') {
      return; // Silently block non-admins/owners
    }
    if (page === Page.DASHBOARD && !user) {
        setCurrentPage(Page.LOGIN);
    } else {
        setCurrentPage(page);
    }
  }, [user]);
  
  const setUserPlan = useCallback((userId: string, plan: Plan) => {
    const targetUser = users.find(u => u.id === userId);
    if(targetUser) addLog('info', `User '${targetUser.username}' plan changed to ${plan}.`);
    setUsers(prevUsers => prevUsers.map(u => 
      u.id === userId ? { ...u, plan } : u
    ));
    if(user?.id === userId) {
        const updatedUser = { ...user, plan };
        setUser(updatedUser);
        sessionStorage.setItem('nexusforge_session', JSON.stringify(updatedUser));
    }
  }, [user, users, setUsers]);

  const upgradePlan = useCallback((plan: Plan, cycle: 'monthly' | 'yearly' = 'monthly') => {
    if (plan === 'Free') return;
    setPlanToUpgrade({ plan, cycle });
  }, []);

  const completeUpgrade = useCallback((plan: Plan) => {
    if (user) {
        setUserPlan(user.id, plan);
        alert(`Upgrade to ${plan} successful!`);
    } else {
        // This handles upgrade from login page
        alert(`Your account will be created with the ${plan} plan!`);
        // The login function will handle the rest
    }
    setPlanToUpgrade(null);
  }, [user, setUserPlan]);


  const updateUserRole = useCallback((userId: string, role: UserRole) => {
      addLog('warn', `User role for ${userId} changed to ${role}.`);
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role } : u));
  }, [setUsers]);

  const banUserIP = useCallback((ip: string) => {
    if (!bannedIPs.includes(ip)) {
      addLog('error', `IP Address ${ip} has been banned.`);
      setBannedIPs(prev => [...prev, ip]);
    }
  }, [bannedIPs, setBannedIPs]);

  const unbanUserIP = useCallback((ip: string) => {
    addLog('warn', `IP Address ${ip} has been unbanned.`);
    setBannedIPs(prev => prev.filter(bannedIp => bannedIp !== ip));
  }, [setBannedIPs]);

  const createSupportTicket = useCallback((ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'userId' | 'username' | 'status'>) => {
    if (!user) return;
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `ticket_${Date.now()}`,
      userId: user.id,
      username: user.username,
      status: 'open',
      createdAt: new Date(),
    };
    setSupportTickets(prev => [newTicket, ...prev]);
    addLog('info', `New support ticket created by ${user.username}: "${ticketData.subject}"`);
    alert('Support ticket created successfully!');
  }, [user, setSupportTickets]);

  const resolveSupportTicket = useCallback((ticketId: string) => {
    addLog('info', `Support ticket ${ticketId} resolved.`);
    setSupportTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, status: 'resolved' } : t
    ));
  }, [setSupportTickets]);

  const generateUserApiKey = useCallback((userId: string) => {
    const newApiKey = `nf_live_${[...Array(24)].map(() => Math.random().toString(36)[2]).join('')}`;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, apiKey: newApiKey } : u));
     if(user?.id === userId) {
        const updatedUser = { ...user, apiKey: newApiKey };
        setUser(updatedUser);
        sessionStorage.setItem('nexusforge_session', JSON.stringify(updatedUser));
    }
  }, [user, setUsers]);

  const revokeUserApiKey = useCallback((userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, apiKey: null } : u));
    if(user?.id === userId) {
        const updatedUser = { ...user, apiKey: null };
        setUser(updatedUser);
        sessionStorage.setItem('nexusforge_session', JSON.stringify(updatedUser));
    }
  }, [user, setUsers]);
  
  const toggleFeatureFlag = useCallback((feature: string) => {
    setFeatureFlags(prev => ({ ...prev, [feature]: !prev[feature] }));
  }, [setFeatureFlags]);

  const toggleMaintenanceFlag = useCallback((feature: string) => {
    setMaintenanceFlags(prev => ({ ...prev, [feature]: !prev[feature] }));
  }, [setMaintenanceFlags]);

  const addCustomImage = useCallback((imageDataUrl: string) => {
    setCustomImages(prev => [imageDataUrl, ...prev]);
  }, [setCustomImages]);

  // FIX: Create a wrapper for setAnnouncement to match the context type definition.
  const handleSetAnnouncement = useCallback((message: string, active: boolean) => {
    setAnnouncement({ message, active });
  }, [setAnnouncement]);

  const contextValue = useMemo(() => ({
    user,
    users,
    projects,
    supportTickets,
    bannedIPs,
    logs,
    selectedProject,
    featureFlags,
    maintenanceFlags,
    announcement,
    newProjectName,
    customImages,
    login,
    logout,
    updateUser,
    addProject,
    updateProjectName,
    duplicateProject,
    deleteProject,
    updateProjectConfig,
    updateProjectHosting,
    viewProject,
    navigate,
    createSupportTicket,
    resolveSupportTicket,
    setUserPlan,
    upgradePlan,
    updateUserRole,
    banUserIP,
    unbanUserIP,
    generateUserApiKey,
    revokeUserApiKey,
    toggleFeatureFlag,
    toggleMaintenanceFlag,
    setAnnouncement: handleSetAnnouncement,
    setNewProjectName,
    syncBotData,
    addCustomImage,
  }), [user, users, projects, supportTickets, bannedIPs, logs, selectedProject, featureFlags, maintenanceFlags, announcement, newProjectName, customImages, login, logout, updateUser, addProject, updateProjectName, duplicateProject, deleteProject, updateProjectConfig, updateProjectHosting, viewProject, navigate, createSupportTicket, resolveSupportTicket, setUserPlan, upgradePlan, updateUserRole, banUserIP, unbanUserIP, generateUserApiKey, revokeUserApiKey, toggleFeatureFlag, toggleMaintenanceFlag, handleSetAnnouncement, setNewProjectName, syncBotData, addCustomImage]);

  const renderPage = () => {
    // If not logged in, always show login page, regardless of currentPage state
    if (!user) {
        return <LoginPage />;
    }

    switch (currentPage) {
      case Page.LOGIN:
        return <LoginPage />;
      case Page.DASHBOARD:
        return <DashboardPage />;
      case Page.BOT_BUILDER:
        return maintenanceFlags['Bot Builder'] ? <MaintenanceNotice featureName="Bot Builder" /> : <BotBuilderPage project={selectedProject} />;
      case Page.WEBSITE_BUILDER:
        return maintenanceFlags['Website Builder'] ? <MaintenanceNotice featureName="Website Builder" /> : <WebsiteBuilderPage project={selectedProject} />;
      case Page.ADMIN_PANEL:
        return <AdminPanelPage />;
      case Page.SETTINGS:
        return <SettingsPage />;
      case Page.MARKETPLACE:
        return <TemplateMarketplacePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`min-h-screen bg-gray-900 text-gray-100 ${seasonalTheme !== 'default' ? `theme-${seasonalTheme}` : ''}`}>
        <div key={currentPage} className="animate-page-fade-in">
          {renderPage()}
        </div>
        {showAnnouncement && <AnnouncementPopup message={announcement.message} onClose={handleCloseAnnouncement} />}
        {planToUpgrade && <PaymentModal 
            plan={planToUpgrade.plan}
            cycle={planToUpgrade.cycle} 
            onLoginInfo={({username, email, password, plan}) => login(username, email, password, plan)} 
            onClose={() => setPlanToUpgrade(null)} 
            onSuccess={() => completeUpgrade(planToUpgrade.plan)} 
        />}
      </div>
    </AppContext.Provider>
  );
};

export default App;