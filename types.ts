
export enum Page {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  BOT_BUILDER = 'BOT_BUILDER',
  WEBSITE_BUILDER = 'WEBSITE_BUILDER',
  ADMIN_PANEL = 'ADMIN_PANEL',
  SETTINGS = 'SETTINGS',
  CODE_EDITOR = 'CODE_EDITOR',
  MARKETPLACE = 'MARKETPLACE',
}

export type Plan = 'Free' | 'Hobby' | 'Pro' | 'Enterprise';
export type UserRole = 'user' | 'admin' | 'owner';

export interface User {
  id: string;
  username: string;
  email: string;
  password:string;
  role: UserRole;
  plan: Plan;
  ip: string;
  apiKey: string | null;
}

export interface SupportTicket {
  id: string;
  userId: string;
  username: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: Date;
}

export type ProjectType = 'bot' | 'website' | 'code';

export interface Project {
  id:string;
  name: string;
  type: ProjectType;
  createdAt: Date;
  config: BotConfig | WebsiteConfig | CodeConfig;
  hostingStatus: 'undeployed' | 'deploying' | 'online' | 'offline';
  liveUrl: string | null;
  botInviteUrl?: string;
  ownerId?: string; // To link project to user in admin panel
  ownerUsername?: string;
}

export interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
}

// Discord Bot Types
export interface CustomCommand {
  id: string;
  trigger: string;
  response: string;
}

export interface RoleReward { id: string; level: number; roleName: string; }
export interface ReactionRoleConfig { id: string; messageId: string; emoji: string; roleName: string; }
export interface SocialFeed { id: string; platform: 'youtube' | 'twitch' | 'twitter'; username: string; discordChannel: string; }
export interface EmbedField { id: string; name: string; value: string; inline: boolean; }
export interface Embed { id:string; name: string; title: string; description: string; color: string; footer: string; fields: EmbedField[]; }
export interface CustomEvent { id: string; event: string; actions: { type: string, params: any }[]; } // Simplified actions

export interface TicketPanel {
  id: string;
  channel: string;
  title: string;
  description: string;
  buttonText: string;
  buttonEmoji: string;
  category: string;
  supportRoles: string[];
  welcomeMessage: string;
}

export interface BotConfig {
  token: string;
  clientId: string;
  avatarUrl: string;
  bannerUrl: string;
  scraperEndpoint: string;
  status: {
    enabled: boolean;
    activityType: 'playing' | 'watching' | 'listening' | 'competing';
    text: string;
  };
  features: {
    welcomeMessage: {
      enabled: boolean;
      channel: string;
      message: string;
      sendCard: boolean;
      cardConfig: {
        backgroundColor: string;
        textColor: string;
        title: string;
      };
      leaveMessage: {
        enabled: boolean;
        channel: string;
        message: string;
      };
      joinRoles: string[];
    };
    moderation: {
      enabled: boolean;
      adminRole: string;
      autoModeration: {
        enabled: boolean;
        bannedWords: string[];
        antiSpam: boolean;
        antiLink: boolean;
      }
    };
    ticketSystem: {
      enabled: boolean;
      transcripts: boolean;
      transcriptChannel: string;
      panels: TicketPanel[];
    };
    imageScraper: boolean;
    logging: {
        enabled: boolean;
        channel: string;
    };
    leveling: {
      enabled: boolean;
      levelUpMessage: string;
      roleRewards: RoleReward[];
      voiceXpRate: number;
      cardConfig: {
          backgroundColor: string;
          textColor: string;
          barColor: string;
      }
    };
    reactionRoles: {
      enabled: boolean;
      configs: ReactionRoleConfig[];
    };
    music: {
      enabled: boolean;
      djRole: string;
    };
    socialFeeds: SocialFeed[];
    birthdays: {
      enabled: boolean;
      channel: string;
      wishMessage: string;
    };
    polls: {
      enabled: boolean;
    };
    suggestions: {
        enabled: boolean;
        channel: string;
        upvoteEmoji: string;
        downvoteEmoji: string;
    };
    starboard: {
        enabled: boolean;
        channel: string;
        starEmoji: string;
        starCount: number;
    };
    counting: { enabled: boolean; channel: string; };
    chatGPT: { enabled: boolean; openAIApiKey: string; };
    imageGeneration: { enabled: boolean; };
    modmail: { enabled: boolean; category: string; modRole: string; };
    verification: { enabled: boolean; channel: string; verifiedRole: string; };
    autoReact: { enabled: boolean; configs: { id: string, channel: string; emojis: string[] }[]; };
    globalChat: { enabled: boolean; channel: string; };
    robloxVerification: { enabled: boolean; };
    tempVoiceChannels: { enabled: boolean; category: string; };
    mediaChannels: { enabled: boolean; channels: string[]; };
    inviteTracker: { enabled: boolean; };
    stickyRoles: { enabled: boolean; };
    statisticChannels: { enabled: boolean; };
    qotd: { enabled: boolean; channel: string; role: string; };
    translation: { enabled: boolean; };
    emojiManager: { enabled: boolean; };
    stickyMessages: { enabled: boolean; configs: { id: string, channel: string; message: string; }[] };
    webhooks: { enabled: boolean; hooks: { id: string; name: string; url: string; }[]; };
    ifttt: { enabled: boolean; key: string; };
  };
  customCommands: CustomCommand[];
  customEvents: CustomEvent[];
  embeds: Embed[];
  syncedChannels?: string[];
  syncedRoles?: string[];
}


