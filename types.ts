
export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  banner?: string;
  subscribers: string[]; // array of user IDs
  subscriptions: string[]; // array of user IDs
  isPartner?: boolean; // Status partenaire
  revenue?: number; // Solde actuel
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  text: string;
  timestamp: number;
  likes: number;
}

export interface VideoAnalytics {
  retentionCurve: number[]; // Pourcentages de rétention à intervalle régulier (ex: 0%, 10%, 20%...)
  viewsByCountry: { code: string; country: string; value: number }[];
  trafficSources: { source: string; value: number }[];
  demographics: { ageRange: string; percentage: number }[];
}

export interface Video {
  id: string;
  uploaderId: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  views: number;
  likes: string[]; // array of user IDs
  dislikes: string[]; // array of user IDs
  timestamp: number;
  category: string;
  duration: string;
  estimatedRevenue?: number; // Revenu généré par la vidéo
  analytics?: VideoAnalytics; // Données détaillées
}

export enum VideoCategory {
  ALL = 'Tout',
  GAMING = 'Gaming',
  MUSIC = 'Musique',
  TECH = 'Tech',
  SPORTS = 'Sports',
  EDUCATION = 'Éducation',
  COMEDY = 'Humour'
}

export type ViewState = 
  | { name: 'HOME' }
  | { name: 'WATCH'; videoId: string }
  | { name: 'PROFILE'; userId: string }
  | { name: 'UPLOAD' }
  | { name: 'LOGIN' }
  | { name: 'SIGNUP' }
  | { name: 'SEARCH'; query: string }
  | { name: 'DASHBOARD' }
  | { name: 'MONETIZATION' }
  | { name: 'DOWNLOAD' }
  | { name: 'SHORTS' };