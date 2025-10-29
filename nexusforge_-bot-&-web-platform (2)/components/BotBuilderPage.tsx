import React, { useState, useContext, useEffect, useMemo } from 'react';
import type { Project, BotConfig, CustomCommand, Embed, EmbedField, RoleReward, ReactionRoleConfig, SocialFeed, TicketPanel } from '../types';
import { AppContext } from '../contexts/AppContext';
import { Page } from '../types';
import SupportWidget from './SupportWidget';
import DeploymentModal from './DeploymentModal';
import ImageGalleryModal from './ImageGalleryModal';

const featuresConfig: Record<string, { name: string; premium: boolean }[]> = {
  "Project": [
    { name: "Deployment", premium: false },
  ],
  "Bot Basics": [
    { name: "Core Configuration", premium: false },
    { name: "Custom Commands", premium: false },
    { name: "Embed Builder", premium: false },
  ],
  "Pre-built Modules": [
    { name: "Welcome Messages", premium: false },
    // Merged "Auto Role Assignment" into Welcome for better UX
    { name: "Moderation Commands", premium: false },
    { name: "Auto-Moderation", premium: false },
    { name: "Leveling System", premium: false },
    { name: "Reaction Roles", premium: false },
    { name: "Music Player", premium: false },
    { name: "Tickets", premium: false },
  ],
  "Social & Utility": [
    { name: "Social Media Notifications", premium: false },
    { name: "Birthdays", premium: false },
    { name: "Polls", premium: false },
    { name: "Suggestions", premium: false },
    { name: "Starboard", premium: false },
  ],
  "Integrations": [
    { name: "Image Scraper", premium: false },
    { name: "Webhooks Integration", premium: false }, 
    { name: "IFTTT Integration", premium: false } 
  ],
  "Advanced Features (Coming Soon)": [
      { name: "Drag & Drop Command Builder", premium: false },
      { name: "Drag & Drop Event Builder", premium: false },
      { name: "Interactive Components", premium: false },
      { name: "Variable System & Data Storage", premium: false },
      { name: "If/Else Logic & Conditions", premium: false },
      { name: "Timed Events & Scheduling", premium: false },
  ],
  "Premium Modules": [
    { name: "Custom Status", premium: true },
    { name: "Counting", premium: true }, 
    { name: "ChatGPT", premium: true }, 
    { name: "Image Generation", premium: true },
    { name: "Modmail", premium: true }, 
    { name: "Verification", premium: true },
    { name: "Auto-React", premium: true },
    { name: "Global Chat", premium: true }, 
    { name: "Roblox Verification", premium: true },
    { name: "Temp Voice Channels", premium: true }, 
    { name: "Media Channels", premium: true }, 
    { name: "Invite Tracker", premium: true },
    { name: "Sticky Roles", premium: true }, 
    { name: "Statistic Channels", premium: true },
    { name: "Question Of The Day", premium: true },
    { name: "Translation", premium: true }, 
    { name: "Emoji Manager", premium: true },
    { name: "Sticky Messages", premium: true },
  ],
};

const MaintenanceNotice: React.FC<{ featureName: string }> = ({ featureName }) => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-800 p-8 rounded-lg border border-gray-700">
      <div className="text-4xl mb-4">⚙️</div>
      <h2 className="text-2xl font-bold text-gray-300 mb-2">{featureName} is in Maintenance</h2>
      <p>This feature is temporarily unavailable. Please check back later.</p>
  </div>
);

const FeaturePlaceholder: React.FC<{ featureName: string }> = ({ featureName }) => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-800 p-8 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-gray-300 mb-2">{featureName}</h2>
      <p>This is an advanced feature currently under development.</p>
      <p className="mt-4 text-yellow-400 text-sm">The full visual builder for this will be available soon!</p>
  </div>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);

const PremiumFeatureLock: React.FC = () => {
    const context = useContext(AppContext);
    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-yellow-500/30 text-center">
            <h2 className="text-xl font-bold mb-2 text-yellow-400">Premium Feature</h2>
            <p className="text-gray-300">This feature is available on the Pro plan and higher.</p>
            <button onClick={() => context?.upgradePlan('Pro')} className="mt-4 px-5 py-2 bg-primary rounded-lg font-semibold hover:bg-primary-hover transition">Upgrade to Pro</button>
        </div>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2">{title}</h2>
        <div className="space-y-4">{children}</div>
    </div>
);

const Toggle: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void }> = ({ label, enabled, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer">
        <span className="text-gray-300">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={enabled} onChange={e => onChange(e.target.checked)} />
            <div className={`block w-14 h-8 rounded-full transition ${enabled ? 'bg-primary' : 'bg-gray-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'transform translate-x-6' : ''}`}></div>
        </div>
    </label>
);

const TextInput: React.FC<{ label: string; value: string; onChange: (value: string) => void; placeholder?: string }> = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-gray-700 p-2 rounded-md focus:ring-2 focus:ring-primary outline-none" />
    </div>
);

const MOCK_CHANNELS = ['#general', '#announcements', '#logs', '#welcome', '#rules', '#suggestions', '#bot-commands', '#tickets', '#starboard', '#birthdays', '#global', '#memes', '#music', '#voice-chat-1', '#afk'];
const MOCK_ROLES = ['Admin', 'Moderator', 'Member', 'VIP', 'Bot', 'Server Booster', 'DJ', 'Support Team', 'Muted', 'Verified'];

