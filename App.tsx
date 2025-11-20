
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, Search, Bell, User as UserIcon, Home, Compass, PlaySquare, Clock, 
  ThumbsUp, ThumbsDown, Share2, MoreVertical, Upload, Settings, LogOut, Video as VideoIcon, X, MessageSquare, User, BarChart2,
  DollarSign, TrendingUp, CreditCard, Lock, Heart
} from './components/Icons';
import { Video, User as UserType, Comment, ViewState, VideoCategory } from './types';
import { MOCK_VIDEOS, MOCK_USERS, MOCK_COMMENTS, CURRENT_USER_ID } from './constants';
import { generateVideoDescription } from './services/geminiService';

// --- Helper Components ---

const Button = ({ children, variant = 'primary', className = '', onClick, ...props }: any) => {
  const baseStyle = "px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-neo-gray dark:bg-white text-white dark:text-black hover:opacity-90",
    secondary: "bg-gray-200 dark:bg-neo-gray text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700",
    danger: "bg-neo-red text-white hover:bg-red-700",
    ghost: "hover:bg-gray-200 dark:hover:bg-neo-gray text-black dark:text-white",
    premium: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg hover:shadow-orange-500/20"
  };
  return (
    <button className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

const Input = ({ className = '', ...props }: any) => (
  <input 
    className={`w-full bg-gray-100 dark:bg-[#121212] border border-gray-300 dark:border-[#303030] rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-black dark:text-white ${className}`}
    {...props}
  />
);

// --- Externalized Components ---

interface VideoCardProps {
  video: Video;
  users: UserType[];
  onVideoClick: (id: string) => void;
  onProfileClick: (id: string) => void;
  featured?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, users, onVideoClick, onProfileClick, featured = false }) => {
  const uploader = users.find(u => u.id === video.uploaderId);
  
  if (featured) {
     return (
      <div 
        className="relative w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden cursor-pointer group mb-8 shadow-2xl" 
        onClick={() => onVideoClick(video.id)}
      >
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-10">
           <div className="max-w-3xl animate-fade-in">
             <span className="bg-neo-red text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wide mb-3 inline-block">À la une</span>
             <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">{video.title}</h2>
             <p className="text-gray-200 text-sm sm:text-lg line-clamp-2 mb-6 max-w-2xl">{video.description}</p>
             <div className="flex items-center gap-4">
                <Button variant="premium" className="px-8 py-3 text-lg">
                  <PlaySquare className="w-5 h-5 fill-white" /> Regarder
                </Button>
                <div className="flex items-center gap-3 text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); if(uploader) onProfileClick(uploader.id); }}>
                  <img src={uploader?.avatar} className="w-10 h-10 rounded-full border-2 border-white" />
                  <span className="font-bold hover:underline">{uploader?.username}</span>
                </div>
             </div>
           </div>
        </div>
      </div>
     );
  }

  return (
    <div 
      className="flex flex-col gap-2 cursor-pointer group" 
      onClick={() => onVideoClick(video.id)}
    >
      <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-800">
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">{video.duration}</div>
      </div>
      <div className="flex gap-3 mt-1">
        <img 
          src={uploader?.avatar || ''} 
          className="w-9 h-9 rounded-full object-cover flex-shrink-0" 
          onClick={(e) => { e.stopPropagation(); if(uploader) onProfileClick(uploader.id); }} 
        />
        <div>
          <h3 className="font-bold text-sm line-clamp-2 leading-5 group-hover:text-neo-red transition-colors">{video.title}</h3>
          <p className="text-sm text-gray-500 mt-1 hover:text-gray-700 dark:hover:text-gray-300" onClick={(e) => { e.stopPropagation(); if(uploader) onProfileClick(uploader.id); }}>
             {uploader?.username} {uploader?.isPartner && <span className="text-xs text-gray-400 ml-1" title="Partenaire">✔️</span>}
          </p>
          <p className="text-sm text-gray-500">
            {video.views.toLocaleString()} vues • {Math.floor((Date.now() - video.timestamp) / (1000 * 60 * 60 * 24))} j
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  // --- Global State (Simulated Backend) ---
  const [currentUser, setCurrentUser] = useState<UserType | null>(MOCK_USERS.find(u => u.id === CURRENT_USER_ID) || null);
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS);
  const [users, setUsers] = useState<UserType[]>(MOCK_USERS);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  
  // --- UI State ---
  const [view, setView] = useState<ViewState>({ name: 'HOME' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | 'Tout'>('Tout');
  const [darkMode, setDarkMode] = useState(true);

  // --- Feed State ---
  const [feedMode, setFeedMode] = useState<'ALL' | 'SUBS'>('ALL');
  const [feedSort, setFeedSort] = useState<'DATE' | 'VIEWS'>('DATE');

  // --- Effects ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Reset feed mode if user logs out
  useEffect(() => {
    if (!currentUser && feedMode === 'SUBS') {
      setFeedMode('ALL');
    }
  }, [currentUser, feedMode]);

  // --- Derived Data ---
  const filteredVideos = useMemo(() => {
    let res = videos;

    // 1. Search Filter (Takes priority)
    if (view.name === 'SEARCH') {
      res = res.filter(v => 
        v.title.toLowerCase().includes(view.query.toLowerCase()) || 
        v.description.toLowerCase().includes(view.query.toLowerCase())
      );
    } else {
      // 2. Feed Mode Filter
      if (feedMode === 'SUBS' && currentUser) {
        res = res.filter(v => currentUser.subscriptions.includes(v.uploaderId));
      }

      // 3. Category Filter
      if (selectedCategory !== 'Tout') {
        res = res.filter(v => v.category === selectedCategory);
      }
    }

    // 4. Sorting
    res = [...res];
    
    if (feedSort === 'DATE') {
      res.sort((a, b) => b.timestamp - a.timestamp);
    } else if (feedSort === 'VIEWS') {
      res.sort((a, b) => b.views - a.views);
    }

    return res;
  }, [videos, view, selectedCategory, feedMode, feedSort, currentUser]);

  // --- Actions ---
  const handleLogin = (email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setView({ name: 'HOME' });
    } else {
      alert("Utilisateur non trouvé (Essayez user@neotube.com)");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView({ name: 'LOGIN' });
  };

  const handleUpload = async (videoData: Partial<Video>, file: File) => {
    if (!currentUser) return;
    
    let description = videoData.description || '';
    if (!description && videoData.title) {
        description = await generateVideoDescription(videoData.title);
    }

    const newVideo: Video = {
      id: `vid_${Date.now()}`,
      uploaderId: currentUser.id,
      title: videoData.title || 'Sans titre',
      description: description,
      thumbnail: 'https://picsum.photos/seed/' + Date.now() + '/640/360',
      videoUrl: URL.createObjectURL(file),
      views: 0,
      likes: [],
      dislikes: [],
      timestamp: Date.now(),
      category: videoData.category as VideoCategory || VideoCategory.ALL,
      duration: '00:00'
    };

    setVideos([newVideo, ...videos]);
    setView({ name: 'WATCH', videoId: newVideo.id });
  };

  const handleLike = (videoId: string) => {
    if (!currentUser) return setView({ name: 'LOGIN' });
    setVideos(prev => prev.map(v => {
      if (v.id === videoId) {
        const isLiked = v.likes.includes(currentUser.id!);
        return {
          ...v,
          likes: isLiked ? v.likes.filter(id => id !== currentUser.id) : [...v.likes, currentUser.id!]
        };
      }
      return v;
    }));
  };

  const handleSubscribe = (targetUserId: string) => {
    if (!currentUser) return setView({ name: 'LOGIN' });
    if (currentUser.id === targetUserId) return;

    const isSubscribed = currentUser.subscriptions.includes(targetUserId);
    
    setCurrentUser(prev => prev ? ({
      ...prev,
      subscriptions: isSubscribed 
        ? prev.subscriptions.filter(id => id !== targetUserId)
        : [...prev.subscriptions, targetUserId]
    }) : null);

    setUsers(prev => prev.map(u => {
      if (u.id === targetUserId) {
        return {
          ...u,
          subscribers: isSubscribed 
            ? u.subscribers.filter(id => id !== currentUser.id)
            : [...u.subscribers, currentUser.id!]
        };
      }
      return u;
    }));
  };

  const handleComment = (videoId: string, text: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      videoId,
      userId: currentUser.id,
      text,
      timestamp: Date.now(),
      likes: 0
    };
    setComments([newComment, ...comments]);
  };

  const handleSupport = (amount: number) => {
    alert(`Merci pour votre don de ${amount}€ ! (Simulation)`);
  };

  // --- Components ---

  const Navbar = () => (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0f0f0f] flex items-center justify-between px-4 z-50 border-b border-gray-200 dark:border-transparent">
      <div className="flex items-center gap-4">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <Menu className="w-6 h-6" />
        </button>
        <div 
          className="flex items-center gap-1 cursor-pointer" 
          onClick={() => setView({ name: 'HOME' })}
        >
          <div className="w-8 h-8 bg-neo-red rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
            <PlaySquare className="text-white fill-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tighter">NeoTube</span>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-4 hidden md:flex">
        <div className="flex w-full relative group">
          <input 
            type="text" 
            placeholder="Rechercher" 
            className="w-full bg-gray-100 dark:bg-[#121212] border border-gray-300 dark:border-[#303030] rounded-l-full px-4 py-2 focus:outline-none focus:border-blue-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setView({ name: 'SEARCH', query: searchQuery })}
          />
          <button 
            className="bg-gray-200 dark:bg-[#222] px-5 rounded-r-full border border-l-0 border-gray-300 dark:border-[#303030] hover:bg-gray-300 dark:hover:bg-[#333]"
            onClick={() => setView({ name: 'SEARCH', query: searchQuery })}
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <Settings className="w-6 h-6" />
        </button>
        {currentUser ? (
          <>
            <button 
              onClick={() => setView({ name: 'UPLOAD' })}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full hidden sm:block"
            >
              <Upload className="w-6 h-6" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <img 
              src={currentUser.avatar} 
              alt="Profile" 
              className="w-8 h-8 rounded-full cursor-pointer object-cover ring-2 ring-transparent hover:ring-gray-400 transition-all"
              onClick={() => setView({ name: 'PROFILE', userId: currentUser.id })}
            />
          </>
        ) : (
          <Button variant="ghost" onClick={() => setView({ name: 'LOGIN' })} className="border border-gray-300 dark:border-gray-700">
            <UserIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Connexion</span>
          </Button>
        )}
      </div>
    </div>
  );

  const Sidebar = () => (
    <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-[#0f0f0f] overflow-y-auto transition-transform duration-300 z-40 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:w-20 xl:w-64 hover:w-64 group border-r border-gray-100 dark:border-[#1f1f1f]`}>
      <div className="p-2">
        {[
          { icon: Home, label: 'Accueil', action: () => setView({ name: 'HOME' }) },
          { icon: Compass, label: 'Shorts', action: () => {} },
          { icon: Clock, label: 'Abonnements', action: () => {} },
        ].map((item, idx) => (
          <div key={idx} onClick={item.action} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#272727] cursor-pointer mb-1 transition-colors">
            <item.icon className="w-6 h-6 flex-shrink-0" />
            <span className="text-sm font-medium xl:block lg:hidden group-hover:block overflow-hidden whitespace-nowrap">{item.label}</span>
          </div>
        ))}

        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

        {/* Creator Tools */}
        {currentUser && (
           <>
             <div 
               onClick={() => setView({ name: 'DASHBOARD' })} 
               className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#272727] cursor-pointer mb-1"
             >
               <BarChart2 className="w-6 h-6 flex-shrink-0 text-neo-red" />
               <span className="text-sm font-bold xl:block lg:hidden group-hover:block overflow-hidden whitespace-nowrap">Tableau de bord</span>
             </div>
             <div 
               onClick={() => setView({ name: 'MONETIZATION' })} 
               className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#272727] cursor-pointer mb-1"
             >
               <DollarSign className="w-6 h-6 flex-shrink-0 text-green-500" />
               <span className="text-sm font-bold xl:block lg:hidden group-hover:block overflow-hidden whitespace-nowrap">Revenus</span>
             </div>
           </>
        )}
        
        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
        
        {currentUser && (
           <>
            <div className="px-3 py-2 text-sm font-semibold text-gray-500 xl:block lg:hidden group-hover:block">Abonnements</div>
            {currentUser.subscriptions.map(subId => {
              const subUser = users.find(u => u.id === subId);
              if (!subUser) return null;
              return (
                <div key={subId} onClick={() => setView({ name: 'PROFILE', userId: subId })} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#272727] cursor-pointer">
                   <img src={subUser.avatar} className="w-6 h-6 rounded-full object-cover" />
                   <span className="text-sm font-medium xl:block lg:hidden group-hover:block truncate">{subUser.username}</span>
                </div>
              )
            })}
           </>
        )}
      </div>
    </aside>
  );

  // --- Pages ---

  const HomePage = () => {
    // Find a featured video (most viewed or most recent)
    const featuredVideo = videos.reduce((prev, current) => (prev.views > current.views) ? prev : current);

    return (
      <div className="p-6 pt-4">
        
        {/* Hero / Featured Section - New Design */}
        {view.name === 'HOME' && !searchQuery && selectedCategory === 'Tout' && feedMode === 'ALL' && (
          <VideoCard 
            video={featuredVideo} 
            users={users} 
            onVideoClick={(id) => setView({ name: 'WATCH', videoId: id })}
            onProfileClick={(id) => setView({ name: 'PROFILE', userId: id })}
            featured={true}
          />
        )}

        {/* Filters Bar */}
        <div className="sticky top-16 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-sm z-30 py-2 mb-6 transition-colors border-b border-transparent dark:border-gray-800 pb-4">
           <div className="flex flex-col gap-4">
             {/* Top Row: Feed Type & Sort */}
             {currentUser && view.name !== 'SEARCH' && (
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                 <div className="flex bg-gray-100 dark:bg-[#272727] p-1 rounded-lg self-start">
                   <button 
                     onClick={() => setFeedMode('ALL')}
                     className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${feedMode === 'ALL' ? 'bg-white dark:bg-[#3f3f3f] shadow-sm text-black dark:text-white' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                   >
                     Recommandations
                   </button>
                   <button 
                     onClick={() => setFeedMode('SUBS')}
                     className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${feedMode === 'SUBS' ? 'bg-white dark:bg-[#3f3f3f] shadow-sm text-black dark:text-white' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                   >
                     Abonnements
                   </button>
                 </div>
  
                 <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs text-gray-500 font-bold uppercase hidden sm:block">Trier par</span>
                    <select 
                      value={feedSort}
                      onChange={(e) => setFeedSort(e.target.value as any)}
                      className="bg-gray-100 dark:bg-[#272727] border-none text-sm rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer outline-none"
                    >
                      <option value="DATE">Date (Plus récent)</option>
                      <option value="VIEWS">Pertinence (Populaire)</option>
                    </select>
                 </div>
               </div>
             )}
  
             {/* Categories Pills */}
             <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 sm:pb-0 mask-linear">
                {Object.values(VideoCategory).map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${selectedCategory === cat ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-[#272727] hover:bg-gray-200 dark:hover:bg-[#3f3f3f]'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
           </div>
        </div>
  
        {/* Content Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {filteredVideos.filter(v => view.name === 'HOME' ? v.id !== featuredVideo.id : true).map(video => (
              <VideoCard 
                key={video.id} 
                video={video} 
                users={users}
                onVideoClick={(id) => setView({ name: 'WATCH', videoId: id })}
                onProfileClick={(id) => setView({ name: 'PROFILE', userId: id })}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
             <div className="bg-gray-100 dark:bg-[#272727] p-6 rounded-full mb-4">
               {feedMode === 'SUBS' ? <UserIcon className="w-12 h-12 text-gray-400" /> : <Search className="w-12 h-12 text-gray-400" />}
             </div>
             <h3 className="text-xl font-bold mb-2">
               {feedMode === 'SUBS' ? 'Aucune vidéo dans vos abonnements' : 'Aucune vidéo trouvée'}
             </h3>
             <p className="text-gray-500 max-w-md">
               {feedMode === 'SUBS' 
                 ? "Abonnez-vous à des créateurs pour voir leurs vidéos ici ou passez en mode Recommandations." 
                 : "Essayez d'autres filtres ou catégories."}
             </p>
             {feedMode === 'SUBS' && (
               <Button variant="secondary" className="mt-4" onClick={() => setFeedMode('ALL')}>
                 Voir les recommandations
               </Button>
             )}
          </div>
        )}
      </div>
    );
  };

  const MonetizationPage = () => {
    if (!currentUser) return <AuthPage />;

    const isEligible = currentUser.subscribers.length >= 1000; // Simuler 1000 subs pour éligibilité
    const progress = Math.min((currentUser.subscribers.length / 1000) * 100, 100);

    return (
      <div className="p-8 max-w-6xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Monétisation de la chaîne</h1>
          <p className="text-gray-500">Gérez vos revenus et consultez votre éligibilité au Programme Partenaire NeoTube.</p>
        </div>

        {currentUser.isPartner ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
                 <div className="flex items-center gap-3 mb-4 opacity-90">
                   <DollarSign className="w-6 h-6" />
                   <span className="font-medium">Solde disponible</span>
                 </div>
                 <h2 className="text-4xl font-bold mb-2">{currentUser.revenue?.toFixed(2)} €</h2>
                 <p className="text-sm opacity-80">Mis à jour aujourd'hui</p>
              </div>

              <div className="bg-white dark:bg-[#1f1f1f] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-blue-500">
                   <TrendingUp className="w-6 h-6" />
                   <span className="font-medium">RPM (Revenu pour 1000 vues)</span>
                </div>
                <h2 className="text-3xl font-bold text-black dark:text-white mb-2">2,45 €</h2>
                <p className="text-sm text-gray-500">+0.30 € vs le mois dernier</p>
              </div>

              <div className="bg-white dark:bg-[#1f1f1f] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                 <div className="flex items-center gap-3 mb-4 text-purple-500">
                   <CreditCard className="w-6 h-6" />
                   <span className="font-medium">Prochain versement</span>
                 </div>
                 <h2 className="text-3xl font-bold text-black dark:text-white mb-2">21 Mars</h2>
                 <p className="text-sm text-gray-500">Seuil de paiement atteint</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1f1f1f] rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold mb-6">Dernières transactions</h3>
              <div className="space-y-4">
                {[
                  { label: 'Revenus publicitaires (Février)', date: '28 Fév 2024', amount: '+ 450.20 €', type: 'success' },
                  { label: 'Super Chat: "Le Futur de la Tech..."', date: '25 Fév 2024', amount: '+ 15.00 €', type: 'success' },
                  { label: 'Paiement vers compte bancaire', date: '21 Fév 2024', amount: '- 1200.00 €', type: 'neutral' },
                ].map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-xl">
                     <div>
                       <p className="font-bold">{t.label}</p>
                       <p className="text-sm text-gray-500">{t.date}</p>
                     </div>
                     <span className={`font-mono font-bold ${t.type === 'success' ? 'text-green-500' : 'text-gray-500'}`}>{t.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-[#1f1f1f] rounded-2xl p-10 text-center border border-gray-200 dark:border-gray-800">
             <div className="w-20 h-20 bg-gray-100 dark:bg-[#333] rounded-full flex items-center justify-center mx-auto mb-6">
               <Lock className="w-10 h-10 text-gray-500" />
             </div>
             <h2 className="text-2xl font-bold mb-4">Vous n'êtes pas encore partenaire</h2>
             <p className="text-gray-500 max-w-lg mx-auto mb-8">
               Pour rejoindre le programme partenaire NeoTube et commencer à monétiser vos vidéos, vous devez atteindre 1000 abonnés et 4000 heures de visionnage.
             </p>
             
             <div className="max-w-md mx-auto mb-8">
               <div className="flex justify-between text-sm font-bold mb-2">
                 <span>Progression abonnés</span>
                 <span>{currentUser.subscribers.length} / 1000</span>
               </div>
               <div className="w-full h-4 bg-gray-200 dark:bg-[#333] rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
               </div>
             </div>

             <Button disabled className="opacity-50 cursor-not-allowed mx-auto">
               Postuler maintenant
             </Button>
          </div>
        )}
      </div>
    );
  };

  const WatchPage = ({ videoId }: { videoId: string }) => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return <div>Vidéo introuvable</div>;
    
    const uploader = users.find(u => u.id === video.uploaderId);
    const isLiked = currentUser && video.likes.includes(currentUser.id);
    const isSubscribed = currentUser && uploader && currentUser.subscriptions.includes(uploader.id);
    
    const videoComments = comments.filter(c => c.videoId === videoId).sort((a, b) => b.timestamp - a.timestamp);
    const [newComment, setNewComment] = useState('');

    return (
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-[1800px] mx-auto">
        {/* Left Column: Player + Info + Comments */}
        <div className="flex-1">
          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
            <video 
              src={video.videoUrl} 
              controls 
              autoPlay 
              className="w-full h-full"
            />
          </div>

          <h1 className="text-xl font-bold mt-4">{video.title}</h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-4">
            <div className="flex items-center gap-4">
              <img src={uploader?.avatar} className="w-10 h-10 rounded-full object-cover cursor-pointer" onClick={() => uploader && setView({name:'PROFILE', userId: uploader.id})} />
              <div>
                <h3 className="font-bold cursor-pointer flex items-center gap-1" onClick={() => uploader && setView({name:'PROFILE', userId: uploader.id})}>
                  {uploader?.username}
                  {uploader?.isPartner && <span className="text-blue-500" title="Vérifié">✓</span>}
                </h3>
                <p className="text-xs text-gray-500">{uploader?.subscribers.length} abonnés</p>
              </div>
              <Button 
                variant={isSubscribed ? 'secondary' : 'primary'}
                onClick={() => uploader && handleSubscribe(uploader.id)}
                className={isSubscribed ? '' : 'bg-black text-white dark:bg-white dark:text-black'}
              >
                {isSubscribed ? 'Abonné' : "S'abonner"}
              </Button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <div className="flex items-center bg-gray-100 dark:bg-[#272727] rounded-full overflow-hidden flex-shrink-0">
                <button 
                  onClick={() => handleLike(video.id)}
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#3f3f3f] border-r border-gray-300 dark:border-[#3f3f3f] ${isLiked ? 'text-blue-500' : ''}`}
                >
                  <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{video.likes.length}</span>
                </button>
                <button className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#3f3f3f]">
                  <ThumbsDown className="w-5 h-5" />
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#272727] rounded-full hover:bg-gray-200 dark:hover:bg-[#3f3f3f] flex-shrink-0">
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Partager</span>
              </button>
              
              {/* Monetization Feature: Donation Button */}
              {uploader?.isPartner && (
                 <button 
                   onClick={() => handleSupport(5)}
                   className="flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full hover:bg-pink-200 dark:hover:bg-pink-900/50 flex-shrink-0 transition-colors font-medium"
                 >
                   <Heart className="w-5 h-5 fill-current" />
                   <span>Merci</span>
                 </button>
              )}
            </div>
          </div>

          <div className="mt-4 bg-gray-100 dark:bg-[#272727] p-4 rounded-xl text-sm whitespace-pre-wrap">
             <p className="font-bold mb-2">{video.views.toLocaleString()} vues • {new Date(video.timestamp).toLocaleDateString()}</p>
             <p>{video.description}</p>
             <div className="mt-4 flex gap-2">
               <span className="bg-neo-red/10 text-neo-red px-2 py-1 rounded text-xs font-bold">#{video.category}</span>
               <span className="bg-neo-red/10 text-neo-red px-2 py-1 rounded text-xs font-bold">#NeoTube</span>
             </div>
          </div>

          {/* Comments */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-4">{videoComments.length} commentaires</h3>
            {currentUser && (
              <div className="flex gap-4 mb-6">
                <img src={currentUser.avatar} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Ajouter un commentaire..." 
                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none py-1 pb-2 transition-colors"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newComment.trim()) {
                        handleComment(video.id, newComment);
                        setNewComment('');
                      }
                    }}
                  />
                  <div className="flex justify-end mt-2">
                    <Button 
                      variant="primary" 
                      className={`px-3 py-1 text-sm ${!newComment.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if(newComment.trim()) {
                           handleComment(video.id, newComment);
                           setNewComment('');
                        }
                      }}
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {videoComments.map(comment => {
                const cUser = users.find(u => u.id === comment.userId);
                return (
                  <div key={comment.id} className="flex gap-4">
                    <img src={cUser?.avatar} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${cUser?.id === uploader?.id ? 'bg-gray-200 dark:bg-[#3f3f3f] px-1.5 rounded-md' : ''}`}>
                          {cUser?.username}
                        </span>
                        <span className="text-xs text-gray-500">il y a 2h</span>
                      </div>
                      <p className="text-sm mt-1">{comment.text}</p>
                      <div className="flex items-center gap-4 mt-2">
                         <div className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                           <ThumbsUp className="w-3 h-3" />
                           {comment.likes}
                         </div>
                         <span className="text-xs font-bold text-gray-500 cursor-pointer hover:text-white">Répondre</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Recommendations */}
        <div className="lg:w-[400px] flex flex-col gap-3">
           {videos.filter(v => v.id !== video.id).map(v => {
             const u = users.find(user => user.id === v.uploaderId);
             return (
               <div key={v.id} className="flex gap-2 cursor-pointer group" onClick={() => setView({ name: 'WATCH', videoId: v.id })}>
                 <div className="w-40 h-24 relative flex-shrink-0 rounded-lg overflow-hidden">
                    <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">{v.duration}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                   <h4 className="font-bold text-sm line-clamp-2">{v.title}</h4>
                   <p className="text-xs text-gray-500">{u?.username}</p>
                   <p className="text-xs text-gray-500">{v.views} vues</p>
                 </div>
               </div>
             )
           })}
        </div>
      </div>
    );
  };

  const UploadPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [category, setCategory] = useState(VideoCategory.GAMING);
    const [isDragging, setIsDragging] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        setFile(e.dataTransfer.files[0]);
        setTitle(e.dataTransfer.files[0].name.split('.')[0]);
      }
    };

    const generateAIInfo = async () => {
      if(!title) return;
      setIsGenerating(true);
      const generatedDesc = await generateVideoDescription(title);
      setDesc(generatedDesc);
      setIsGenerating(false);
    }

    const handleSubmit = () => {
      if (file) handleUpload({ title, description: desc, category }, file);
    };

    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#121212] p-4">
        <div className="bg-white dark:bg-[#272727] w-full max-w-2xl rounded-xl shadow-2xl p-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6">Mettre en ligne une vidéo</h2>
          
          {!file ? (
             <div 
               className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}
               onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
               onDragLeave={() => setIsDragging(false)}
               onDrop={handleDrop}
               onClick={() => document.getElementById('fileInput')?.click()}
             >
               <div className="bg-gray-100 dark:bg-[#3f3f3f] p-4 rounded-full mb-4">
                 <Upload className="w-8 h-8 text-gray-500 dark:text-gray-300" />
               </div>
               <p className="font-medium">Glissez-déposez ou cliquez pour sélectionner</p>
               <p className="text-sm text-gray-500 mt-2">MP4, WebM supportés</p>
               <input type="file" id="fileInput" className="hidden" accept="video/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
             </div>
          ) : (
            <div className="space-y-6">
               <div className="flex items-center justify-between bg-gray-100 dark:bg-[#1f1f1f] p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <VideoIcon className="w-6 h-6 text-blue-500" />
                    <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <button onClick={() => setFile(null)} className="text-red-500"><X className="w-5 h-5" /></button>
               </div>

               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium mb-1">Titre</label>
                   <Input value={title} onChange={(e: any) => setTitle(e.target.value)} />
                 </div>
                 <div>
                   <div className="flex justify-between mb-1">
                     <label className="block text-sm font-medium">Description</label>
                     <button 
                       onClick={generateAIInfo} 
                       disabled={!title || isGenerating}
                       className="text-xs text-blue-500 font-bold hover:underline disabled:opacity-50 flex items-center gap-1"
                     >
                       {isGenerating ? 'Génération...' : '✨ Générer avec l\'IA'}
                     </button>
                   </div>
                   <textarea 
                     className="w-full bg-gray-100 dark:bg-[#121212] border border-gray-300 dark:border-[#303030] rounded-lg px-4 py-2 h-32 focus:outline-none focus:border-blue-500 text-black dark:text-white resize-none"
                     value={desc}
                     onChange={(e) => setDesc(e.target.value)}
                   />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Catégorie</label>
                    <select 
                      className="w-full bg-gray-100 dark:bg-[#121212] border border-gray-300 dark:border-[#303030] rounded-lg px-4 py-2"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as VideoCategory)}
                    >
                      {Object.values(VideoCategory).filter(c => c !== 'Tout').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                 </div>
               </div>

               <div className="flex justify-end gap-4">
                 <Button variant="ghost" onClick={() => setFile(null)}>Annuler</Button>
                 <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">Publier</Button>
               </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProfilePage = ({ userId }: { userId: string }) => {
    const user = users.find(u => u.id === userId);
    if (!user) return <div>Utilisateur inconnu</div>;
    
    const userVideos = videos.filter(v => v.uploaderId === userId);
    const isMe = currentUser?.id === userId;
    const isSubscribed = currentUser && currentUser.subscriptions.includes(userId);

    return (
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f]">
        {/* Banner */}
        <div className="h-40 sm:h-60 w-full bg-gray-800 relative overflow-hidden">
          {user.banner && <img src={user.banner} className="w-full h-full object-cover" />}
        </div>
        
        {/* Info */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 -mt-10 sm:-mt-6 relative z-10 mb-8">
             <img src={user.avatar} className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-[#0f0f0f] object-cover bg-gray-800" />
             <div className="flex-1 mt-2 sm:mt-12">
               <h1 className="text-3xl font-bold flex items-center gap-2">
                 {user.username}
                 {user.isPartner && <span className="text-blue-500 text-xl" title="Partenaire">✓</span>}
               </h1>
               <p className="text-gray-500">@{user.username.toLowerCase()} • {user.subscribers.length} abonnés • {userVideos.length} vidéos</p>
             </div>
             <div className="mt-4 sm:mt-12">
               {isMe ? (
                 <div className="flex gap-2">
                   <Button variant="secondary" onClick={() => setView({ name: 'DASHBOARD' })}>Tableau de bord</Button>
                   <Button variant="secondary" onClick={handleLogout}><LogOut className="w-4 h-4"/> Déconnexion</Button>
                 </div>
               ) : (
                  <Button 
                    variant={isSubscribed ? 'secondary' : 'primary'}
                    className={isSubscribed ? '' : 'bg-black text-white dark:bg-white dark:text-black'}
                    onClick={() => handleSubscribe(user.id)}
                  >
                    {isSubscribed ? 'Abonné' : "S'abonner"}
                  </Button>
               )}
             </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex gap-8">
              <button className="px-2 py-3 border-b-2 border-black dark:border-white font-bold">Vidéos</button>
              <button className="px-2 py-3 text-gray-500 hover:text-black dark:hover:text-white">Playlists</button>
              <button className="px-2 py-3 text-gray-500 hover:text-black dark:hover:text-white">À propos</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-10">
            {userVideos.length > 0 ? userVideos.map(v => (
              <VideoCard 
                key={v.id} 
                video={v} 
                users={users}
                onVideoClick={(id) => setView({ name: 'WATCH', videoId: id })}
                onProfileClick={(id) => setView({ name: 'PROFILE', userId: id })}
              />
            )) : (
              <div className="col-span-full text-center py-10 text-gray-500">Aucune vidéo publiée.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DashboardPage = () => {
    if (!currentUser) return <AuthPage />;

    // Calculate Stats
    const myVideos = videos.filter(v => v.uploaderId === currentUser.id);
    const totalViews = myVideos.reduce((acc, curr) => acc + curr.views, 0);
    const totalLikes = myVideos.reduce((acc, curr) => acc + curr.likes.length, 0);
    
    // Comments on my videos
    const myVideoIds = myVideos.map(v => v.id);
    const totalComments = comments.filter(c => myVideoIds.includes(c.videoId)).length;

    // Best performing video
    const topVideo = [...myVideos].sort((a, b) => b.views - a.views)[0];

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
      <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold">{value.toLocaleString()}</h3>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Tableau de bord de la chaîne</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setView({ name: 'MONETIZATION' })}>
              <DollarSign className="w-4 h-4" /> Revenus
            </Button>
            <Button variant="primary" onClick={() => setView({ name: 'UPLOAD' })}>
              <Upload className="w-4 h-4" /> Mettre en ligne
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           <StatCard title="Vues totales" value={totalViews} icon={VideoIcon} color="bg-blue-500" />
           <StatCard title="Abonnés" value={currentUser.subscribers.length} icon={UserIcon} color="bg-neo-red" />
           <StatCard title="J'aime" value={totalLikes} icon={ThumbsUp} color="bg-green-500" />
           <StatCard title="Revenus estimés" value={`${currentUser.revenue?.toFixed(0) || 0} €`} icon={DollarSign} color="bg-yellow-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Videos List */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1f1f1f] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
             <div className="p-6 border-b border-gray-200 dark:border-gray-800">
               <h2 className="text-lg font-bold">Contenu récent</h2>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 dark:bg-[#252525] text-gray-500">
                   <tr>
                     <th className="px-6 py-3">Vidéo</th>
                     <th className="px-6 py-3">Date</th>
                     <th className="px-6 py-3">Vues</th>
                     <th className="px-6 py-3">J'aime</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                   {myVideos.sort((a, b) => b.timestamp - a.timestamp).map(video => (
                     <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors cursor-pointer" onClick={() => setView({ name: 'WATCH', videoId: video.id })}>
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <img src={video.thumbnail} className="w-16 h-9 object-cover rounded" />
                           <span className="font-medium truncate max-w-[200px]">{video.title}</span>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-gray-500">{new Date(video.timestamp).toLocaleDateString()}</td>
                       <td className="px-6 py-4">{video.views.toLocaleString()}</td>
                       <td className="px-6 py-4">{video.likes.length}</td>
                     </tr>
                   ))}
                   {myVideos.length === 0 && (
                     <tr>
                       <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                         Vous n'avez pas encore publié de vidéo.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>

          {/* Top Video Card */}
          <div className="bg-white dark:bg-[#1f1f1f] rounded-xl border border-gray-200 dark:border-gray-800 h-fit">
             <div className="p-6 border-b border-gray-200 dark:border-gray-800">
               <h2 className="text-lg font-bold">Meilleure performance</h2>
             </div>
             {topVideo ? (
               <div className="p-6">
                  <div className="aspect-video rounded-lg overflow-hidden mb-4 cursor-pointer" onClick={() => setView({ name: 'WATCH', videoId: topVideo.id })}>
                    <img src={topVideo.thumbnail} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold mb-1 line-clamp-1">{topVideo.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">Publiée le {new Date(topVideo.timestamp).toLocaleDateString()}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Vues</span>
                      <span className="font-bold">{topVideo.views}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-[#333] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: '100%' }}></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Taux de like</span>
                      <span className="font-bold">{Math.round((topVideo.likes.length / (topVideo.views || 1)) * 100)}%</span>
                    </div>
                  </div>
               </div>
             ) : (
               <div className="p-6 text-center text-gray-500">
                 Pas assez de données.
               </div>
             )}
          </div>
        </div>
      </div>
    );
  };

  const AuthPage = () => {
    const [email, setEmail] = useState('');
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0f0f0f]">
        <div className="bg-white dark:bg-[#1f1f1f] p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800">
          <div className="flex justify-center mb-6">
             <div className="w-12 h-12 bg-neo-red rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
               <PlaySquare className="text-white fill-white w-7 h-7" />
             </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Bienvenue sur NeoTube</h2>
          <p className="text-center text-gray-500 mb-8">La plateforme vidéo de nouvelle génération</p>

          <div className="space-y-4">
             <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm">
               <p><strong>Comptes de démo :</strong></p>
               <p>user@neotube.com (Partenaire)</p>
               <p>tech@master.com (Partenaire)</p>
               <p>gamer@pro.com (Non-Partenaire)</p>
             </div>
             <Input 
               type="email" 
               placeholder="Adresse Email" 
               value={email} 
               onChange={(e: any) => setEmail(e.target.value)}
             />
             <Button className="w-full justify-center py-3 bg-neo-red hover:bg-red-600 text-white border-none" onClick={() => handleLogin(email)}>
               Se connecter / S'inscrire
             </Button>
             <p className="text-center text-xs text-gray-500 mt-4">En continuant, vous acceptez les conditions d'utilisation de NeoTube.</p>
          </div>
        </div>
      </div>
    );
  };

  // --- Render Router ---
  
  const renderContent = () => {
    switch (view.name) {
      case 'HOME': return <HomePage />;
      case 'WATCH': return <WatchPage videoId={view.videoId} />;
      case 'UPLOAD': return <UploadPage />;
      case 'PROFILE': return <ProfilePage userId={view.userId} />;
      case 'DASHBOARD': return <DashboardPage />;
      case 'MONETIZATION': return <MonetizationPage />;
      case 'SEARCH': return <HomePage />; // Search filtering is handled in useMemo
      default: return <HomePage />;
    }
  };

  if (view.name === 'LOGIN' || view.name === 'SIGNUP') {
    return <AuthPage />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <Navbar />
      <div className="flex pt-16 h-[calc(100vh)]">
        {/* Sidebar Overlay for mobile */}
        <div 
           className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
           onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Sidebar Logic: visible based on state/width */}
        <div className={`${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
           <Sidebar />
        </div>

        <main className={`flex-1 overflow-y-auto bg-white dark:bg-[#0f0f0f] transition-all duration-300 ${isSidebarOpen ? 'lg:ml-20 xl:ml-64' : 'lg:ml-0'}`}>
           {renderContent()}
        </main>
      </div>
    </div>
  );
}
