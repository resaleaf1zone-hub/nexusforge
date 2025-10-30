
import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import type { Project, BotConfig } from '../types';
import { generateBotCode } from '../services/discordBotGenerator';
import { AppContext } from '../contexts/AppContext';

interface DeploymentModalProps {
    project: Project;
    onClose: () => void;
    onDeploySuccess?: (url?: string | null) => void;
    siteHtml?: string; 
}

const BotDeploymentModal: React.FC<{ project: Project; onClose: () => void }> = ({ project, onClose }) => {
    const context = useContext(AppContext);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCode, setShowCode] = useState(false);
    const botConfig = project.config as BotConfig;
    
    const botCode = useMemo(() => generateBotCode(botConfig), [botConfig]);
    const [copyButtonText, setCopyButtonText] = useState('Copy Code');

    const handleDeploy = () => {
        if (!botConfig.token || !botConfig.clientId) {
            alert("Please provide a valid Bot Token and Client ID in 'Core Configuration' before deploying.");
            onClose();
            return;
        }
        setIsProcessing(true);
        context?.updateProjectHosting(project.id, 'deploying');
        setTimeout(() => {
            const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${botConfig.clientId}&permissions=8&scope=bot`;
            context?.updateProjectHosting(project.id, 'online', undefined, inviteUrl);
            setIsProcessing(false);
        }, 1500);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(botCode);
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy Code'), 2000);
    };

    const handleStop = () => {
        context?.updateProjectHosting(project.id, 'offline');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl border border-primary/20 animate-slide-in-top" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">Manage Bot Deployment</h2>
                
                {project.hostingStatus === 'online' ? (
                    <div>
                        <p className="text-green-400 font-semibold mb-4">✓ Your bot is online and running!</p>
                        <div className="bg-gray-700/50 p-4 rounded-md">
                            <label className="text-sm text-gray-400">Bot Invite Link</label>
                            <input type="text" readOnly value={project.botInviteUrl || ''} className="w-full bg-gray-600 p-2 rounded-md mt-1 font-mono text-sm" />
                        </div>
                        <button onClick={handleStop} className="w-full mt-6 py-3 bg-red-600 hover:bg-red-700 rounded-md font-semibold transition">Take Offline</button>
                    </div>
                ) : project.hostingStatus === 'deploying' || isProcessing ? (
                     <div className="flex flex-col items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="mt-4 text-gray-300">Deployment in progress...</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-400 mb-4">Your bot is currently offline. Click deploy to start it.</p>
                        <button onClick={handleDeploy} disabled={isProcessing} className="w-full py-3 bg-primary hover:bg-primary-hover rounded-md font-semibold transition disabled:opacity-50">
                            {isProcessing ? 'Deploying...' : 'Deploy to Cloud'}
                        </button>
                    </div>
                )}

                <div className="mt-6">
                    <button onClick={() => setShowCode(!showCode)} className="text-blue-400 hover:underline text-sm">{showCode ? 'Hide' : 'Show'} Generated Python Code</button>
                    {showCode && (
                        <div className="mt-2 bg-gray-900 p-4 rounded-md relative max-h-64 overflow-y-auto">
                            <button onClick={handleCopyCode} className="absolute top-2 right-2 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md">{copyButtonText}</button>
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap"><code>{botCode}</code></pre>
                        </div>
                    )}
                </div>
                
                <button onClick={onClose} className="w-full text-center text-sm text-gray-500 mt-6 hover:text-gray-400">Close</button>
            </div>
        </div>
    );
};


const WebsiteDeploymentModal: React.FC<DeploymentModalProps> = ({ project, onClose, onDeploySuccess }) => {
    const context = useContext(AppContext);
    const [status, setStatus] = useState<'idle' | 'deploying' | 'success' | 'stopped'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const logContainerRef = useRef<HTMLDivElement>(null);

    const deploymentSteps = useMemo(() => [
        { text: `> Cloning project: "${project.name}"...`, time: 300 },
        { text: `> Installing dependencies...`, time: 1000 },
        { text: `> Analyzing project structure...`, time: 500 },
        { text: `> Building static assets...`, time: 1500 },
        { text: `> Optimizing images...`, time: 800 },
        { text: `> Finalizing build...`, time: 400 },
        { text: `> Deploying to NexusForge global network...`, time: 1200 },
        { text: `> Assigning domain...`, time: 500 },
    ], [project.name]);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const runDeployment = async () => {
        setStatus('deploying');
        setLogs([]);
        context?.updateProjectHosting(project.id, 'deploying');

        for (const step of deploymentSteps) {
            await new Promise(res => setTimeout(res, step.time));
            setLogs(prev => [...prev, step.text]);
        }
        
        const deployedUrl = `https://${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 8)}.vercel.app`;
        setLogs(prev => [...prev, `> Success! Deployed to ${deployedUrl}`]);
        setStatus('success');
        if (onDeploySuccess) onDeploySuccess(deployedUrl);
    };

    const handleStop = () => {
        setStatus('stopped');
        context?.updateProjectHosting(project.id, 'offline', null);
    };

    const handleRedeploy = () => {
        runDeployment();
    };

    const renderContent = () => {
        if (project.hostingStatus === 'online' && status !== 'deploying' && status !== 'success') {
            return (
                <div>
                    <p className="text-green-400 font-semibold mb-4">✓ Your site is live!</p>
                    <div className="bg-gray-700/50 p-4 rounded-md">
                        <label className="text-sm text-gray-400">Live URL</label>
                        <a href={project.liveUrl || '#'} target="_blank" rel="noopener noreferrer" className="block w-full bg-gray-600 p-2 rounded-md mt-1 font-mono text-sm text-blue-300 hover:underline">{project.liveUrl}</a>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button onClick={handleStop} className="w-full py-3 bg-red-600/80 hover:bg-red-700 rounded-md font-semibold transition">Take Offline</button>
                        <button onClick={handleRedeploy} className="w-full py-3 bg-primary/80 hover:bg-primary rounded-md font-semibold transition">Redeploy</button>
                    </div>
                </div>
            );
        }

        if (status === 'deploying' || status === 'success') {
            return (
                <div>
                    <div ref={logContainerRef} className="bg-black/50 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm text-gray-300 space-y-1">
                        {logs.map((log, i) => <p key={i} className="whitespace-pre-wrap">{log}</p>)}
                        {status === 'deploying' && <div className="flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Running...</span></div>}
                    </div>
                     <div className="flex gap-4 mt-6">
                        {status === 'success' && (
                             <a href={project.liveUrl || '#'} target="_blank" rel="noopener noreferrer" className="w-full block text-center py-3 bg-primary hover:bg-primary-hover rounded-md font-semibold transition">Visit Site</a>
                        )}
                    </div>
                </div>
            )
        }
        
        return (
             <div>
                 <p className="text-gray-400 mb-4 text-center">Your website is currently offline or undeployed.</p>
                 <button onClick={runDeployment} className="w-full py-3 bg-primary hover:bg-primary-hover rounded-md font-semibold transition">
                    Publish Website
                </button>
            </div>
        )
    };
    
    return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl border border-primary/20 animate-slide-in-top" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">Manage Website Deployment</h2>
                {renderContent()}
                <button onClick={onClose} className="w-full text-center text-sm text-gray-500 mt-6 hover:text-gray-400">Close</button>
            </div>
        </div>
    )
};


const DeploymentModal: React.FC<DeploymentModalProps> = ({ project, onClose, onDeploySuccess, siteHtml }) => {
    if (project.type === 'bot') {
        return <BotDeploymentModal project={project} onClose={onClose} />;
    }
    
    return <WebsiteDeploymentModal project={project} onClose={onClose} onDeploySuccess={onDeploySuccess} siteHtml={siteHtml} />;
};

export default DeploymentModal;