// Website Builder Types
export interface WebsiteCategory {
  id: string;
  name: string;
}

export interface WebsiteSubCategory {
  id: string;
  name: string;
  parentId: string; // ID of the parent WebsiteCategory
}

export interface ProductVariant {
  id: string;
  type: string; // e.g., 'Size', 'Color'
  options: string[]; // e.g., ['S', 'M', 'L'], ['Red', 'Blue']
}

export interface WebsiteProduct {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  description: string;
  productType: 'physical' | 'digital';
  categoryId?: string;
  subcategoryId?: string;
  variants?: ProductVariant[];
}

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  createdAt: Date;
  customerEmail: string;
  items: WebsiteProduct[];
  total: number;
  shippingAddress?: ShippingAddress;
}

export interface SectionConfig {
    enabled: boolean;
    order: number;
}
export interface HeroSectionConfig extends SectionConfig { title: string; subtitle: string; cta: string; }
export interface ProductsSectionConfig extends SectionConfig { title: string; }
export interface AboutSectionConfig extends SectionConfig { title: string; content: string; }
export interface ContactSectionConfig extends SectionConfig { title: string; email: string; phone: string; }
export interface FooterSectionConfig extends SectionConfig { text: string; }


export interface WebsiteSections {
  hero: HeroSectionConfig;
  products: ProductsSectionConfig;
  about: AboutSectionConfig;
  contact: ContactSectionConfig;
  footer: FooterSectionConfig;
}

export interface WebsitePage {
  id: string;
  title: string;
  path: string;
  sections: WebsiteSections;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
}
export interface ShippingOption {
    id: string;
    name: string;
    price: number;
}

export interface WebsiteConfig {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    font: string;
  };
  template: 'modern' | 'minimalist' | 'bold';
  productPageLayout: 'image-left' | 'image-top';
  seo: {
    metaTitle: string;
    metaDescription: string;
    faviconUrl: string;
  };
  domain: {
    customDomain: string;
    status: 'unlinked' | 'pending' | 'linked' | 'error';
  };
  pages: WebsitePage[];
  products: WebsiteProduct[];
  categories: WebsiteCategory[];
  subcategories: WebsiteSubCategory[];
  ecommerce: {
    enabled: boolean;
    stripePublicKey: string;
    stripeSecretKey: string;
    enabledGateways: {
        stripe: boolean;
        paypal: boolean;
        crypto: boolean;
    };
    cart: {
      enabled: boolean;
    };
    discounts: DiscountCode[];
    shippingOptions: ShippingOption[];
  };
  orders: Order[];
  analytics: { // Mock analytics data
    totalVisits: number;
    uniqueVisitors: number;
    pageViews: Record<string, number>;
    referrers: Record<string, number>;
  },
  customHtml: string;
  customCss: string;
  customJs: string;
}

export interface WebsiteTemplate {
    id: string;
    name: string;
    description: string;
    previewImageUrl: string;
    tags: string[];
    config: WebsiteConfig;
}

// Code Editor Types
export interface CodeConfig {
    html: string;
    css: string;
    js: string;
}

export interface AppContextType {
  user: User | null;
  users: User[];
  projects: Project[];
  supportTickets: SupportTicket[];
  bannedIPs: string[];
  logs: SystemLog[];
  selectedProject: Project | null;
  featureFlags: { [key: string]: boolean };
  maintenanceFlags: { [key: string]: boolean };
  announcement: { message: string, active: boolean };
  newProjectName: string | null;
  customImages: string[];
  customTemplates: WebsiteTemplate[];
  login: (username: string, email: string, password: string, plan?: Plan) => void;
  logout: () => void;
  updateUser: (userId: string, updates: Partial<Pick<User, 'username' | 'email' | 'password'>>) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'hostingStatus' | 'liveUrl'>) => void;
  updateProjectName: (projectId: string, newName: string) => void;
  duplicateProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  updateProjectConfig: (projectId: string, newConfig: BotConfig | WebsiteConfig | CodeConfig) => void;
  updateProjectHosting: (projectId: string, status: Project['hostingStatus'], url?: string | null, botInviteUrl?: string) => void;
  viewProject: (projectId: string) => void;
  navigate: (page: Page) => void;
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'userId' | 'username' | 'status'>) => void;
  resolveSupportTicket: (ticketId: string) => void;
  setUserPlan: (userId: string, plan: Plan) => void;
  upgradePlan: (plan: Plan, cycle?: 'monthly' | 'yearly') => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  banUserIP: (ip: string) => void;
  unbanUserIP: (ip: string) => void;
  generateUserApiKey: (userId: string) => void;
  revokeUserApiKey: (userId: string) => void;
  toggleFeatureFlag: (feature: string) => void;
  toggleMaintenanceFlag: (feature: string) => void;
  setAnnouncement: (message: string, active: boolean) => void;
  setNewProjectName: (name: string | null) => void;
  syncBotData: (projectId: string, data: { channels: string[], roles: string[] }) => void;
  addCustomImage: (imageDataUrl: string) => void;
  addCustomTemplate: (template: WebsiteTemplate) => void;
}