const SelectInput: React.FC<{ label: string; value: string; onChange: (value: string) => void; options: string[]; placeholder?: string }> = ({ label, value, onChange, options, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <div className="relative">
            <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md focus:ring-2 focus:ring-primary outline-none appearance-none pr-8">
                {(!options || options.length === 0) && <option value="">{placeholder || 'No options available'}</option>}
                {options.map(opt => <option key={opt} value={opt.startsWith('#') ? opt.substring(1) : opt}>{opt}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.144-.446 1.58 0L10 10.405l2.904-2.857c.436-.446 1.144-.446 1.58 0 .436.446.436 1.17 0 1.615l-3.694 3.63c-.436.446-1.144.446-1.58 0L5.516 9.163c-.436-.446-.436-1.17 0-1.615z"/></svg>
            </div>
        </div>
    </div>
);

const CommandExampleUI: React.FC<{ command: string; description: string; responseTitle: string; responseBody: React.ReactNode; }> = ({ command, description, responseTitle, responseBody }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg mt-4 border border-gray-700">
        <h3 className="text-md font-bold text-gray-300 mb-2">Usage Example</h3>
        <p className="font-mono text-sm text-gray-400 mb-2"><span className="text-primary">User types:</span> {command}</p>
        <p className="text-sm text-gray-400 mb-4">{description}</p>
        <div className="mt-2">
            <p className="text-sm text-gray-400 mb-2"><span className="text-green-400">Bot responds:</span></p>
            <div className="bg-[#313338] p-4 rounded-lg">
                <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 mr-3"></div>
                    <div>
                        <p className="text-white font-semibold">Your Bot <span className="text-xs text-gray-400 font-normal bg-gray-700 px-1 rounded">BOT</span></p>
                        <div className="mt-2 bg-[#2B2D31] p-3 rounded-md border-l-4 border-primary max-w-xs">
                            <p className="text-white font-bold">{responseTitle}</p>
                            <div className="mt-2 text-xs">{responseBody}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const CoreSettings: React.FC<{ config: BotConfig, updateConfigValue: (path: string[], value: any) => void, projectId: string, openGallery: (context: 'avatar' | 'banner') => void }> = ({ config, updateConfigValue, projectId, openGallery }) => {
    const context = useContext(AppContext);

    const handleSync = () => {
        context?.syncBotData(projectId, { channels: MOCK_CHANNELS, roles: MOCK_ROLES });
    }

    return (
        <Section title="Core Configuration">
            <p className="text-sm text-gray-400 -mt-2 mb-4">This is the most critical part of your bot's setup.</p>
            <TextInput label="Discord Bot Token" value={config.token} onChange={v => updateConfigValue(['token'], v)} placeholder="Paste your bot token here" />
            <p className="text-xs text-gray-500 mt-1">Your bot's token is like a password. Get it from the Discord Developer Portal. Keep it secret!</p>
            <TextInput label="Discord Client ID" value={config.clientId} onChange={v => updateConfigValue(['clientId'], v)} placeholder="Paste your bot's Client ID here" />
            <p className="text-xs text-gray-500 mt-1">The Client ID is used to create an invite link for your bot.</p>
            
            <div className="pt-4 mt-4 border-t border-gray-700">
                <h3 className="text-lg font-bold text-gray-200 mb-2">Bot Profile</h3>
                <p className="text-sm text-gray-400 mb-4">Customize your bot's appearance on Discord.</p>
                
                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <img 
                        src={config.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                        alt="Bot Avatar Preview" 
                        className="w-20 h-20 rounded-full bg-gray-700 object-cover"
                    />
                    <div className="flex-grow">
                        <TextInput label="Bot Avatar URL" value={config.avatarUrl} onChange={v => updateConfigValue(['avatarUrl'], v)} placeholder="https://..." />
                        <button type="button" onClick={() => openGallery('avatar')} className="mt-2 px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded-md">
                            Select from Gallery
                        </button>
                    </div>
                </div>

                {/* Banner */}
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Bot Banner Preview</label>
                    <div className="w-full h-24 bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                        {config.bannerUrl ? (
                            <img src={config.bannerUrl} alt="Bot Banner Preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-500 text-sm">No banner set</span>
                        )}
                    </div>
                    <div className="flex-grow mt-2">
                        <TextInput label="Bot Banner URL" value={config.bannerUrl} onChange={v => updateConfigValue(['bannerUrl'], v)} placeholder="https://..." />
                        <button type="button" onClick={() => openGallery('banner')} className="mt-2 px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded-md">
                            Select from Gallery
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-700">
                <h3 className="text-lg font-bold text-gray-200 mb-2">Server Data Sync</h3>
                <p className="text-sm text-gray-400 mb-4">Click to fetch your server's channels and roles. This will populate dropdowns throughout the builder. (Uses mock data for this demo)</p>
                <button onClick={handleSync} className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition font-semibold">
                    Sync Channels & Roles
                </button>
                {(config.syncedChannels && config.syncedChannels.length > 0) && 
                    <p className="text-xs text-green-400 mt-2 animate-fade-in">✓ Synced {config.syncedChannels.length} channels and {config.syncedRoles?.length || 0} roles.</p>
                }
            </div>
        </Section>
    );
};

const WelcomerSettings: React.FC<{ config: BotConfig, updateConfigValue: (path: string[], value: any) => void }> = ({ config, updateConfigValue }) => {
    const [roleInput, setRoleInput] = useState('');
    const addRole = () => {
        if (roleInput.trim() && !config.features.welcomeMessage.joinRoles.includes(roleInput.trim())) {
            updateConfigValue(['features', 'welcomeMessage', 'joinRoles'], [...config.features.welcomeMessage.joinRoles, roleInput.trim()]);
            setRoleInput('');
        }
    };
    const removeRole = (role: string) => {
        updateConfigValue(['features', 'welcomeMessage', 'joinRoles'], config.features.welcomeMessage.joinRoles.filter(r => r !== role));
    };

    const availableRoles = config.syncedRoles?.filter(r => !config.features.welcomeMessage.joinRoles.includes(r)) || [];

    return (
        <div className="space-y-6">
            <Section title="Welcome Messages">
                <p className="text-sm text-gray-400 -mt-2 mb-4">Automatically greet new members when they join your server.</p>
                <Toggle label="Enable Welcome Messages" enabled={config.features.welcomeMessage.enabled} onChange={v => updateConfigValue(['features', 'welcomeMessage', 'enabled'], v)} />
                {config.features.welcomeMessage.enabled && <div className="space-y-4 animate-fade-in">
                    <SelectInput label="Welcome Channel" value={config.features.welcomeMessage.channel} onChange={v => updateConfigValue(['features', 'welcomeMessage', 'channel'], v)} options={config.syncedChannels || []} placeholder="Sync channels to select..." />
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Welcome Message</label>
                        <textarea value={config.features.welcomeMessage.message} onChange={e => updateConfigValue(['features', 'welcomeMessage', 'message'], e.target.value)} rows={3} className="w-full bg-gray-700 p-2 rounded-md" />
                        <p className="text-xs text-gray-500 mt-1">Use {'{user}'} for user mention and {'{server}'} for server name.</p>
                    </div>
                </div>}
            </Section>
            <Section title="Welcome Cards (Banners)">
                <p className="text-sm text-gray-400 -mt-2 mb-4">Send a customized image banner to greet new users.</p>
                <Toggle label="Send Welcome Card on Join" enabled={config.features.welcomeMessage.sendCard} onChange={v => updateConfigValue(['features', 'welcomeMessage', 'sendCard'], v)} />
                {config.features.welcomeMessage.sendCard && <div className="space-y-4 animate-fade-in">
                    <TextInput label="Card Title" value={config.features.welcomeMessage.cardConfig.title} onChange={v => updateConfigValue(['features', 'welcomeMessage', 'cardConfig', 'title'], v)} />
                    <label className="flex justify-between items-center text-sm">Background Color <input type="color" value={config.features.welcomeMessage.cardConfig.backgroundColor} onChange={e => updateConfigValue(['features', 'welcomeMessage', 'cardConfig', 'backgroundColor'], e.target.value)} className="bg-gray-800"/></label>
                    <label className="flex justify-between items-center text-sm">Text Color <input type="color" value={config.features.welcomeMessage.cardConfig.textColor} onChange={e => updateConfigValue(['features', 'welcomeMessage', 'cardConfig', 'textColor'], e.target.value)} className="bg-gray-800"/></label>
                </div>}
            </Section>
            <Section title="Leave Messages">
                <p className="text-sm text-gray-400 -mt-2 mb-4">Announce when a member leaves the server.</p>
                <Toggle label="Enable Leave Messages" enabled={config.features.welcomeMessage.leaveMessage.enabled} onChange={v => updateConfigValue(['features', 'welcomeMessage', 'leaveMessage', 'enabled'], v)} />
                {config.features.welcomeMessage.leaveMessage.enabled && <div className="space-y-4 animate-fade-in">
                    <SelectInput label="Leave Channel" value={config.features.welcomeMessage.leaveMessage.channel} onChange={v => updateConfigValue(['features', 'welcomeMessage', 'leaveMessage', 'channel'], v)} options={config.syncedChannels || []} placeholder="Sync channels to select..." />
                    <TextInput label="Leave Message" value={config.features.welcomeMessage.leaveMessage.message} onChange={v => updateConfigValue(['features', 'welcomeMessage', 'leaveMessage', 'message'], v)} placeholder="{user} has left the server." />
                </div>}
            </Section>
             <Section title="Auto Role Assignment">
                <p className="text-sm text-gray-400 -mt-2 mb-4">Assign roles to users as soon as they join the server.</p>
                <div className="space-y-2">
                    {config.features.welcomeMessage.joinRoles.map(role => (
                        <div key={role} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-md">
                            <span className="text-gray-300">{role}</span>
                            <button onClick={() => removeRole(role)} className="text-red-400 hover:text-red-300 text-lg font-bold">×</button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <select value={roleInput} onChange={e => setRoleInput(e.target.value)} className="flex-1 bg-gray-700 p-2 rounded-md outline-none appearance-none pr-8">
                        <option value="">Select a role to add...</option>
                        {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button onClick={addRole} disabled={!roleInput} className="px-4 bg-primary rounded-md hover:bg-primary-hover text-sm font-semibold disabled:opacity-50">Add Role</button>
                </div>
            </Section>
        </div>
    );
}

const ModerationSettings: React.FC<{ config: BotConfig, updateConfigValue: (p: string[], v: any) => void }> = ({ config, updateConfigValue }) => (
  <Section title="Moderation Commands">
    <p className="text-sm text-gray-400 -mt-2 mb-4">Enable basic moderation commands like kick and ban for server staff.</p>
    <Toggle label="Enable Moderation Commands" enabled={config.features.moderation.enabled} onChange={v => updateConfigValue(['features', 'moderation', 'enabled'], v)} />
     {config.features.moderation.enabled && (
        <div className="animate-fade-in space-y-4">
          <SelectInput label="Admin Role" value={config.features.moderation.adminRole} onChange={v => updateConfigValue(['features', 'moderation', 'adminRole'], v)} options={config.syncedRoles || []} placeholder="Sync roles to select..." />
           <p className="text-xs text-gray-500 -mt-3">Users with this role can use kick/ban commands.</p>
           <CommandExampleUI
                command="!kick @someuser spamming"
                description="Removes a user from the server and logs the action."
                responseTitle="Action: Kick"
                responseBody={
                     <p className="text-gray-300 whitespace-pre-wrap">
                        <span className="font-bold">User:</span> @someuser<br/>
                        <span className="font-bold">Reason:</span> spamming
                    </p>
                }
            />
        </div>
      )}
  </Section>
);

const AutoModerationSettings: React.FC<{ config: BotConfig, updateConfigValue: (p: string[], v: any) => void }> = ({ config, updateConfigValue }) => {
    const bannedWords = config.features.moderation.autoModeration.bannedWords.join(', ');
    const handleWordsChange = (value: string) => {
        updateConfigValue(['features', 'moderation', 'autoModeration', 'bannedWords'], value.split(',').map(w => w.trim()).filter(Boolean));
    };
    return (
        <Section title="Auto-Moderation">
            <p className="text-sm text-gray-400 -mt-2 mb-4">Let the bot automatically manage your server by deleting unwanted messages.</p>
            <Toggle label="Enable Auto-Moderation" enabled={config.features.moderation.autoModeration.enabled} onChange={v => updateConfigValue(['features', 'moderation', 'autoModeration', 'enabled'], v)} />
            {config.features.moderation.autoModeration.enabled && <div className="space-y-4 animate-fade-in">
                <Toggle label="Anti-Spam (detect rapid messages)" enabled={config.features.moderation.autoModeration.antiSpam} onChange={v => updateConfigValue(['features', 'moderation', 'autoModeration', 'antiSpam'], v)} />
                <Toggle label="Anti-Link (delete messages with links)" enabled={config.features.moderation.autoModeration.antiLink} onChange={v => updateConfigValue(['features', 'moderation', 'autoModeration', 'antiLink'], v)} />
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Banned Words (comma separated)</label>
                    <textarea value={bannedWords} onChange={e => handleWordsChange(e.target.value)} rows={3} className="w-full bg-gray-700 p-2 rounded-md" />
                    <p className="text-xs text-gray-500 mt-1">The bot will delete any messages containing these words.</p>
                </div>
            </div>}
        </Section>
    );
};

const CustomCommandsSettings: React.FC<{ config: BotConfig, updateConfigValue: (p: string[], v: any) => void }> = ({ config, updateConfigValue }) => {
    const [newCommand, setNewCommand] = useState({ trigger: '', response: '' });

    const addCustomCommand = () => {
        if (newCommand.trigger.trim() && newCommand.response.trim()) {
          const command: CustomCommand = { ...newCommand, id: `cmd_${Date.now()}` };
          updateConfigValue(['customCommands'], [...config.customCommands, command]);
          setNewCommand({ trigger: '', response: '' });
        }
    };
      
    const removeCustomCommand = (id: string) => {
        updateConfigValue(['customCommands'], config.customCommands.filter(cmd => cmd.id !== id));
    };

    return (
        <Section title="Custom Commands">
            <p className="text-sm text-gray-400 -mt-2 mb-4">Create simple text commands. When a user types the trigger, the bot replies with your response.</p>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {config.customCommands.map(cmd => (
                    <div key={cmd.id} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-md">
                        <div>
                            <span className="font-mono text-primary">!{cmd.trigger}</span>
                            <span className="text-gray-400 mx-2">&rarr;</span>
                            <span className="text-gray-300 italic">"{cmd.response}"</span>
                        </div>
                        <button onClick={() => removeCustomCommand(cmd.id)} className="text-red-400 hover:text-red-300 text-lg font-bold">×</button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="!trigger" value={newCommand.trigger} onChange={e => setNewCommand({...newCommand, trigger: e.target.value})} className="flex-1 bg-gray-700 p-2 rounded-md outline-none" />
              <input type="text" placeholder="Response text" value={newCommand.response} onChange={e => setNewCommand({...newCommand, response: e.target.value})} className="flex-1 bg-gray-700 p-2 rounded-md outline-none" />
              <button onClick={addCustomCommand} className="px-4 bg-primary rounded-md hover:bg-primary-hover text-xl font-bold">+</button>
            </div>
        </Section>
    );
};

const LevelingSettings: React.FC<{ config: BotConfig, updateConfigValue: (p: string[], v: any) => void }> = ({ config, updateConfigValue }) => {
    const [newReward, setNewReward] = useState({ level: '', roleName: '' });

    const addReward = () => {
        const level = parseInt(newReward.level);
        if (!isNaN(level) && level > 0 && newReward.roleName.trim()) {
            const reward: RoleReward = { id: `rr_${Date.now()}`, level, roleName: newReward.roleName.trim() };
            updateConfigValue(['features', 'leveling', 'roleRewards'], [...config.features.leveling.roleRewards, reward]);
            setNewReward({ level: '', roleName: '' });
        }
    };

    const removeReward = (id: string) => {
        updateConfigValue(['features', 'leveling', 'roleRewards'], config.features.leveling.roleRewards.filter(r => r.id !== id));
    };

    return (
        <div className="space-y-6">
            <Section title="Leveling System">
                <p className="text-sm text-gray-400 -mt-2 mb-4">Reward active users with XP for chatting and being in voice channels. Grant roles automatically when they reach certain levels.</p>
                <Toggle label="Enable Leveling" enabled={config.features.leveling.enabled} onChange={v => updateConfigValue(['features', 'leveling', 'enabled'], v)} />
                {config.features.leveling.enabled && <div className="space-y-4 animate-fade-in">
                    <TextInput label="Level-Up Message" value={config.features.leveling.levelUpMessage} onChange={v => updateConfigValue(['features', 'leveling', 'levelUpMessage'], v)} />
                    <p className="text-xs text-gray-500 -mt-3">Use {'{user}'} and {'{level}'}.</p>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Voice Chat XP Rate (per minute)</label>
                        <input type="number" value={config.features.leveling.voiceXpRate} onChange={e => updateConfigValue(['features', 'leveling', 'voiceXpRate'], parseInt(e.target.value) || 0)} className="w-full bg-gray-700 p-2 rounded-md" />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-2 text-gray-300">Role Rewards</h3>
                        <div className="space-y-2 mb-4">
                            {config.features.leveling.roleRewards.map(reward => (
                                <div key={reward.id} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-md">
                                    <span className="text-gray-300">Level <span className="text-primary font-bold">{reward.level}</span> &rarr; <span className="text-purple-400">{reward.roleName}</span></span>
                                    <button onClick={() => removeReward(reward.id)} className="text-red-400 hover:text-red-300 text-lg font-bold">×</button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input type="number" placeholder="Level" value={newReward.level} onChange={e => setNewReward({...newReward, level: e.target.value})} className="w-24 bg-gray-700 p-2 rounded-md outline-none" />
                            <select value={newReward.roleName} onChange={e => setNewReward({...newReward, roleName: e.target.value})} className="flex-1 bg-gray-700 p-2 rounded-md outline-none">
                                <option value="">Select a role...</option>
                                {(config.syncedRoles || []).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <button onClick={addReward} className="px-4 bg-primary rounded-md hover:bg-primary-hover text-sm font-semibold">Add Reward</button>
                        </div>
                    </div>
                </div>}
            </Section>
            <Section title="Level-Up Card Customization">
                 <p className="text-sm text-gray-400 -mt-2 mb-4">Customize the appearance of the rank/level-up card image that appears when users type the !rank command.</p>
                <label className="flex justify-between items-center text-sm">Background Color <input type="color" value={config.features.leveling.cardConfig.backgroundColor} onChange={e => updateConfigValue(['features', 'leveling', 'cardConfig', 'backgroundColor'], e.target.value)} className="bg-gray-800"/></label>
                <label className="flex justify-between items-center text-sm">Text Color <input type="color" value={config.features.leveling.cardConfig.textColor} onChange={e => updateConfigValue(['features', 'leveling', 'cardConfig', 'textColor'], e.target.value)} className="bg-gray-800"/></label>
                <label className="flex justify-between items-center text-sm">XP Bar Color <input type="color" value={config.features.leveling.cardConfig.barColor} onChange={e => updateConfigValue(['features', 'leveling', 'cardConfig', 'barColor'], e.target.value)} className="bg-gray-800"/></label>
            </Section>
        </div>
    );
};

const ReactionRolesSettings: React.FC<{ config: BotConfig, updateConfigValue: (p: string[], v: any) => void }> = ({ config, updateConfigValue }) => {
    const [newRR, setNewRR] = useState({ messageId: '', emoji: '', roleName: '' });
    const addRR = () => {
        if (newRR.messageId.trim() && newRR.emoji.trim() && newRR.roleName.trim()) {
            const rr: ReactionRoleConfig = { ...newRR, id: `rr_${Date.now()}` };
            updateConfigValue(['features', 'reactionRoles', 'configs'], [...config.features.reactionRoles.configs, rr]);
            setNewRR({ messageId: '', emoji: '', roleName: '' });
        }
    };
    const removeRR = (id: string) => {
        updateConfigValue(['features', 'reactionRoles', 'configs'], config.features.reactionRoles.configs.filter(r => r.id !== id));
    };
    return (
        <Section title="Reaction Roles">
            <p className="text-sm text-gray-400 -mt-2 mb-4">Allow users to assign themselves roles by reacting to a specific message with an emoji.</p>
            <Toggle label="Enable Reaction Roles" enabled={config.features.reactionRoles.enabled} onChange={v => updateConfigValue(['features', 'reactionRoles', 'enabled'], v)} />
            {config.features.reactionRoles.enabled && <div className="space-y-4 animate-fade-in">
                <div className="space-y-2 mb-4">
                    {config.features.reactionRoles.configs.map(rr => (
                        <div key={rr.id} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-md">
                            <span className="text-gray-300 text-sm">Msg <span className="text-primary">{rr.messageId}</span> + {rr.emoji} &rarr; <span className="text-purple-400">{rr.roleName}</span></span>
                            <button onClick={() => removeRR(rr.id)} className="text-red-400 hover:text-red-300 text-lg font-bold">×</button>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input type="text" placeholder="Message ID" value={newRR.messageId} onChange={e => setNewRR({...newRR, messageId: e.target.value})} className="bg-gray-700 p-2 rounded-md" />
                    <input type="text" placeholder="Emoji" value={newRR.emoji} onChange={e => setNewRR({...newRR, emoji: e.target.value})} className="bg-gray-700 p-2 rounded-md" />
                    <select value={newRR.roleName} onChange={e => setNewRR({...newRR, roleName: e.target.value})} className="bg-gray-700 p-2 rounded-md">
                        <option value="">Select a role...</option>
                        {(config.syncedRoles || []).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <button onClick={addRR} className="w-full py-2 bg-primary rounded-md hover:bg-primary-hover font-semibold">Add Reaction Role</button>
            </div>}
        </Section>
    );
};

const TicketSettings: React.FC<{ config: BotConfig, updateConfigValue: (p: string[], v: any) => void }> = ({ config, updateConfigValue }) => {
    const [editingPanel, setEditingPanel] = useState<TicketPanel | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    
    const ticketConfig = config.features.ticketSystem;

    const handleSavePanel = () => {
        if (!editingPanel) return;
        if (isCreating) {
            updateConfigValue(['features', 'ticketSystem', 'panels'], [...ticketConfig.panels, editingPanel]);
        } else {
            updateConfigValue(['features', 'ticketSystem', 'panels'], ticketConfig.panels.map(p => p.id === editingPanel.id ? editingPanel : p));
        }
        setEditingPanel(null);
        setIsCreating(false);
    };

    const handleAddNew = () => {
        setIsCreating(true);
        setEditingPanel({
            id: `panel_${Date.now()}`,
            channel: 'tickets',
            title: 'Create a Support Ticket',
            description: 'Click the button below to open a ticket and our support team will assist you shortly.',
            buttonText: 'Open Ticket',
            buttonEmoji: '🎟️',
            category: 'Support Tickets',
            supportRoles: ['Support Team'],
            welcomeMessage: 'Welcome {user}! Please describe your issue, and a staff member will be with you soon.'
        });
    };
    
    const handleDeletePanel = (panelId: string) => {
        updateConfigValue(['features', 'ticketSystem', 'panels'], ticketConfig.panels.filter(p => p.id !== panelId));
    };

    const updateEditingPanel = (field: keyof Omit<TicketPanel, 'id' | 'supportRoles'>, value: string) => {
        if (!editingPanel) return;
        setEditingPanel({ ...editingPanel, [field]: value });
    };

    const [roleInput, setRoleInput] = useState('');
    const addSupportRole = () => {
        if (editingPanel && roleInput.trim() && !editingPanel.supportRoles.includes(roleInput.trim())) {
            setEditingPanel({ ...editingPanel, supportRoles: [...editingPanel.supportRoles, roleInput.trim()] });
            setRoleInput('');
        }
    };
    const removeSupportRole = (role: string) => {
        if (editingPanel) {
            setEditingPanel({ ...editingPanel, supportRoles: editingPanel.supportRoles.filter(r => r !== role) });
        }
    };
    
    if (editingPanel) {
        const availableRoles = config.syncedRoles?.filter(r => !editingPanel.supportRoles.includes(r)) || [];
        return (
            <Section title={isCreating ? "Create New Ticket Panel" : "Edit Ticket Panel"}>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <SelectInput label="Panel Channel" value={editingPanel.channel} onChange={v => updateEditingPanel('channel', v)} options={config.syncedChannels || []} placeholder="Sync to select..." />
                    <p className="text-xs text-gray-500 -mt-3">The channel where the 'Create Ticket' button will be posted.</p>
                    <TextInput label="Embed Title" value={editingPanel.title} onChange={v => updateEditingPanel('title', v)} />
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Embed Description</label>
                        <textarea value={editingPanel.description} onChange={e => updateEditingPanel('description', e.target.value)} rows={3} className="w-full bg-gray-700 p-2 rounded-md" />
                    </div>
                    <div className="flex gap-2">
                        <TextInput label="Button Text" value={editingPanel.buttonText} onChange={v => updateEditingPanel('buttonText', v)} />
                        <TextInput label="Button Emoji (Optional)" value={editingPanel.buttonEmoji} onChange={v => updateEditingPanel('buttonEmoji', v)} />
                    </div>
                    <TextInput label="Ticket Category" value={editingPanel.category} onChange={v => updateEditingPanel('category', v)} placeholder="Support Tickets" />
                    <p className="text-xs text-gray-500 -mt-3">New ticket channels will be created under this category.</p>
                    <div>
                        <h3 className="text-md font-medium text-gray-300 mb-2">Support Roles</h3>
                        <p className="text-xs text-gray-500 mb-2">These roles will have access to view and respond to tickets.</p>
                        <div className="space-y-2 mb-2">
                            {editingPanel.supportRoles.map(role => (
                                <div key={role} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-md">
                                    <span className="text-gray-300">{role}</span>
                                    <button onClick={() => removeSupportRole(role)} className="text-red-400 hover:text-red-300 text-lg font-bold">×</button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <select value={roleInput} onChange={e => setRoleInput(e.target.value)} className="flex-1 bg-gray-700 p-2 rounded-md outline-none">
                                <option value="">Select a role to add...</option>
                                {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <button onClick={addSupportRole} disabled={!roleInput} className="px-4 bg-primary rounded-md hover:bg-primary-hover text-sm font-semibold disabled:opacity-50">Add Role</button>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Welcome Message in Ticket</label>
                        <textarea value={editingPanel.welcomeMessage} onChange={e => updateEditingPanel('welcomeMessage', e.target.value)} rows={3} className="w-full bg-gray-700 p-2 rounded-md" />
                         <p className="text-xs text-gray-500 mt-1">This message is sent in the new ticket channel. Use {'{user}'} for the user mention.</p>
                    </div>
                </div>
                 <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-700">
                    <button onClick={() => setEditingPanel(null)} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition">Cancel</button>
                    <button onClick={handleSavePanel} className="px-4 py-2 bg-primary rounded-md hover:bg-primary-hover transition">Save Panel</button>
                </div>
            </Section>
        );
    }
    
    return (
        <div className="space-y-6">
            <Section title="Ticket System">
                <p className="text-sm text-gray-400 -mt-2 mb-4">A complete support ticket system. Users can open tickets, and staff can respond in private channels.</p>
                <Toggle label="Enable Ticket System" enabled={ticketConfig.enabled} onChange={v => updateConfigValue(['features', 'ticketSystem', 'enabled'], v)} />
                {ticketConfig.enabled && <div className="space-y-4 animate-fade-in">
                    <p className="text-sm text-gray-400">Create panels with buttons that users can click to open a support ticket.</p>
                    <CommandExampleUI
                        command="!setup_tickets"
                        description="Admin command to post all configured ticket panels."
                        responseTitle="✅ Success"
                        responseBody={<p className="text-gray-300">Ticket panels have been posted.</p>}
                    />
                    <CommandExampleUI
                        command="!close"
                        description="Closes the ticket channel it's used in."
                        responseTitle="Closing ticket..."
                        responseBody={<p className="text-gray-300">This ticket will be closed and archived in 5 seconds.</p>}
                    />
                    <h3 className="text-lg font-bold pt-4 border-t border-gray-600">Global Settings</h3>
                    <Toggle label="Save Transcripts on Close" enabled={ticketConfig.transcripts} onChange={v => updateConfigValue(['features', 'ticketSystem', 'transcripts'], v)} />
                    {ticketConfig.transcripts && <SelectInput label="Transcript Channel" value={ticketConfig.transcriptChannel} onChange={v => updateConfigValue(['features', 'ticketSystem', 'transcriptChannel'], v)} options={config.syncedChannels || []} placeholder="Sync channels to select..." />}
                </div>}
            </Section>
             {ticketConfig.enabled && (
                <Section title="Ticket Panels">
                     <p className="text-sm text-gray-400 -mt-2 mb-4">Each panel is a message with a button that creates a different type of ticket.</p>
                    <div className="space-y-3 mb-4">
                        {ticketConfig.panels.map(panel => (
                            <div key={panel.id} className="bg-gray-700/50 p-3 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-200">{panel.title}</p>
                                    <p className="text-sm text-gray-400">Channel: <span className="font-mono text-primary">#{panel.channel}</span> | Button: <span className="font-mono text-primary">{panel.buttonText}</span></p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setIsCreating(false); setEditingPanel(panel); }} className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 rounded-md">Edit</button>
                                    <button onClick={() => handleDeletePanel(panel.id)} className="px-3 py-1 text-sm bg-red-600/50 hover:bg-red-600 rounded-md">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAddNew} className="w-full py-2 bg-primary rounded-md hover:bg-primary-hover font-semibold">+ Add New Panel</button>
                </Section>
            )}
        </div>
    );
};

const SocialFeedsSettings: React.FC<{ config: BotConfig, updateConfigValue: (p: string[], v: any) => void }> = ({ config, updateConfigValue }) => {
    const [newFeed, setNewFeed] = useState<Omit<SocialFeed, 'id'>>({ platform: 'youtube', username: '', discordChannel: 'general' });

    const addFeed = () => {
        if (newFeed.username.trim() && newFeed.discordChannel.trim()) {
            const feed: SocialFeed = { ...newFeed, id: `feed_${Date.now()}` };
            updateConfigValue(['features', 'socialFeeds'], [...config.features.socialFeeds, feed]);
            setNewFeed({ platform: 'youtube', username: '', discordChannel: 'general' });
        }
    };
    const removeFeed = (id: string) => {
        updateConfigValue(['features', 'socialFeeds'], config.features.socialFeeds.filter(f => f.id !== id));
    };

    return (
        <Section title="Social Media Notifications">
            <p className="text-sm text-gray-400 -mt-2 mb-4">Automatically post a notification to a Discord channel when you go live on Twitch or upload a new YouTube video.</p>
            <div className="space-y-2 mb-4">
                {config.features.socialFeeds.map(feed => (
                    <div key={feed.id} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-md">
                        <span className="text-gray-300 text-sm capitalize">{feed.platform}: <span className="text-primary">{feed.username}</span> &rarr; <span className="text-purple-400">#{feed.discordChannel}</span></span>
                         <button onClick={() => removeFeed(feed.id)} className="text-red-400 hover:text-red-300 text-lg font-bold">×</button>
                    </div>
                ))}
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <select value={newFeed.platform} onChange={e => setNewFeed({...newFeed, platform: e.target.value as SocialFeed['platform']})} className="w-full bg-gray-700 p-2 rounded-md focus:ring-2 focus:ring-primary outline-none appearance-none">
                    <option value="youtube">YouTube</option>
                    <option value="twitch">Twitch</option>
                    <option value="twitter">Twitter/X</option>
                </select>
                <input type="text" placeholder="Username/Channel ID" value={newFeed.username} onChange={e => setNewFeed({...newFeed, username: e.target.value})} className="bg-gray-700 p-2 rounded-md" />
                <SelectInput label="" value={newFeed.discordChannel} onChange={v => setNewFeed({...newFeed, discordChannel: v})} options={config.syncedChannels || []} placeholder="Sync to select..." />
            </div>
            <button onClick={addFeed} className="w-full py-2 bg-primary rounded-md hover:bg-primary-hover font-semibold mt-2">Add Notification</button>
        </Section>
    );
};

const CustomStatusSettings: React.FC<{ config: BotConfig, updateConfigValue: (p: string[], v: any) => void }> = ({ config, updateConfigValue }) => (
    <Section title="Custom Bot Status">
        <p className="text-sm text-gray-400 -mt-2 mb-4">Change the "Playing", "Watching", or "Listening to" status that appears under your bot's name.</p>
        <Toggle label="Enable Custom Status" enabled={config.status.enabled} onChange={v => updateConfigValue(['status', 'enabled'], v)} />
        {config.status.enabled && <div className="space-y-4 animate-fade-in">
            <div className="flex gap-2">
                <select value={config.status.activityType} onChange={e => updateConfigValue(['status', 'activityType'], e.target.value)} className="bg-gray-700 p-2 rounded-md appearance-none">
                    <option value="playing">Playing</option>
                    <option value="watching">Watching</option>
                    <option value="listening">Listening to</option>
                    <option value="competing">Competing in</option>
                </select>
                <input type="text" placeholder="your status message" value={config.status.text} onChange={e => updateConfigValue(['status', 'text'], e.target.value)} className="flex-1 bg-gray-700 p-2 rounded-md" />
            </div>
        </div>}
    </Section>
);

const EmbedBuilderUI: React.FC<{ config: BotConfig, updateConfigValue: (p: string[], v: any) => void }> = ({ config, updateConfigValue }) => {
    const [selectedEmbedId, setSelectedEmbedId] = useState<string | null>(config.embeds[0]?.id || null);
    
    const selectedEmbed = useMemo(() => config.embeds.find(e => e.id === selectedEmbedId), [config.embeds, selectedEmbedId]);

    const createEmbed = () => {
        const newEmbed: Embed = {
            id: `embed_${Date.now()}`, name: `New Embed ${config.embeds.length + 1}`, title: '', description: '',
            color: '#3b82f6', footer: '', fields: []
        };
        updateConfigValue(['embeds'], [...config.embeds, newEmbed]);
        setSelectedEmbedId(newEmbed.id);
    };

    const updateSelectedEmbed = (key: keyof Omit<Embed, 'id' | 'fields'>, value: any) => {
        if (!selectedEmbed) return;
        const newEmbeds = config.embeds.map(e => e.id === selectedEmbedId ? { ...e, [key]: value } : e);
        updateConfigValue(['embeds'], newEmbeds);
    };

    const addField = () => {
        if (!selectedEmbed) return;
        const newField: EmbedField = { id: `field_${Date.now()}`, name: 'Field Name', value: 'Field Value', inline: false };
        const newEmbeds = config.embeds.map(e => e.id === selectedEmbedId ? { ...e, fields: [...e.fields, newField] } : e);
        updateConfigValue(['embeds'], newEmbeds);
    };

    const updateField = (fieldId: string, key: keyof Omit<EmbedField, 'id'>, value: any) => {
        if (!selectedEmbed) return;
        const newFields = selectedEmbed.fields.map(f => f.id === fieldId ? { ...f, [key]: value } : f);
        const newEmbeds = config.embeds.map(e => e.id === selectedEmbedId ? { ...e, fields: newFields } : e);
        updateConfigValue(['embeds'], newEmbeds);
    };

    const removeField = (fieldId: string) => {
        if (!selectedEmbed) return;
        const newFields = selectedEmbed.fields.filter(f => f.id !== fieldId);
        const newEmbeds = config.embeds.map(e => e.id === selectedEmbedId ? { ...e, fields: newFields } : e);
        updateConfigValue(['embeds'], newEmbeds);
    };

    return (
        <Section title="Embed Builder">
            <p className="text-sm text-gray-400 -mt-2 mb-4">Design rich, colorful, and formatted messages (called embeds) to use in announcements or command responses.</p>
            <div className="flex flex-col lg:flex-row gap-6 lg:h-[65vh]">
                <div className="lg:w-1/3 flex flex-col">
                    <button onClick={createEmbed} className="w-full py-2 mb-2 bg-primary rounded-md font-semibold hover:bg-primary-hover">+ New Embed</button>
                    <div className="bg-gray-900/50 rounded-md p-2 flex-grow overflow-y-auto max-h-40 lg:max-h-full">
                        {config.embeds.map(embed => (
                            <button key={embed.id} onClick={() => setSelectedEmbedId(embed.id)} className={`w-full text-left p-2 rounded-md text-sm ${selectedEmbedId === embed.id ? 'bg-primary/50' : 'hover:bg-gray-700'}`}>{embed.name}</button>
                        ))}
                    </div>
                </div>
                <div className="lg:w-2/3 flex flex-col lg:flex-row gap-4">
                    <div className="lg:w-1/2 flex-shrink-0 space-y-3 overflow-y-auto pr-2 max-h-96 lg:max-h-full">
                        {selectedEmbed ? <>
                            <TextInput label="Embed Name" value={selectedEmbed.name} onChange={v => updateSelectedEmbed('name', v)} />
                             <p className="text-xs text-gray-500 -mt-3">A name for you to identify this embed.</p>
                            <TextInput label="Title" value={selectedEmbed.title} onChange={v => updateSelectedEmbed('title', v)} />
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea value={selectedEmbed.description} onChange={e => updateSelectedEmbed('description', e.target.value)} rows={4} className="w-full bg-gray-700 p-2 rounded-md text-sm"/>
                            </div>
                            <label className="flex justify-between items-center text-sm">Color <input type="color" value={selectedEmbed.color} onChange={e => updateSelectedEmbed('color', e.target.value)} className="bg-gray-800"/></label>
                            <TextInput label="Footer Text" value={selectedEmbed.footer} onChange={v => updateSelectedEmbed('footer', v)} />
                            <h3 className="text-md font-bold pt-2 border-t border-gray-600">Fields</h3>
                            {selectedEmbed.fields.map(field => (
                                <div key={field.id} className="bg-gray-700/50 p-2 rounded-md space-y-2">
                                    <input type="text" placeholder="Field Name" value={field.name} onChange={e => updateField(field.id, 'name', e.target.value)} className="w-full bg-gray-600 p-1 rounded-sm text-xs"/>
                                    <input type="text" placeholder="Field Value" value={field.value} onChange={e => updateField(field.id, 'value', e.target.value)} className="w-full bg-gray-600 p-1 rounded-sm text-xs"/>
                                    <div className="flex justify-between items-center">
                                        <label className="flex items-center space-x-2 text-sm text-gray-300">
                                            <input type="checkbox" checked={field.inline} onChange={e => updateField(field.id, 'inline', e.target.checked)} className="form-checkbox h-4 w-4 rounded bg-gray-800 border-gray-600 text-primary focus:ring-primary"/>
                                            <span>Inline</span>
                                        </label>
                                        <button onClick={() => removeField(field.id)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={addField} className="w-full py-1 text-sm bg-gray-600 rounded-md hover:bg-gray-500">+ Add Field</button>
                        </> : <p className="text-gray-500">Select or create an embed to start.</p>}
                    </div>
                    <div className="lg:w-1/2 bg-[#313338] p-4 rounded-lg flex-shrink-0">
                       <p className="text-xs text-gray-400 mb-2">Live Preview</p>
                       {selectedEmbed && <div style={{borderColor: selectedEmbed.color}} className="bg-[#2B2D31] border-l-4 rounded p-3 text-sm text-gray-300">
                           {selectedEmbed.title && <p className="font-bold text-white mb-1">{selectedEmbed.title}</p>}
                           {selectedEmbed.description && <p className="text-xs whitespace-pre-wrap">{selectedEmbed.description}</p>}
                           <div className={`grid mt-2 ${selectedEmbed.fields.some(f=>f.inline) ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2' : 'gap-2'}`}>
                                {selectedEmbed.fields.map(field => <div key={field.id} className={`${field.inline ? '' : 'col-span-full'}`}>
                                    <p className="font-bold text-white text-xs">{field.name}</p>
                                    <p className="text-xs">{field.value}</p>
                                </div>)}
                           </div>
                           {selectedEmbed.footer && <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700/50">{selectedEmbed.footer}</p>}
                       </div>}
                    </div>
                </div>
            </div>
        </Section>
    )
}

export const BotBuilderPage: React.FC<{ project: Project | null }> = ({ project }) => {
  const context = useContext(AppContext);
  const [config, setConfig] = useState<BotConfig | null>(project?.config as BotConfig || null);
  const [activeFeature, setActiveFeature] = useState('Core Configuration');
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isGalleryOpen, setGalleryOpen] = useState(false);
  const [galleryContext, setGalleryContext] = useState<'avatar' | 'banner' | null>(null);

  useEffect(() => {
    if (project) {
        setConfig(project.config as BotConfig);
    }
  }, [project]);
  
  const updateConfigValue = (path: (string|number)[], value: any) => {
    if (!config || !project) return;

    let newConfig = JSON.parse(JSON.stringify(config)); // Deep copy
    let current: any = newConfig;

    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    
    setConfig(newConfig);
    context?.updateProjectConfig(project.id, newConfig);
  };
  
  const handleManageHosting = () => {
    if (!context || !context.user || !config) return;
    setIsDeploymentModalOpen(true);
  };

  const openGallery = (context: 'avatar' | 'banner') => {
      setGalleryContext(context);
      setGalleryOpen(true);
  };

  const handleImageSelect = (imageUrl: string) => {
      if (galleryContext === 'avatar') {
          updateConfigValue(['avatarUrl'], imageUrl);
      } else if (galleryContext === 'banner') {
          updateConfigValue(['bannerUrl'], imageUrl);
      }
      setGalleryOpen(false);
      setGalleryContext(null);
  };

  const renderFeatureUI = () => {
    if (!config || !project) return null;
    const isProOrHigher = context?.user?.plan === 'Pro' || context?.user?.plan === 'Enterprise';
    
    if (activeFeature === 'Deployment') {
      return (
        <Section title="Bot Deployment">
          <p className="text-sm text-gray-400 -mt-2 mb-4">Deploy your bot, manage its status, and get the code needed to run it yourself.</p>
           <div className="bg-gray-700/50 p-4 rounded-lg text-center">
              <p className="font-semibold text-lg">Current Status: <span className={`capitalize ${project?.hostingStatus === 'online' ? 'text-green-400' : project?.hostingStatus === 'deploying' ? 'text-yellow-400' : 'text-gray-400'}`}>{project?.hostingStatus}</span></p>
              {project?.botInviteUrl && project.hostingStatus === 'online' && (
                <div className="mt-4">
                  <p className="text-gray-300">Your bot is deployed! Use this link to invite it:</p>
                  <a href={project.botInviteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{project.botInviteUrl}</a>
                </div>
              )}
              <button onClick={handleManageHosting} className="mt-6 px-8 py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-transform transform hover:scale-105">
                 {project?.hostingStatus === 'online' || project?.hostingStatus === 'offline' ? 'Manage Deployment' : 'Deploy Bot'}
              </button>
           </div>
        </Section>
      )
    }

    if (activeFeature === 'Embed Builder' && context?.maintenanceFlags['Embed Builder']) {
        return <MaintenanceNotice featureName="Embed Builder" />;
    }

    const featureComponentMap: { [key: string]: React.ReactNode } = {
        'Core Configuration': <CoreSettings config={config} updateConfigValue={updateConfigValue} projectId={project.id} openGallery={openGallery} />,
        'Custom Commands': <CustomCommandsSettings config={config} updateConfigValue={updateConfigValue} />,
        'Welcome Messages': <WelcomerSettings config={config} updateConfigValue={updateConfigValue} />,
        'Moderation Commands': <ModerationSettings config={config} updateConfigValue={updateConfigValue} />,
        'Auto-Moderation': <AutoModerationSettings config={config} updateConfigValue={updateConfigValue} />,
        'Leveling System': <LevelingSettings config={config} updateConfigValue={updateConfigValue} />,
        'Reaction Roles': <ReactionRolesSettings config={config} updateConfigValue={updateConfigValue} />,
        'Tickets': <TicketSettings config={config} updateConfigValue={updateConfigValue} />,
        'Social Media Notifications': <SocialFeedsSettings config={config} updateConfigValue={updateConfigValue} />,
        'Custom Status': isProOrHigher ? <CustomStatusSettings config={config} updateConfigValue={updateConfigValue} /> : <PremiumFeatureLock />,
        'Embed Builder': <EmbedBuilderUI config={config} updateConfigValue={updateConfigValue} />,
        'Image Scraper': <Section title="Image Scraper"><Toggle label="Enable Image Scraper" enabled={config.features.imageScraper} onChange={v => updateConfigValue(['features', 'imageScraper'], v)}/><CommandExampleUI command="!grabimages <url>" description="Scrapes images from a bbdbuy.com link." responseTitle="Found 8 images" responseBody={<p>Posting images now...</p>} /></Section>,
    };

    const component = featureComponentMap[activeFeature];
    if (component) return component;

    const allFeatures = Object.values(featuresConfig).flat();
    const featureData = allFeatures.find(f => f.name === activeFeature);

    if (featureData?.premium && !isProOrHigher) {
        return <PremiumFeatureLock />;
    }

    return <FeaturePlaceholder featureName={activeFeature} />;
  };

  if (!project || !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No project selected. <button onClick={() => context?.navigate(Page.DASHBOARD)} className="text-blue-500 hover:underline">Go to Dashboard</button></p>
      </div>
    );
  }

  const sidebarContent = (
    <aside className="w-64 bg-gray-800 p-4 border-r border-gray-700 overflow-y-auto">
      {Object.entries(featuresConfig).map(([category, features]) => (
        <div key={category}>
          <h3 className="text-xs uppercase text-gray-500 font-bold mt-4 mb-2 px-2">{category}</h3>
          {features.map(feature => {
              const isLocked = feature.premium && (context?.user?.plan !== 'Pro' && context?.user?.plan !== 'Enterprise');
              return (
                <button 
                  key={feature.name} 
                  onClick={() => {
                      if (!isLocked) {
                          setActiveFeature(feature.name);
                          setSidebarOpen(false); // Close sidebar on selection in mobile
                      }
                  }}
                  className={`w-full text-left p-2 rounded-md transition-colors text-sm font-medium flex items-center justify-between ${activeFeature === feature.name && !isLocked ? 'bg-primary text-white' : 'hover:bg-gray-700/50 text-gray-300'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isLocked ? "Upgrade to Pro to use this feature" : ""}
                >
                  {feature.name}
                  {isLocked && <LockIcon />}
                </button>
              )
          })}
        </div>
      ))}
    </aside>
  );

  const getButtonText = () => {
    switch (project.hostingStatus) {
        case 'online': return 'Manage Deployment';
        case 'deploying': return 'Deploying...';
        default: return 'Deploy';
    }
  };

  const isButtonDisabled = project.hostingStatus === 'deploying';

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200">
      <header className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700 flex-shrink-0 z-20">
        <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 rounded-md hover:bg-gray-700">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>
            <h1 className="text-xl font-bold truncate">Bot Builder: <span className="text-primary">{project.name}</span></h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => context?.navigate(Page.DASHBOARD)} className="hidden sm:block px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 transition">
            Dashboard
          </button>
          <button onClick={handleManageHosting} disabled={isButtonDisabled} className="px-3 sm:px-5 py-2 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-transform transform hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
            {getButtonText()}
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar */}
        <div className={`fixed lg:hidden top-0 left-0 h-full z-30 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
             {sidebarContent}
        </div>
        {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed lg:hidden inset-0 bg-black/50 z-20"></div>}

        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-shrink-0">
            {sidebarContent}
        </div>
        
        <main className="flex-1 p-4 sm:p-6 bg-gray-900 overflow-y-auto">
          {renderFeatureUI()}
        </main>
      </div>
      {isDeploymentModalOpen && <DeploymentModal project={project} onClose={() => setIsDeploymentModalOpen(false)} />}
      {isGalleryOpen && <ImageGalleryModal onSelect={handleImageSelect} onClose={() => setGalleryOpen(false)} />}
      {context?.featureFlags.supportSystem && <SupportWidget />}
    </div>
  );
};