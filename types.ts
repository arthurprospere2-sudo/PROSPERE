
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
  | { name: 'MONETIZATION' };
