
import { Video, User, Comment, VideoCategory } from './types';

export const CURRENT_USER_ID = 'user_1';

export const MOCK_USERS: User[] = [
  {
    id: 'user_1',
    username: 'NeoUser',
    email: 'user@neotube.com',
    avatar: 'https://picsum.photos/id/64/200/200',
    banner: 'https://picsum.photos/id/180/1200/300',
    subscribers: [],
    subscriptions: ['user_2'],
    isPartner: true,
    revenue: 1250.45
  },
  {
    id: 'user_2',
    username: 'TechMaster',
    email: 'tech@master.com',
    avatar: 'https://picsum.photos/id/2/200/200',
    banner: 'https://picsum.photos/id/20/1200/300',
    subscribers: ['user_1'],
    subscriptions: [],
    isPartner: true,
    revenue: 4500.00
  },
  {
    id: 'user_3',
    username: 'GamerPro',
    email: 'gamer@pro.com',
    avatar: 'https://picsum.photos/id/3/200/200',
    banner: 'https://picsum.photos/id/45/1200/300',
    subscribers: [],
    subscriptions: [],
    isPartner: false,
    revenue: 0
  }
];

// Using Big Buck Bunny and generic clips for functional playback demo
export const MOCK_VIDEOS: Video[] = [
  {
    id: 'vid_1',
    uploaderId: 'user_2',
    title: 'Le Futur de la Technologie en 2025',
    description: 'Découvrez les innovations incroyables qui nous attendent. IA, Quantique, et plus encore !',
    thumbnail: 'https://picsum.photos/id/1/640/360',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    views: 12543,
    likes: ['user_1', 'user_3'],
    dislikes: [],
    timestamp: Date.now() - 86400000,
    category: VideoCategory.TECH,
    duration: '10:34'
  },
  {
    id: 'vid_2',
    uploaderId: 'user_3',
    title: 'Gameplay Exclusif: Cyber Adventure',
    description: 'On teste le nouveau jeu du moment en ultra settings.',
    thumbnail: 'https://picsum.photos/id/96/640/360',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    views: 8420,
    likes: [],
    dislikes: [],
    timestamp: Date.now() - 172800000,
    category: VideoCategory.GAMING,
    duration: '24:12'
  },
  {
    id: 'vid_3',
    uploaderId: 'user_2',
    title: 'Tutoriel React 18 pour débutants',
    description: 'Apprenez React de zéro avec ce guide complet.',
    thumbnail: 'https://picsum.photos/id/60/640/360',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    views: 45002,
    likes: ['user_1'],
    dislikes: [],
    timestamp: Date.now() - 604800000,
    category: VideoCategory.EDUCATION,
    duration: '45:00'
  },
  {
    id: 'vid_4',
    uploaderId: 'user_1',
    title: 'Vlog Voyage: Japon',
    description: 'Une semaine à Tokyo, entre tradition et modernité.',
    thumbnail: 'https://picsum.photos/id/122/640/360',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    views: 1200,
    likes: [],
    dislikes: [],
    timestamp: Date.now() - 43200000,
    category: VideoCategory.ALL,
    duration: '12:20'
  },
    {
    id: 'vid_5',
    uploaderId: 'user_3',
    title: 'Les meilleurs buts de la saison',
    description: 'Compilation incroyable de football.',
    thumbnail: 'https://picsum.photos/id/160/640/360',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    views: 99000,
    likes: ['user_1', 'user_2'],
    dislikes: [],
    timestamp: Date.now() - 200000,
    category: VideoCategory.SPORTS,
    duration: '08:45'
  }
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c_1',
    videoId: 'vid_1',
    userId: 'user_1',
    text: 'Super vidéo ! Très instructif.',
    timestamp: Date.now() - 40000,
    likes: 12
  },
  {
    id: 'c_2',
    videoId: 'vid_1',
    userId: 'user_3',
    text: 'La qualité est dingue.',
    timestamp: Date.now() - 20000,
    likes: 5
  }
];
