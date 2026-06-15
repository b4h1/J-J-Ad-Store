import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Coins, 
  Play, 
  UserPlus, 
  Code, 
  Database, 
  Sparkles, 
  Zap,
  Flame, 
  Gift, 
  LogOut, 
  Compass, 
  UserCheck, 
  CheckCircle2, 
  HelpCircle, 
  Lock, 
  Unlock, 
  Copy, 
  ArrowRight, 
  RotateCcw,
  BookOpen,
  Info,
  Layers,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Mail,
  User,
  Key,
  Shield,
  Activity,
  Award,
  Video,
  X,
  Volume2,
  VolumeX,
  RefreshCw,
  Clock,
  Plus,
  Home,
  Settings
} from 'lucide-react';
import { FLUTTER_FILES, CodeFile } from './flutterCode';

// Interfaces mapping Firestore document shapes precisely
interface UserDocument {
  uid: string;
  name: string;
  email: string;
  pointsBalance: number;
  appPoints?: Record<string, number>; // Points indexed per app (id => points)
  lifetimeAdsWatched: number;
  myReferralCode: string;
  referredBy: string; // ID of user who referred, or "none"
}

interface AppConfig {
  id: string;
  name: string;
  category: string;
  shortName: string;
  icon: string;
}

const MOCK_APPS: AppConfig[] = [
  { id: 'app_1', name: 'Ethio News & Points', category: 'News', shortName: 'EthioNews', icon: 'BookOpen' },
  { id: 'app_2', name: 'Amharic Trivia Arcade', category: 'Gaming', shortName: 'AmhTrivia', icon: 'Award' },
  { id: 'app_3', name: 'Habesha Clicker Game', category: 'Gaming', shortName: 'Clicker', icon: 'Flame' },
  { id: 'app_4', name: 'Fana Rewards Hub', category: 'Utility', shortName: 'FanaHub', icon: 'Sparkles' },
  { id: 'app_5', name: 'Gezeta Mini Games', category: 'Gaming', shortName: 'Gezeta', icon: 'Activity' },
  { id: 'app_6', name: 'Abyssinia Utility Pro', category: 'Utility', shortName: 'Abyssinia', icon: 'Settings' },
  { id: 'app_7', name: 'Sheger Coin Collector', category: 'Gaming', shortName: 'Sheger', icon: 'Coins' },
  { id: 'app_8', name: 'Sodere Video Stream', category: 'Entertainment', shortName: 'Sodere', icon: 'Play' },
  { id: 'app_9', name: 'Tarik History Quiz', category: 'Education', shortName: 'TarikQuiz', icon: 'HelpCircle' },
  { id: 'app_10', name: 'Bole Rewards Express', category: 'Finance', shortName: 'BoleRewards', icon: 'Zap' },
];

interface ReferralDocument {
  id: string;
  referrerUid: string;
  referredUid: string;
  pointsAwarded: number;
  timestamp: string;
}

interface StoreDocument {
  itemId: string;
  title: string;
  pointsCost: number;
  category: string;
  icon: string;
  brand?: 'ethio' | 'safaricom' | 'jolly' | 'junior';
}

interface PurchaseDocument {
  id: string;
  uid: string;
  itemId: string;
  title: string;
  pointsCost: number;
  timestamp: string;
}

interface SystemLog {
  id: string;
  timestamp: string;
  type: 'auth' | 'ad' | 'referral' | 'purchase' | 'system';
  message: string;
}

// Initial Mock Seed Data matching standard schema requested
const INITIAL_STORE_INVENTORY: StoreDocument[] = [
  { itemId: 'ethio_voice', title: 'Ethio Telecom Monthly Voice Package', pointsCost: 2000, category: 'Voice', icon: 'phone', brand: 'ethio' },
  { itemId: 'safaricom_voice', title: 'Safaricom Monthly Voice Package', pointsCost: 2500, category: 'Voice', icon: 'phone', brand: 'safaricom' },
  { itemId: 'ethio_net', title: 'Ethio Telecom Monthly Internet Package', pointsCost: 3500, category: 'Internet', icon: 'wifi', brand: 'ethio' },
  { itemId: 'safaricom_net', title: 'Safaricom Monthly Internet Package', pointsCost: 4000, category: 'Internet', icon: 'wifi', brand: 'safaricom' },
  { itemId: 'ethio_unl', title: 'Ethio Telecom Monthly Unlimited Voice Package', pointsCost: 5000, category: 'Unlimited', icon: 'infinity', brand: 'ethio' },
  { itemId: 'safaricom_unl', title: 'Safaricom Monthly Unlimited Voice Package', pointsCost: 5500, category: 'Unlimited', icon: 'infinity', brand: 'safaricom' },
  { itemId: 'jolly_gift', title: "Jolly's Gift Card $10", pointsCost: 10000, category: 'Gift Card', icon: 'gift', brand: 'jolly' },
  { itemId: 'junior_gift', title: "Junior's Gift Card $15", pointsCost: 15000, category: 'Gift Card', icon: 'gift', brand: 'junior' }
];

const INITIAL_USERS: UserDocument[] = [
  {
    uid: 'user_alex',
    name: 'Alex Bahre',
    email: 'alexbahre@gmail.com',
    pointsBalance: 350,
    appPoints: {
      app_1: 100,
      app_2: 200,
      app_3: 50
    },
    lifetimeAdsWatched: 8,
    myReferralCode: 'BAH5832', // First 3: "BAH" + 4 digits
    referredBy: 'none'
  },
  {
    uid: 'user_jess',
    name: 'Jessica Reed',
    email: 'jreed@gmail.com',
    pointsBalance: 820,
    appPoints: {
      app_1: 300,
      app_2: 400,
      app_3: 120
    },
    lifetimeAdsWatched: 24,
    myReferralCode: 'REE7491', // First 3: "REE" + 4 digits
    referredBy: 'none'
  },
  {
    uid: 'user_mike',
    name: 'Michael Peterson',
    email: 'mpeterson@outlook.com',
    pointsBalance: 120,
    appPoints: {
      app_1: 70,
      app_2: 50
    },
    lifetimeAdsWatched: 2,
    myReferralCode: 'PET9942', // First 3: "PET" + 4 digits
    referredBy: 'user_alex'  // Referred by Alex
  }
];

const INITIAL_REFERRALS: ReferralDocument[] = [
  {
    id: 'ref_001',
    referrerUid: 'user_alex',
    referredUid: 'user_mike',
    pointsAwarded: 100,
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString()
  }
];

const TRANSLATIONS = {
  en: {
    rewardCenter: 'Rewards Center',
    dashboard: 'Dashboard',
    store: 'Store',
    earn: 'Earn',
    setting: 'Settings',
    profile: 'Profile',
    needMorePoints: 'Need More Points?',
    watchAdToEarn: 'Watch a short video sponsor to earn +5 points instantly!',
    watchAdBtn: 'Watch Video (+5 Points)',
    bufferingAd: 'Buffering Ad...',
    exclusiveInventory: 'Exclusive Inventory Marketplace',
    locked: 'Locked',
    redeem: 'Redeem',
    authTitle: 'AdQuest Registry',
    authSubtitle: 'Initialize your NoSQL token balance by generating unique companion profiles.',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    securityKey: 'Security Key',
    generateProfile: 'Generate Referral Profile',
    authenticateUser: 'Authenticate User',
    yourReferralCode: 'Your Referral Promo Code',
    validateInvite: 'Validate Invite Promo',
    promoFeedbackDesc: 'Insert a friend’s active code below. Valid once per document session. Generates mutual +100 point credits.',
    authorizeInvitation: 'Authorize Invitation',
    connections: 'Active Connections',
    noConnections: 'No invite records found. Invite companions using your code!',
    signout: 'Sign out of profile',
    theme: 'Theme',
    language: 'Language',
    adsWatched: 'Ads Watched',
    verifiedGold: 'Verified Gold',
    codeUtilized: 'Promo Code Utilized',
    pointsClaimed: '+5 Points Claimed!',
    redeemSuccess: 'Redemption Completed!',
    activeReceipt: 'Active receipt generated securely in collection database log.',
    returnStore: 'Return to Store',
    gameTab: 'Arcade',
    gameTitle: 'AdQuest Play Zone',
    activeMultiplier: 'Active Multiplier',
    cooldownStatus: 'Reward Ad Cooldown',
    doublePointsActive: '⚡ 2X DOUBLE BOOST ACTIVE!',
    unlockPremium: 'Unlock Premium Live Challenge',
    triviaQuest: 'Trivia Challenge',
    coinTapper: 'Golden Coin Tapper',
    selectAnswer: 'Verify Answer',
    interstitialTitle: 'AdMob Interstitial Ad',
    interstitialClose: 'Skip Ad & Return',
    interstitialCounting: 'Ad closes in {s}s',
    bannerSponsor: 'SPONSORED LINK'
  },
  am: {
    rewardCenter: 'የሽልማት ማዕከል',
    dashboard: 'ዳሽቦርድ',
    store: 'ሱቅ',
    earn: 'ነጥብ አግኝ',
    setting: 'ማስተካከያዎች',
    profile: 'የእኔ ማህደር',
    needMorePoints: 'ተጨማሪ ነጥብ ይፈልጋሉ?',
    watchAdToEarn: 'ፈጣን +5 ነጥብ ለማግኘት አጭር የማስታወቂያ ቪዲዮ ይመልከቱ!',
    watchAdBtn: 'ቪዲዮ ይመልከቱ (+5 ነጥቦች)',
    bufferingAd: 'ቪዲዮ በመጫን ላይ...',
    exclusiveInventory: 'የሽልማት ምርቶች ዝርዝር',
    locked: 'ተቆልፏል',
    redeem: 'ይውሰዱ',
    authTitle: 'የAdQuest ምዝገባ',
    authSubtitle: 'ልዩ መለያዎችን በመፍጠር የNoSQL ነጥብዎን ያስጀምሩ።',
    signIn: 'ይግቡ',
    signUp: 'ይመዝገቡ',
    fullName: 'ሙሉ ስም',
    emailAddress: 'ኢሜይል አድራሻ',
    securityKey: 'የደህንነት ቁልፍ',
    generateProfile: 'የግብዣ መለያ ፍጠር',
    authenticateUser: 'መለያ አረጋግጥ',
    yourReferralCode: 'የእርስዎ የግብዣ ኮድ',
    validateInvite: 'የግብዣ ኮድ አረጋግጥ',
    promoFeedbackDesc: 'የጓደኛዎን የግብዣ ኮድ ከታች ያስገቡ። ለአንድ የስራ ጊዜ ብቻ የሚያገለግል። ሁለታችሁም +100 ነጥብ ታገኛላችሁ።',
    authorizeInvitation: 'ግብዣውን ተቀበል',
    connections: 'ገባሪ ግንኙነቶች',
    noConnections: 'ምንም የግብዣ መዝገብ አልተገኘም። ኮድዎን በመጠቀም ጓደኞችዎን ይጋብዙ!',
    signout: 'ከመለያ ውጣ',
    theme: 'ገጽታ',
    language: 'ቋንቋ',
    adsWatched: 'የታዩ ማስታወቂያዎች',
    verifiedGold: 'የተረጋገጠ ወርቅ',
    codeUtilized: 'ኮድ ጥቅም ላይ ውሏል',
    pointsClaimed: '+5 ነጥብ ተጨምሯል!',
    redeemSuccess: 'ልውውጡ ተጠናቆል!',
    activeReceipt: 'ደረሰኝ በደህንነት ረገድ በዳታቤዝ ውስጥ ተመዝግቧል።',
    returnStore: 'ወደ ሱቅ ይመለሱ',
    gameTab: 'ጨዋታ',
    gameTitle: 'የጨዋታ ማዕከል',
    activeMultiplier: 'የነጥብ ማባዣ',
    cooldownStatus: 'ቀጣይ ማስታወቂያ ለመመልከት',
    doublePointsActive: '⚡ ባለ 2 እጥፍ ማባዣ እያገለገለ ነው!',
    unlockPremium: 'ልዩ ፈተናዎችን ይክፈቱ',
    triviaQuest: 'የጥያቄና መልስ ውድድር',
    coinTapper: 'የወርቅ ሳንቲም ንካ',
    selectAnswer: 'መልስ አረጋግጥ',
    interstitialTitle: 'AdMob መካከለኛ ማስታወቂያ',
    interstitialClose: 'ዝለልና ተመለስ',
    interstitialCounting: 'በ {s} ሰከንድ ውስጥ ይዘጋል',
    bannerSponsor: 'የማስታወቂያ ስፖንሰር'
  }
};

const MOCK_BANNER_ADS = [
  { text: "Safaricom 5G Home Internet - Superfast speeds from 500 Pts!", action: "Join Safaricom Campaign", url: "https://safaricom.et/promo-5g" },
  { text: "Ethio Telecom LTE Boost - Double your data bandwidth package!", action: "Claim Ethio Promo", url: "https://ethiotelecom.et/lte-boost" },
  { text: "Merge Luxury Saga - Compile Card Decks to unlock exclusive bonuses!", action: "Download Now", url: "https://adquest.game/mergeluxury" },
  { text: "Jolly's Coffee House - 15% discount code for certified developers: DEVPTS!", action: "Open Maps Coupon", url: "https://jollyscoffee.et/maps" }
];

const TRIVIA_QUESTIONS = [
  {
    en: {
      question: "Which ancient obelisk is located in Northern Ethiopia?",
      options: ["Obelisk of Axum", "Lalibela monolith", "Gondar Castle", "Tiya stones"],
      correctIndex: 0,
      reward: 5
    },
    am: {
      question: "በሰሜን ኢትዮጵያ የሚገኘው ታሪካዊ ሐውልት የትኛው ነው?",
      options: ["የአክሱም ሐውልት", "የአለት ውቅር", "የጎንደር ግንብ", "የቲያ ትከሎች"],
      correctIndex: 0,
      reward: 5
    }
  },
  {
    en: {
      question: "What is Flutter's primary programming language?",
      options: ["Kotlin", "Java", "Swift", "Dart"],
      correctIndex: 3,
      reward: 5
    },
    am: {
      question: "በFlutter ልማት ውስጥ የሚመረጠው ዋና ፕሮግራሚንግ ቋንቋ ምንድነው?",
      options: ["Kotlin", "Java", "Swift", "Dart"],
      correctIndex: 3,
      reward: 5
    }
  },
  {
    en: {
      question: "Which telecom operator launched Ethiopia's second active mobile network?",
      options: ["Airtel", "Ethio Telecom", "Safaricom Ethiopia", "Vodacom"],
      correctIndex: 2,
      reward: 5
    },
    am: {
      question: "በኢትዮጵያ ሁለተኛውን የሞባይል ኔትወርክ ያስጀመረው የቴሌኮም ኩባንያ የትኛው ነው?",
      options: ["Airtel", "ኢትዮ ቴሌኮም", "ሳፋሪኮም ኢትዮጵያ", "Vodacom"],
      correctIndex: 2,
      reward: 5
    }
  }
];

export default function App() {
  // --- Translation Context Helpers ---
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const t = TRANSLATIONS[language];

  // --- Persistent Storage State ---
  const [users, setUsers] = useState<UserDocument[]>(() => {
    const saved = localStorage.getItem('adquest_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [referrals, setReferrals] = useState<ReferralDocument[]>(() => {
    const saved = localStorage.getItem('adquest_referrals');
    return saved ? JSON.parse(saved) : INITIAL_REFERRALS;
  });

  const [storeItems, setStoreItems] = useState<StoreDocument[]>(() => {
    const saved = localStorage.getItem('adquest_store');
    return saved ? JSON.parse(saved) : INITIAL_STORE_INVENTORY;
  });

  const [purchases, setPurchases] = useState<PurchaseDocument[]>(() => {
    const saved = localStorage.getItem('adquest_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [logs, setLogs] = useState<SystemLog[]>([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('adquest_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('adquest_referrals', JSON.stringify(referrals));
  }, [referrals]);

  useEffect(() => {
    localStorage.setItem('adquest_store', JSON.stringify(storeItems));
  }, [storeItems]);

  useEffect(() => {
    localStorage.setItem('adquest_purchases', JSON.stringify(purchases));
  }, [purchases]);

  // --- Session Control ---
  const [activeUid, setActiveUid] = useState<string>('user_alex');
  const [activeAppId, setActiveAppId] = useState<string>('app_1');
  const currentUser = users.find(u => u.uid === activeUid) || null;

  // --- Active Tab in Main Web App Dashboard ---
  const [activeDashboardTab, setActiveDashboardTab] = useState<'database' | 'code' | 'logs' | 'admob'>('database');
  
  // --- Active Tab for Flutter Source Code Center ---
  const [activeCodeFileIndex, setActiveCodeFileIndex] = useState<number>(1); // Default to main.dart

  // --- AdMob Live Configuration Credentials ---
  const [admobAndroidAppId, setAdmobAndroidAppId] = useState<string>(() => {
    const saved = localStorage.getItem('admob_android_app_id');
    return (saved && saved !== 'ca-app-pub-9941569032488107~3347511713') ? saved : 'ca-app-pub-9941569032488107~4008134557';
  });
  const [admobIosAppId, setAdmobIosAppId] = useState<string>(() => {
    const saved = localStorage.getItem('admob_ios_app_id');
    return (saved && saved !== 'ca-app-pub-9941569032488107~1458002511') ? saved : 'ca-app-pub-9941569032488107~4008134557';
  });
  const [admobAndroidAdUnitId, setAdmobAndroidAdUnitId] = useState<string>(() => {
    const saved = localStorage.getItem('admob_android_ad_unit_id');
    return (saved && saved !== 'ca-app-pub-3940256099942544/5224354917') ? saved : 'ca-app-pub-9941569032488107/1397112225';
  });
  const [admobIosAdUnitId, setAdmobIosAdUnitId] = useState<string>(() => {
    const saved = localStorage.getItem('admob_ios_ad_unit_id');
    return (saved && saved !== 'ca-app-pub-3940256099942544/1712485313') ? saved : 'ca-app-pub-9941569032488107/1397112225';
  });

  useEffect(() => {
    localStorage.setItem('admob_android_app_id', admobAndroidAppId);
  }, [admobAndroidAppId]);

  useEffect(() => {
    localStorage.setItem('admob_ios_app_id', admobIosAppId);
  }, [admobIosAppId]);

  useEffect(() => {
    localStorage.setItem('admob_android_ad_unit_id', admobAndroidAdUnitId);
  }, [admobAndroidAdUnitId]);

  useEffect(() => {
    localStorage.setItem('admob_ios_ad_unit_id', admobIosAdUnitId);
  }, [admobIosAdUnitId]);

  // --- Mobile Screen State Simulation ---
  const [mobileScreen, setMobileScreen] = useState<'auth' | 'dashboard' | 'store' | 'referral' | 'setting' | 'game'>('dashboard');
  const [settingSubView, setSettingSubView] = useState<'main' | 'about'>('main');
  const [isAuthSignUp, setIsAuthSignUp] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Referral Entry State
  const [enteredReferralCode, setEnteredReferralCode] = useState<string>('');
  const [referralFeedback, setReferralFeedback] = useState<{ success: boolean; text: string } | null>(null);

  // --- AdMob RewardedAd Simulator States ---
  const [showAdOverlay, setShowAdOverlay] = useState<boolean>(false);
  const [adPlaybackTimer, setAdPlaybackTimer] = useState<number>(5);
  const [adIsPlaying, setAdIsPlaying] = useState<boolean>(false);
  const [adVolumeMuted, setAdVolumeMuted] = useState<boolean>(false);
  const [adCompleted, setAdCompleted] = useState<boolean>(false);

  // --- New AdMob spacing, format mixing, and addictive gameplay integration states ---
  const [rewardedCooldownLeft, setRewardedCooldownLeft] = useState<number>(0);
  const [boostTimeLeft, setBoostTimeLeft] = useState<number>(0);
  const [showInterstitial, setShowInterstitial] = useState<boolean>(false);
  const [interstitialPlaybackTimer, setInterstitialPlaybackTimer] = useState<number>(3);
  const [currentBannerAdIndex, setCurrentBannerAdIndex] = useState<number>(0);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [activeSpeedTesting, setActiveSpeedTesting] = useState<boolean>(false);

  // Game Play Zone State declarations
  const [gameMode, setGameMode] = useState<'trivia' | 'tapper'>('trivia');
  const [activeTriviaIndex, setActiveTriviaIndex] = useState<number>(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [answerIsCorrect, setAnswerIsCorrect] = useState<boolean | null>(null);

  // Coin Tapper Grid Cell
  const [activeCoinCell, setActiveCoinCell] = useState<number>(0);
  const [tapScore, setTapScore] = useState<number>(0);

  // Confetti / Float Points animations triggers
  const [showPointsFloating, setShowPointsFloating] = useState<boolean>(false);
  const [showRedeemConfetti, setShowRedeemConfetti] = useState<boolean>(false);
  const [purchasedTitle, setPurchasedTitle] = useState<string>('');

  // Log system helper
  const addLog = (type: 'auth' | 'ad' | 'referral' | 'purchase' | 'system', message: string) => {
    const newLog: SystemLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  // Seed initial logs
  useEffect(() => {
    addLog('system', 'Simulated Google Mobile Ads & Firebase instance initialized successfully.');
    addLog('system', 'Mock Cloud Firestore seeded with user credentials and 6 marketplace items.');
  }, []);

  // Sync mobile screen to auth state: if no logged-in user, force auth view
  useEffect(() => {
    if (!currentUser) {
      setMobileScreen('auth');
    } else if (mobileScreen === 'auth') {
      setMobileScreen('dashboard');
    }
  }, [currentUser]);

  // Handle active countdown of simulated advertisement
  useEffect(() => {
    let interval: any;
    if (showAdOverlay && adIsPlaying && adPlaybackTimer > 0) {
      interval = setInterval(() => {
        setAdPlaybackTimer(prev => prev - 1);
      }, 1000);
    } else if (showAdOverlay && adPlaybackTimer === 0 && adIsPlaying) {
      setAdIsPlaying(false);
      setAdCompleted(true);
      addLog('ad', 'SDK Event: onUserEarnedReward - User completed reward video watching.');
    }
    return () => clearInterval(interval);
  }, [showAdOverlay, adIsPlaying, adPlaybackTimer]);

  // Hook 1: Reward cooldown and multiplier boost duration ticking
  useEffect(() => {
    const timer = setInterval(() => {
      if (rewardedCooldownLeft > 0) {
        setRewardedCooldownLeft(prev => prev - 1);
      }
      if (boostTimeLeft > 0) {
        setBoostTimeLeft(prev => prev - 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [rewardedCooldownLeft, boostTimeLeft]);

  // Hook 2: Interstitial simulation count down
  useEffect(() => {
    let interval: any;
    if (showInterstitial && interstitialPlaybackTimer > 0) {
      interval = setInterval(() => {
        setInterstitialPlaybackTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showInterstitial, interstitialPlaybackTimer]);

  // Hook 3: Banner Ad selection index progression (cycles every 8s)
  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBannerAdIndex(prev => (prev + 1) % MOCK_BANNER_ADS.length);
    }, 8000);
    return () => clearInterval(bannerInterval);
  }, []);

  // Hook 4: Coin clicker layout spawner (ticks every 1.5s in active tapper mode)
  useEffect(() => {
    let interval: any;
    if (mobileScreen === 'game' && gameMode === 'tapper') {
      interval = setInterval(() => {
        setActiveCoinCell(Math.floor(Math.random() * 6));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [mobileScreen, gameMode]);

  // --- Handlers mimicking mobile backend operations ---

  // User Sign-In Simulator
  const handleMobileSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authEmail || !authPassword) {
      setAuthError('Please fill out all credentials fields.');
      return;
    }

    const matched = users.find(u => u.email.toLowerCase() === authEmail.toLowerCase());
    if (matched) {
      setActiveUid(matched.uid);
      setAuthEmail('');
      setAuthPassword('');
      addLog('auth', `Auth Success: Signed in account info for user: ${matched.name} (${matched.email})`);
      setMobileScreen('dashboard');
    } else {
      setAuthError('Invalid credentials. (Try alexbahre@gmail.com with any pass)');
    }
  };

  // User Registration with Name prefix + 4 random digits referral code token generator
  const handleMobileSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authName || !authEmail || !authPassword) {
      setAuthError('All registration fields are required.');
      return;
    }

    const emailInUse = users.some(u => u.email.toLowerCase() === authEmail.toLowerCase());
    if (emailInUse) {
      setAuthError('This email is already registered in Firestore.');
      return;
    }

    // Generate custom code (first 3 capitalized letters of name + 4 digit random suffix)
    let prefix = authName.replace(/[^A-Za-z]/g, '').toUpperCase();
    if (prefix.length < 3) {
      prefix = (prefix + 'AAA').substring(0, 3);
    } else {
      prefix = prefix.substring(0, 3);
    }
    const randDigits = Math.floor(1000 + Math.random() * 9000).toString();
    const generatedReferralCode = `${prefix}${randDigits}`;

    const newUid = `user_${Math.random().toString(36).substring(5)}`;
    const newProfile: UserDocument = {
      uid: newUid,
      name: authName,
      email: authEmail,
      pointsBalance: 0,
      appPoints: {},
      lifetimeAdsWatched: 0,
      myReferralCode: generatedReferralCode,
      referredBy: 'none'
    };

    setUsers(prev => [...prev, newProfile]);
    setActiveUid(newUid);
    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
    setIsAuthSignUp(false);
    
    addLog('auth', `Database Transaction: Generated profile for '${newProfile.name}' in USERS collection with unique code: ${generatedReferralCode}`);
    setMobileScreen('dashboard');
  };

  // Switch Quick Profile inside Dashboard
  const handleQuickSwapProfile = (uid: string) => {
    setActiveUid(uid);
    addLog('system', `Console Swap: Changed active simulator session to User @${users.find(u => u.uid === uid)?.name}`);
  };

  // Trigger Google Mobile Ads SDK Simulator Overlay
  const startAdMobVideoPlayback = () => {
    if (rewardedCooldownLeft > 0) {
      addLog('ad', `AdMob RateLimit: Rewarded video is in cooldown. Please wait ${Math.floor(rewardedCooldownLeft / 60)}m ${rewardedCooldownLeft % 60}s before requesting a new reward.`);
      return;
    }
    setAdPlaybackTimer(5);
    setAdCompleted(false);
    setAdIsPlaying(true);
    setShowAdOverlay(true);
    addLog('ad', `AdMob Request: loading ${admobAndroidAdUnitId} RewardedAd.`);
  };

  // Confirm reward and trigger state increments
  const handleAdMobRewardConsent = () => {
    if (!currentUser) return;

    const hasBoost = boostTimeLeft > 0;
    const ptsEarned = hasBoost ? 10 : 5; // 2x multiplier applies to the reward ad watch itself!
    
    // Limits watch to 1 video every 15-30 mins; we'll use 15 mins (900 seconds) by default
    // If activeSpeedTesting is true, we compress to 15 seconds cooldown and 30 seconds boost
    const cooldownDuration = activeSpeedTesting ? 15 : 905; 
    const boostDuration = activeSpeedTesting ? 30 : 600; // 10 minutes of active boost multiplier!

    setRewardedCooldownLeft(cooldownDuration);
    setBoostTimeLeft(boostDuration);

    // Increment pointsBalance and lifetimeAdsWatched atomically, also updating active appPoints
    const updatedUsers = users.map(user => {
      if (user.uid === currentUser.uid) {
        const currentAppPoints = { ...(user.appPoints || {}) };
        currentAppPoints[activeAppId] = (currentAppPoints[activeAppId] || 0) + ptsEarned;
        return {
          ...user,
          appPoints: currentAppPoints,
          pointsBalance: user.pointsBalance + ptsEarned,
          lifetimeAdsWatched: user.lifetimeAdsWatched + 1
        };
      }
      return user;
    });

    setUsers(updatedUsers);
    setShowAdOverlay(false);
    setShowPointsFloating(true);
    setTimeout(() => {
      setShowPointsFloating(false);
    }, 2850);

    addLog('ad', `Firestore Transaction SUCCESS: Awarded +${ptsEarned} points (assigned to app ${MOCK_APPS.find(a=>a.id === activeAppId)?.name}) to ${currentUser.name} (Multiplier Boost: ${hasBoost ? 'ACTIVE (+10)' : 'INACTIVE (+5)'}). Cooldown initiated.`);
  };

  // Banner Ad interactions
  const handleBannerAdClick = (ad: typeof MOCK_BANNER_ADS[0]) => {
    if (!currentUser) return;
    
    const boostActive = boostTimeLeft > 0;
    const pointsAwarded = boostActive ? 2 : 1; 

    const updatedUsers = users.map(user => {
      if (user.uid === currentUser.uid) {
        const currentAppPoints = { ...(user.appPoints || {}) };
        currentAppPoints[activeAppId] = (currentAppPoints[activeAppId] || 0) + pointsAwarded;
        return {
          ...user,
          appPoints: currentAppPoints,
          pointsBalance: user.pointsBalance + pointsAwarded
        };
      }
      return user;
    });
    setUsers(updatedUsers);
    
    addLog('ad', `AdMob Engagement: Clicked Adaptive Banner "${ad.text.split(' - ')[0]}". Awarded +${pointsAwarded} points to app ${MOCK_APPS.find(a=>a.id === activeAppId)?.name} (Multiplier: ${boostActive ? '2X Active' : 'Off'}).`);
    
    setShowPointsFloating(true);
    setTimeout(() => {
      setShowPointsFloating(false);
    }, 1500);
  };

  // Switch mobile screen with interstitial breaks on tab changes
  const handleMobileScreenChange = (screen: 'auth' | 'dashboard' | 'store' | 'referral' | 'setting' | 'game') => {
    setMobileScreen(screen);
    setSettingSubView('main');
    
    // Add tab switch tracker
    setTabSwitchCount(prev => {
      const next = prev + 1;
      // Every 3 tab swaps, trigger interstitial ad seamlessly to represent real full-stack design!
      if (next % 3 === 0) {
        setInterstitialPlaybackTimer(3);
        setShowInterstitial(true);
        addLog('ad', `AdMob Interstitial Ad Request: Loading natural interstitial break on transition to '${screen.toUpperCase()}' screen.`);
      }
      return next;
    });
  };

  // Trivia Quiz arcade state handlers
  const handleTriviaAnswerSelect = (optionIndex: number) => {
    if (answerSubmitted) return;
    setSelectedAnswerIndex(optionIndex);
  };

  const handleTriviaVerification = () => {
    if (selectedAnswerIndex === null || !currentUser) return;
    
    const activeQuestion = TRIVIA_QUESTIONS[activeTriviaIndex];
    const currentQ = language === 'am' ? activeQuestion.am : activeQuestion.en;
    const isCorrect = selectedAnswerIndex === currentQ.correctIndex;
    
    setAnswerSubmitted(true);
    setAnswerIsCorrect(isCorrect);
    
    if (isCorrect) {
      const boostActive = boostTimeLeft > 0;
      const pointsToAward = boostActive ? (currentQ.reward * 2) : currentQ.reward;
      
      const updatedUsers = users.map(user => {
        if (user.uid === currentUser.uid) {
          const currentAppPoints = { ...(user.appPoints || {}) };
          currentAppPoints[activeAppId] = (currentAppPoints[activeAppId] || 0) + pointsToAward;
          return {
            ...user,
            appPoints: currentAppPoints,
            pointsBalance: user.pointsBalance + pointsToAward
          };
        }
        return user;
      });
      setUsers(updatedUsers);
      addLog('purchase', `Trivia Challenge Complete: Answer is CORRECT! Earned +${pointsToAward} points. Multiplier: ${boostActive ? '2X' : '1X'}`);
    } else {
      addLog('purchase', `Trivia Challenge Complete: Answer is INCORRECT. Correct option was ${currentQ.options[currentQ.correctIndex]}. No points gained.`);
    }

    // 40% chance of triggering interstitial on question answer submission mapping natural gaming transitions
    if (Math.random() < 0.4) {
      setTimeout(() => {
        setInterstitialPlaybackTimer(3);
        setShowInterstitial(true);
        addLog('ad', `AdMob Interstitial: Seamlessly triggered interstitial ad break after Trivia verification.`);
      }, 1000);
    }
  };

  const handleNextTriviaQuestion = () => {
    setSelectedAnswerIndex(null);
    setAnswerSubmitted(false);
    setAnswerIsCorrect(null);
    setActiveTriviaIndex((prev) => (prev + 1) % TRIVIA_QUESTIONS.length);
  };

  // Coin Tapper quick tapper score accumulator
  const handleCoinTap = (index: number) => {
    if (index === activeCoinCell && currentUser) {
      const boostActive = boostTimeLeft > 0;
      const pointsAdded = boostActive ? 2 : 1;

      // Update balance
      const updatedUsers = users.map(user => {
        if (user.uid === currentUser.uid) {
          const currentAppPoints = { ...(user.appPoints || {}) };
          currentAppPoints[activeAppId] = (currentAppPoints[activeAppId] || 0) + pointsAdded;
          return {
            ...user,
            appPoints: currentAppPoints,
            pointsBalance: user.pointsBalance + pointsAdded
          };
        }
        return user;
      });
      setUsers(updatedUsers);
      setTapScore(prev => prev + pointsAdded);
      addLog('purchase', `Tapper Action: Captured Golden Coin! Earned +${pointsAdded} points. Multiplier: ${boostActive ? '2X' : '1X'}`);

      // Shift coin randomly immediately
      setActiveCoinCell(Math.floor(Math.random() * 6));
    }
  };

  // Secure Firestore Referral Transaction Simulation
  const handleReferralSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setReferralFeedback(null);

    const code = enteredReferralCode.trim().toUpperCase();
    if (!currentUser) return;

    if (!code) {
      setReferralFeedback({ success: false, text: 'Please input an invite code.' });
      return;
    }

    // Criteria 1: Check if current user referredBy equals 'none'
    if (currentUser.referredBy !== 'none') {
      setReferralFeedback({ success: false, text: 'Transaction Failed: You have already applied a referral code.' });
      addLog('referral', `Denial Code: User ${currentUser.name} attempted self/multiple invite submission`);
      return;
    }

    // Criteria 2: Search database for the owner code
    const hostUser = users.find(u => u.myReferralCode === code);
    if (!hostUser) {
      setReferralFeedback({ success: false, text: 'Transaction Failed: Code does not exist in USERS collection.' });
      addLog('referral', `Denial Code: Code ${code} is invalid or doesn't belong to any account.`);
      return;
    }

    // Criteria 3: Ensure self-referral rule is protected
    if (hostUser.uid === currentUser.uid) {
      setReferralFeedback({ success: false, text: 'Transaction Failed: Self-referrals are strictly prohibited.' });
      addLog('referral', `Denial Code: User ${currentUser.name} attempted self-referral using own code ${code}`);
      return;
    }

    // Criteria 4: Atomic Multi-document write: Award +100 to both, set referredBy of current to partner uid
    const updatedUsers = users.map(user => {
      if (user.uid === currentUser.uid) {
        const currentAppPoints = { ...(user.appPoints || {}) };
        currentAppPoints[activeAppId] = (currentAppPoints[activeAppId] || 0) + 100;
        return {
          ...user,
          appPoints: currentAppPoints,
          pointsBalance: user.pointsBalance + 100,
          referredBy: hostUser.uid
        };
      }
      if (user.uid === hostUser.uid) {
        const currentAppPoints = { ...(user.appPoints || {}) };
        currentAppPoints[activeAppId] = (currentAppPoints[activeAppId] || 0) + 100;
        return {
          ...user,
          appPoints: currentAppPoints,
          pointsBalance: user.pointsBalance + 100
        };
      }
      return user;
    });

    const newReferralRecord: ReferralDocument = {
      id: `ref_${Math.floor(100000 + Math.random() * 900000)}`,
      referrerUid: hostUser.uid,
      referredUid: currentUser.uid,
      pointsAwarded: 100,
      timestamp: new Date().toISOString()
    };

    setUsers(updatedUsers);
    setReferrals(prev => [newReferralRecord, ...prev]);
    setEnteredReferralCode('');
    setReferralFeedback({ success: true, text: `Code Redeemed! Added +100 points to you and @${hostUser.name}.` });
    
    addLog('referral', `Firestore Multi-Doc Write: Atomic transaction set user's referredBy='${hostUser.uid}', added 100 points to both @${currentUser.name} and @${hostUser.name}, generated system audit logging id: ${newReferralRecord.id}`);
  };

  // Secure Firestore Purchase Transaction Simulation
  const handleMarketplacePurchase = (item: StoreDocument) => {
    if (!currentUser) return;

    if (currentUser.pointsBalance < item.pointsCost) {
      addLog('purchase', `Blocked transaction: Insufficient point metrics for item '${item.title}'`);
      return;
    }

    // Execute atomic write deducting points and rendering receipts
    const updatedUsers = users.map(user => {
      if (user.uid === currentUser.uid) {
        const currentAppPoints = { ...(user.appPoints || {}) };
        const currentActiveAppPts = currentAppPoints[activeAppId] || 0;
        currentAppPoints[activeAppId] = Math.max(0, currentActiveAppPts - item.pointsCost);
        return {
          ...user,
          appPoints: currentAppPoints,
          pointsBalance: Math.max(0, user.pointsBalance - item.pointsCost)
        };
      }
      return user;
    });

    const newPurchaseReceipt: PurchaseDocument = {
      id: `rcpt_${Math.floor(1000 + Math.random() * 9000)}`,
      uid: currentUser.uid,
      itemId: item.itemId,
      title: item.title,
      pointsCost: item.pointsCost,
      timestamp: new Date().toISOString()
    };

    setUsers(updatedUsers);
    setPurchases(prev => [newPurchaseReceipt, ...prev]);
    
    // Confetti and floating modal details
    setPurchasedTitle(item.title);
    setShowRedeemConfetti(true);
    setTimeout(() => {
      setShowRedeemConfetti(false);
    }, 3500);

    addLog('purchase', `Firestore transaction SUCCESS: Deducted ${item.pointsCost} pts from @${currentUser.name} for ${item.title}. Log receipt created as ${newPurchaseReceipt.id}`);
  };

  // Reset local database simulated values
  const handleWipeDatabase = () => {
    localStorage.removeItem('adquest_users');
    localStorage.removeItem('adquest_referrals');
    localStorage.removeItem('adquest_store');
    localStorage.removeItem('adquest_purchases');
    setUsers(INITIAL_USERS);
    setReferrals(INITIAL_REFERRALS);
    setStoreItems(INITIAL_STORE_INVENTORY);
    setPurchases([]);
    setActiveUid('user_alex');
    setMobileScreen('dashboard');
    setEnteredReferralCode('');
    setReferralFeedback(null);
    addLog('system', 'Global Reset: Restored Firestore simulated databases to developer defaults.');
  };

  // Developer rapid booster
  const handleGrantTestPoints = () => {
    if (!currentUser) return;
    const updated = users.map(user => {
      if (user.uid === currentUser.uid) {
        return { ...user, pointsBalance: user.pointsBalance + 1000 };
      }
      return user;
    });
    setUsers(updated);
    addLog('system', `Developer Action: Added +1,000 points to @${currentUser.name} in virtual database.`);
  };

  // Clipboard copies
  const handleCopyCodeToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addLog('system', `Copied Flutter code file target snippet to clipboard.`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 flex flex-col font-sans selection:bg-gold-400 selection:text-black" id="main-frame-root">
      
      {/* HEADER BAR */}
      <header className="border-b border-zinc-900 bg-[#0d0d0d]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40" id="top-navbar-core">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-gradient-to-tr from-gold-600 to-gold-400 text-black rounded-xl shadow-lg shadow-gold-500/5 ring-1 ring-gold-500/20">
            <Smartphone className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-serif font-black tracking-widest text-[#f5edcb] text-base uppercase">AdQuest Mobile Panel</span>
              <span className="text-[9px] bg-gold-400/10 text-gold-400 font-mono tracking-wider px-2 py-0.5 rounded border border-gold-400/20 uppercase font-bold">
                Flutter SDK Sandbox
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-sans tracking-wide">Interactive Firebase & AdMob Rewarded Interstitial Sandbox Emulator</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {currentUser && (
            <div className="hidden sm:flex items-center bg-[#121212]/90 border border-zinc-900 rounded-lg p-2 space-x-3 shadow-md">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-xs font-serif font-extrabold text-black shadow-inner shadow-black/40">
                {currentUser.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-zinc-200 tracking-tight">{currentUser.name}</p>
                <div className="flex items-center space-x-1 text-zinc-500">
                  <Coins className="w-3 text-gold-400" />
                  <span className="font-mono text-gold-400 font-semibold">{currentUser.pointsBalance} Pts</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 bg-[#0c0c0c] p-1 rounded-lg border border-zinc-900">
            {/* Language Selection */}
            <button
              onClick={() => {
                setLanguage('en');
                addLog('system', 'Language configured to English');
              }}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${language === 'en' ? 'bg-gold-500 text-black' : 'text-zinc-400 hover:text-zinc-200'}`}
              title="Switch to English"
            >
              🇺🇸 EN
            </button>
            <button
              onClick={() => {
                setLanguage('am');
                addLog('system', 'Language configured to Amharic (አማርኛ)');
              }}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${language === 'am' ? 'bg-gold-500 text-black' : 'text-zinc-400 hover:text-zinc-200'}`}
              title="ባማርኛ ቀይር"
            >
              🇪🇹 አማ
            </button>
          </div>

          <div className="flex items-center space-x-2 bg-[#0c0c0c] p-1 rounded-lg border border-zinc-900">
            {/* Theme Selection */}
            <button
              onClick={() => {
                setThemeMode('light');
                addLog('system', 'App theme simulated to LIGHT mode');
              }}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${themeMode === 'light' ? 'bg-zinc-200 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Theme: Simulated Light mode"
            >
              ☀️ Light
            </button>
            <button
              onClick={() => {
                setThemeMode('dark');
                addLog('system', 'App theme simulated to DARK mode');
              }}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${themeMode === 'dark' ? 'bg-zinc-800 text-gold-400 border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Theme: Simulated Dark mode"
            >
              🌙 Dark
            </button>
          </div>

          <div className="flex items-center space-x-2 bg-[#0c0c0c] z-10">
            <button 
              onClick={handleWipeDatabase}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-950/5 hover:bg-red-950/20 text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer transition-all duration-150"
              title="Reset Simulated Database and cache values"
              id="btn-wipe-db"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD INTEGRATION VIEWPORT */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6" id="dashboard-mesh-grid">
        
        {/* LEFT PANEL: DATABASE, CODING FRAMEWORK, DIAGNOSTIC STREAM */}
        <section className="col-span-1 xl:col-span-7 flex flex-col space-y-6" id="dashboard-left-deck">
          
          {/* TAB SYSTEM */}
          <div className="bg-[#0a0a0a] p-1 rounded-xl border border-zinc-900 flex space-x-1 shadow-lg" id="dash-tabs">
            <button
              onClick={() => setActiveDashboardTab('database')}
              className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold font-sans tracking-wider uppercase transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer ${
                activeDashboardTab === 'database'
                  ? 'bg-[#141414] text-gold-400 shadow-xl border-b-2 border-gold-400'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#0c0c0c]'
              }`}
              id="tab-btn-db"
            >
              <Database className="w-4 h-4" />
              <span>Firestore Browser</span>
            </button>
            <button
              onClick={() => setActiveDashboardTab('code')}
              className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold font-sans tracking-wider uppercase transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer ${
                activeDashboardTab === 'code'
                  ? 'bg-[#141414] text-gold-400 shadow-xl border-b-2 border-gold-400'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#0c0c0c]'
              }`}
              id="tab-btn-code"
            >
              <Code className="w-4 h-4" />
              <span>Dart Resource Code</span>
            </button>
            <button
              onClick={() => setActiveDashboardTab('logs')}
              className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold font-sans tracking-wider uppercase transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer ${
                activeDashboardTab === 'logs'
                  ? 'bg-[#141414] text-gold-400 shadow-xl border-b-2 border-gold-400'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#0c0c0c]'
              }`}
              id="tab-btn-logs"
            >
              <Activity className="w-4 h-4" />
              <span>Console Protocol</span>
            </button>
            <button
              onClick={() => setActiveDashboardTab('admob')}
              className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold font-sans tracking-wider uppercase transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer ${
                activeDashboardTab === 'admob'
                  ? 'bg-[#141414] text-gold-400 shadow-xl border-b-2 border-gold-400'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#0c0c0c]'
              }`}
              id="tab-btn-admob"
            >
              <Video className="w-4 h-4" />
              <span>AdMob Setup</span>
            </button>
          </div>

          {/* FIRESTORE COLLECTION INSPECTOR */}
          {activeDashboardTab === 'database' && (
            <div className="bg-[#0d0d0d] border border-zinc-900 rounded-xl p-5 lg:p-6 flex flex-col space-y-5 shadow-2xl" id="db-inspector-card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5 text-gold-400 font-serif font-black tracking-widest text-sm uppercase">
                    <Database className="w-4 h-4 text-gold-400" />
                    <span>NoSQL Cloud Firestore Emulator</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-sans tracking-wide">Live transactional view of standard Firestore document registers.</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleGrantTestPoints}
                    className="px-3.5 py-1.5 bg-gradient-to-tr from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black text-xs font-bold rounded-lg flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-gold-500/5 hover:-translate-y-0.5 active:translate-y-0"
                    id="btn-earn-pts"
                  >
                    <Plus className="w-3.5 h-3.5 text-black stroke-[3]" />
                    <span>Grant +1,000 Points</span>
                  </button>
                </div>
              </div>

              {/* FIRESTORE COLLECTIONS SPLIT VIEW */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="collections-split">
                
                {/* COLLECTION: /users */}
                <div className="bg-[#090909] border border-zinc-900 rounded-lg p-4 flex flex-col shadow-inner">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
                    <span className="font-mono text-xs text-gold-400 font-bold">/users/&#123;uid&#125;</span>
                    <span className="text-[10px] bg-gold-400/10 text-gold-400 border border-gold-400/20 px-1.5 py-0.5 rounded font-mono">
                      {users.length} docs
                    </span>
                  </div>
                  
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {users.map(user => {
                      const isActive = user.uid === activeUid;
                      return (
                        <div 
                          key={user.uid}
                          className={`p-3 rounded-lg border text-xs transition-all pointer-events-auto cursor-pointer ${
                            isActive 
                              ? 'bg-[#121212]/95 border-gold-500/40 shadow-xl shadow-gold-500/5' 
                              : 'bg-[#020202]/30 border-zinc-900/60 hover:bg-[#111]/30 hover:border-zinc-800'
                          }`}
                          onClick={() => handleQuickSwapProfile(user.uid)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-serif font-black text-[#f5edcb] tracking-wide">{user.name}</span>
                              {isActive && (
                                <span className="text-[8px] bg-gold-400/20 text-gold-300 font-mono tracking-widest uppercase px-1.5 py-0.5 rounded font-black">
                                  Logged In
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[9px] text-zinc-500">{user.uid}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-zinc-500 font-mono text-[10px]">
                            <div className="truncate">Email: <span className="text-zinc-300">{user.email}</span></div>
                            <div className="text-right">Code: <span className="text-gold-400 font-bold">{user.myReferralCode}</span></div>
                            <div className="flex items-center space-x-1">
                              <span>Playback Counter:</span>
                              <span className="text-gold-400 font-bold bg-gold-400/5 px-1.5 py-0.2 rounded border border-gold-400/10">{user.lifetimeAdsWatched}</span>
                            </div>
                            <div className="text-right font-bold">
                              Points Balance: <span className="text-gold-400 font-black">{user.pointsBalance} Pts</span>
                            </div>
                            <div className="col-span-2 border-t border-zinc-900 pt-1.5 mt-1">
                              <div className="flex items-center justify-between text-[8.5px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
                                <span className={themeMode === 'light' ? 'text-zinc-600' : 'text-zinc-500'}>Multi-App Ledgers</span>
                                <span className="text-[7.5px] font-normal font-sans">Synced Collections</span>
                              </div>
                              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8.5px] bg-[#030303] p-1.5 rounded border border-zinc-900/60 font-mono">
                                {MOCK_APPS.map(app => {
                                  const pts = (user.appPoints && user.appPoints[app.id] !== undefined) ? user.appPoints[app.id] : 0;
                                  const isAppActive = app.id === activeAppId && isActive;
                                  return (
                                    <div key={app.id} className="flex justify-between truncate items-center">
                                      <span className={`${isAppActive ? 'text-gold-300 font-black' : 'text-zinc-500'}`}>
                                        • {app.shortName}:
                                      </span>
                                      <span className={`${pts > 0 ? (isAppActive ? 'text-gold-400 font-extrabold' : 'text-zinc-300') : 'text-zinc-600'}`}>
                                        {pts} Pts
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="col-span-2 border-t border-zinc-900 pt-1 mt-1 flex items-center justify-between text-[9px]">
                              <span>referredBy:</span>
                              <span className={`font-mono px-1.5 rounded ${user.referredBy === 'none' ? 'bg-zinc-900 text-zinc-500' : 'bg-gold-400/10 text-gold-300 border border-gold-400/10'}`}>
                                {user.referredBy}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* COLLECTION: /referrals */}
                <div className="bg-[#090909] border border-zinc-900 rounded-lg p-4 flex flex-col shadow-inner">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
                    <span className="font-mono text-xs text-gold-400 font-bold">/referrals/&#123;id&#125;</span>
                    <span className="text-[10px] bg-gold-400/10 text-gold-400 border border-gold-400/20 px-1.5 py-0.5 rounded font-mono">
                      {referrals.length} docs
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 flex-1">
                    {referrals.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600">
                        <Gift className="w-8 h-8 mb-2 opacity-30 text-gold-400" />
                        <p className="text-xs font-sans text-zinc-500">No referral audits tracked yet.</p>
                        <p className="text-[10px] text-zinc-600 mt-1 font-sans">Submit invitations in the device layout on the right to sync audit tracks.</p>
                      </div>
                    ) : (
                      referrals.map(ref => {
                        const referrer = users.find(u => u.uid === ref.referrerUid)?.name || ref.referrerUid;
                        const referred = users.find(u => u.uid === ref.referredUid)?.name || ref.referredUid;
                        return (
                          <div key={ref.id} className="p-2.5 bg-[#020202]/50 border border-zinc-900 rounded text-[11px] font-mono">
                            <div className="flex justify-between text-zinc-500 text-[9px] mb-1.5">
                              <span>ID: {ref.id}</span>
                              <span>{new Date(ref.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="space-y-0.5 text-zinc-400">
                              <div>Host (Referrer): <span className="text-gold-400 font-medium">{referrer}</span></div>
                              <div>Invited (New User): <span className="text-gold-400 font-medium">{referred}</span></div>
                              <div className="flex items-center justify-between border-t border-zinc-900 pt-1.5 mt-1.5 text-[10px]">
                                <span className="text-zinc-500">Atomic System Reward:</span>
                                <span className="text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/15 px-1.5 rounded">+{ref.pointsAwarded} Pts</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* COLLECTION: /store */}
                <div className="bg-[#090909] border border-zinc-900 rounded-lg p-4 flex flex-col shadow-inner">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
                    <span className="font-mono text-xs text-gold-400 font-bold">/store/&#123;id&#125; (Standard Market items)</span>
                    <span className="text-[10px] bg-gold-400/10 text-gold-400 border border-gold-400/20 px-1.5 py-0.5 rounded font-mono">
                      {storeItems.length} items
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                    {storeItems.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-[#020202]/40 border border-zinc-900/60 rounded flex items-center justify-between text-xs transition-colors hover:border-zinc-800">
                        <div className="flex items-center space-x-2.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-gold-400" />
                          <div>
                            <p className="font-semibold text-zinc-300 font-serif tracking-wide">{item.title}</p>
                            <span className="text-[9px] text-zinc-650 uppercase font-mono tracking-wider">{item.category}</span>
                          </div>
                        </div>
                        <span className="font-mono text-xs text-gold-400 font-bold bg-gold-400/5 border border-gold-400/10 px-2 py-0.5 rounded">
                          {item.pointsCost} Pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* COLLECTION: /purchases / redemptions */}
                <div className="bg-[#090909] border border-zinc-900 rounded-lg p-4 flex flex-col shadow-inner">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
                    <span className="font-mono text-xs text-gold-400 font-bold">/purchases (Audit Transactions)</span>
                    <span className="text-[10px] bg-gold-400/10 text-gold-400 border border-gold-400/20 px-1.5 py-0.5 rounded font-mono">
                      {purchases.length} transactions
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                    {purchases.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-650">
                        <ShoppingBag className="w-8 h-8 mb-2 opacity-30 text-gold-400" />
                        <p className="text-xs font-sans text-zinc-500">No redemptions generated.</p>
                      </div>
                    ) : (
                      purchases.map((p, idx) => {
                        const buyer = users.find(u => u.uid === p.uid)?.name || p.uid;
                        return (
                          <div key={idx} className="p-2 bg-[#020202]/50 border border-zinc-900 rounded text-[11px] font-mono">
                            <div className="flex justify-between text-[9px] text-zinc-500 mb-1">
                              <span>Receipt: {p.id}</span>
                              <span>{new Date(p.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="text-zinc-400">
                              Buyer: <span className="text-gold-400 font-semibold font-serif">{buyer}</span>
                            </div>
                            <div className="text-zinc-400">
                              Item: <span className="text-gold-400 font-sans font-semibold">{p.title}</span>
                            </div>
                            <div className="flex justify-between border-t border-zinc-900 pt-1 mt-1 text-[10px]">
                              <span>Price Deducted:</span>
                              <span className="text-gold-400 font-black">{p.pointsCost} Pts</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* DEMO HIGHLIGHT TIPS */}
              <div className="bg-[#050505] rounded-xl border border-gold-500/10 p-4 text-xs space-y-2 text-gold-300/90 shadow-md">
                <div className="flex items-center space-x-2 font-bold font-serif tracking-wider uppercase text-[11px]">
                  <Info className="w-4 h-4 text-gold-400" />
                  <span>Double-Incentivized Audit Pipeline Guide:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] font-sans tracking-wide leading-relaxed">
                  <li>Click on <span className="text-gold-400 font-semibold font-serif">Jessica Reed</span> above to load her profile. Copy her invite code: <span className="text-gold-400 font-mono font-bold font-mono bg-[#111] px-1.5 py-0.5 rounded">REE7491</span>.</li>
                  <li>In the user registry above, click <span className="text-gold-400 font-semibold font-serif">Alex Bahre</span> to focus his simulator session. Navigate to the <span className="font-semibold text-gold-400">Earn Screen</span> inside the smartphone preview.</li>
                  <li>Paste <span className="text-gold-400 font-mono font-bold">REE7491</span> into the invitation validation box and press Enter. The database acts atomically, incrementing both points indices by <span className="text-emerald-400 font-extrabold font-mono">+100 Points</span> instantly!</li>
                </ol>
              </div>
            </div>
          )}

          {/* FLUTTER CODES LIBRARY VIEW */}
          {activeDashboardTab === 'code' && (
            <div className="bg-[#0d0d0d] border border-zinc-900 rounded-xl p-5 flex flex-col space-y-4 shadow-2xl" id="code-viewer-deck">
              {(() => {
                const getDynamicCodeContent = (content: string) => {
                  let result = content;
                  result = result.replace(/ca-app-pub-3940256099942544\/5224354917/g, admobAndroidAdUnitId);
                  result = result.replace(/ca-app-pub-3940256099942544\/1712485313/g, admobIosAdUnitId);
                  result = result.replace(/ca-app-pub-3940256099942544~3347511713/g, admobAndroidAppId);
                  result = result.replace(/ca-app-pub-3940256099942544~1458002511/g, admobIosAppId);
                  return result;
                };

                const currentFileContent = getDynamicCodeContent(FLUTTER_FILES[activeCodeFileIndex].content);

                return (
                  <>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2.5 text-gold-400 font-serif font-black tracking-widest text-sm uppercase">
                          <Code className="w-4 h-4 text-gold-400" />
                          <span>Production Flutter Rewards Codebase</span>
                        </div>
                        <button
                          onClick={() => handleCopyCodeToClipboard(currentFileContent)}
                          className="px-3.5 py-1.5 bg-[#141414] hover:bg-[#1a1a1a] text-gold-400 hover:text-gold-300 text-xs font-bold rounded-lg flex items-center space-x-1.5 cursor-pointer border border-zinc-805 transition-colors"
                          id="btn-copy-code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy File Snippet</span>
                        </button>
                      </div>
                      <p className="text-xs text-zinc-550 font-sans">Strictly compliant Flutter Dart code structures, representing multi-document transactions and AdMob rewarded integration.</p>
                    </div>

                    {/* CODE TABS HEADER */}
                    <div className="flex flex-wrap gap-1 border-b border-zinc-900 pb-2 overflow-x-auto" id="code-tabs">
                      {FLUTTER_FILES.map((file, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveCodeFileIndex(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center space-x-1.5 cursor-pointer transition-all ${
                            activeCodeFileIndex === idx
                              ? 'bg-gold-400/10 text-gold-300 border border-gold-400/25'
                              : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#111]'
                          }`}
                        >
                          <span>{file.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* CODE VIEW AREA */}
                    <div className="flex flex-col space-y-2">
                      <div className="bg-[#121212] p-3.5 rounded-lg border border-zinc-90 w-full text-xs">
                        <p className="text-zinc-350 font-medium">Device Workspace Location: <span className="text-gold-400 font-mono font-bold tracking-wider">{FLUTTER_FILES[activeCodeFileIndex].path}</span></p>
                        <p className="text-[11px] text-zinc-500 mt-1 font-sans">{FLUTTER_FILES[activeCodeFileIndex].description}</p>
                      </div>

                      <div className="relative rounded-lg overflow-hidden border border-zinc-900 shadow-2xl">
                        <pre className="p-4 bg-[#050505] font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-[480px]">
                          <code>{currentFileContent}</code>
                        </pre>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* DIAGNOSTIC LOGS */}
          {activeDashboardTab === 'logs' && (
            <div className="bg-[#0d0d0d] border border-zinc-900 rounded-xl p-5 flex flex-col space-y-4 shadow-2xl" id="logs-deck">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5 text-gold-400 font-serif font-black tracking-widest text-sm uppercase">
                    <Activity className="w-4 h-4 text-gold-400" />
                    <span>Real-time Transaction Audit Logs</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-sans">Validation log trails demonstrating auth pipelines, referral states, and AdMob events.</p>
                </div>
                <button
                  onClick={() => {
                    setLogs([]);
                    addLog('system', 'Console cleared by user.');
                  }}
                  className="px-2.5 py-1 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-900 rounded text-[11px] cursor-pointer font-sans transition-colors"
                  id="btn-clear-logs"
                >
                  Clear Logs
                </button>
              </div>

              {/* CORE LOGGING TERMINAL CONTAINER */}
              <div className="bg-[#050505] rounded-xl border border-zinc-900 font-mono text-xs overflow-hidden flex flex-col min-h-[350px]">
                {/* Header bar of terminal */}
                <div className="bg-[#0a0a0a] px-4 py-2.5 border-b border-zinc-900 flex items-center justify-between text-zinc-500 text-[10px]">
                  <div className="flex space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/40 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-gold-500/40 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 inline-block"></span>
                  </div>
                  <span className="font-mono tracking-widest font-semibold uppercase text-gold-500/80">LIVE SYSTEM TRACE</span>
                </div>

                {/* Console logs box */}
                <div className="p-4 flex-1 overflow-y-auto space-y-2 max-h-[480px]">
                  {logs.length === 0 ? (
                    <div className="text-zinc-650 text-center py-12 font-sans">
                      <p>&gt; System register initialized. Interact with the smartphone simulator to record Firestore multi-doc writes.</p>
                    </div>
                  ) : (
                    logs.map((log) => {
                      let typeBadge = '';
                      let textCol = 'text-zinc-400';
                      
                      switch (log.type) {
                        case 'auth':
                          typeBadge = '[AUTH]';
                          textCol = 'text-amber-400 font-semibold';
                          break;
                        case 'ad':
                          typeBadge = '[ADMOB]';
                          textCol = 'text-yellow-500 font-bold';
                          break;
                        case 'referral':
                          typeBadge = '[REFERRAL TX]';
                          textCol = 'text-gold-200 font-extrabold';
                          break;
                        case 'purchase':
                          typeBadge = '[STORE WRITE]';
                          textCol = 'text-orange-400';
                          break;
                        default:
                          typeBadge = '[ENGINE]';
                          textCol = 'text-zinc-500';
                          break;
                      }

                      return (
                        <div key={log.id} className="leading-relaxed border-b border-zinc-950/40 pb-1.5 flex items-start space-x-2 text-[11px] transition-colors hover:bg-zinc-900/10">
                          <span className="text-zinc-600 select-none flex-shrink-0">[{log.timestamp}]</span>
                          <span className={`flex-shrink-0 ${textCol}`}>{typeBadge}</span>
                          <span className="text-zinc-300 select-all font-sans leading-normal">{log.message}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ADMOB CREDENTIAL CONFIGURATION */}
          {activeDashboardTab === 'admob' && (
            <div className="bg-[#0d0d0d] border border-zinc-900 rounded-xl p-5 lg:p-6 flex flex-col space-y-5 shadow-2xl animate-fade-in" id="admob-config-deck">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5 text-gold-400 font-serif font-black tracking-widest text-sm uppercase">
                    <Video className="w-4 h-4 text-gold-400" />
                    <span>AdMob Mobile Ads SDK Configuration</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-sans">Provide your credentials to update the dynamic Dart integration code and execute system simulations with live production values.</p>
                </div>
              </div>

              {/* Informational Warning / Alert Banner */}
              <div className="p-3.5 bg-yellow-400/5 border border-yellow-400/25 rounded-lg flex items-start space-x-3 text-xs leading-relaxed text-yellow-300">
                <Info className="w-4.5 h-4.5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold text-[#f5edcb] font-serif tracking-wide uppercase text-[10px]">What configurations should I provide?</p>
                  <p className="text-zinc-400 font-sans leading-normal">
                    To serve Google Mobile Ads, Google requires you to configure and register an <strong className="text-zinc-200">AdMob App ID</strong> in your App's system configuration (`AndroidManifest.xml` / `Info.plist`) plus compile-time <strong className="text-zinc-200">Ad Unit IDs</strong> inside your Dart code. Below, you can type your actual credentials to see how they bind into the output structure.
                  </p>
                </div>
              </div>

              {/* TWO COLUMN INTERACTIVE FORMS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                
                {/* COLUMN A: ANDROID INGRESS */}
                <div className="bg-[#090909] border border-zinc-900/60 rounded-lg p-4 space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-zinc-900/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    <span className="font-serif font-black text-xs text-[#f5edcb] tracking-wider uppercase">Android Platform</span>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-zinc-500 block">
                        Android App ID
                      </label>
                      <input 
                        type="text" 
                        value={admobAndroidAppId}
                        onChange={(e) => setAdmobAndroidAppId(e.target.value)}
                        placeholder="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"
                        className="w-full bg-[#030303] text-xs font-mono text-[#f5edcb] border border-zinc-900 focus:border-gold-500/50 p-2.5 rounded outline-none transition-all placeholder:text-zinc-700"
                      />
                      <span className="text-[9px] text-zinc-650 font-sans leading-relaxed block">
                        Registered in <code className="text-zinc-500 bg-zinc-950 px-1 py-0.5 rounded">AndroidManifest.xml</code> under meta-data tag.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-zinc-500 block">
                        Android Rewarded Ad Unit ID
                      </label>
                      <input 
                        type="text" 
                        value={admobAndroidAdUnitId}
                        onChange={(e) => setAdmobAndroidAdUnitId(e.target.value)}
                        placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                        className="w-full bg-[#030303] text-xs font-mono text-[#f5edcb] border border-zinc-900 focus:border-gold-500/50 p-2.5 rounded outline-none transition-all placeholder:text-zinc-700"
                      />
                      <span className="text-[9px] text-zinc-650 font-sans leading-relaxed block">
                        Assigned to load triggered <code className="text-zinc-500 bg-zinc-950 px-1 py-0.5 rounded">RewardedAd.load(adUnitId)</code>.
                      </span>
                    </div>
                  </div>
                </div>

                {/* COLUMN B: IOS INGRESS */}
                <div className="bg-[#090909] border border-zinc-900/60 rounded-lg p-4 space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-zinc-900/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
                    <span className="font-serif font-black text-xs text-[#f5edcb] tracking-wider uppercase">iOS Platform</span>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-zinc-500 block">
                        iOS App ID
                      </label>
                      <input 
                        type="text" 
                        value={admobIosAppId}
                        onChange={(e) => setAdmobIosAppId(e.target.value)}
                        placeholder="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"
                        className="w-full bg-[#030303] text-xs font-mono text-[#f5edcb] border border-zinc-900 focus:border-gold-500/50 p-2.5 rounded outline-none transition-all placeholder:text-zinc-700"
                      />
                      <span className="text-[9px] text-zinc-650 font-sans leading-relaxed block">
                        Registered in <code className="text-zinc-500 bg-zinc-950 px-1 py-0.5 rounded">Info.plist</code> with Google Mobile Ads Key.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-zinc-500 block">
                        iOS Rewarded Ad Unit ID
                      </label>
                      <input 
                        type="text" 
                        value={admobIosAdUnitId}
                        onChange={(e) => setAdmobIosAdUnitId(e.target.value)}
                        placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy"
                        className="w-full bg-[#030303] text-xs font-mono text-[#f5edcb] border border-zinc-900 focus:border-gold-500/50 p-2.5 rounded outline-none transition-all placeholder:text-zinc-700"
                      />
                      <span className="text-[9px] text-zinc-650 font-sans leading-relaxed block">
                        Assigned inside build parameters targeting iOS clients.
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ACTION TOGGLES */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-zinc-900/60">
                <button
                  onClick={() => {
                    addLog('system', `AdMob Config Saved: Dynamic components and load pipelines refreshed to production identifiers.`);
                    setActiveDashboardTab('code');
                    addLog('system', `Redirected: Displaying updated Dart source code inside File Explorer.`);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-tr from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black text-xs font-serif font-black tracking-wider uppercase rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-gold-500/5 active:-translate-y-0 hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Update & Inspect Dart Integration</span>
                </button>

                <button
                  onClick={() => {
                    setAdmobAndroidAppId('ca-app-pub-3940256099942544~3347511713');
                    setAdmobIosAppId('ca-app-pub-3940256099942544~1458002511');
                    setAdmobAndroidAdUnitId('ca-app-pub-3940256099942544/5224354917');
                    setAdmobIosAdUnitId('ca-app-pub-3940256099942544/1712485313');
                    addLog('system', 'System Reset: Reverted AdMob parameters back to default Google Mobile Ads safety test coordinates.');
                  }}
                  className="px-3.5 py-2.5 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Use Standby Test IDs</span>
                </button>
              </div>

              {/* HOW TO SECURE THESE VALUES GUIDE */}
              <div className="bg-[#070707] border border-zinc-900 rounded-lg p-5 space-y-4">
                <h4 className="font-serif font-black text-xs uppercase tracking-wide text-gold-400 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-gold-400" />
                  <span>Google AdMob Integration Road Map</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] leading-relaxed text-zinc-400">
                  <div className="space-y-1.5 border-r border-zinc-900/60 pr-2">
                    <div className="flex items-center space-x-2 text-zinc-200 font-bold font-sans">
                      <span className="w-4.5 h-4.5 rounded-full bg-gold-400/10 border border-gold-400/25 flex items-center justify-center text-gold-400 text-[10px] font-mono">1</span>
                      <span>Setup AdMob Console</span>
                    </div>
                    <p className="text-zinc-500">
                      Sign in to <span className="text-zinc-400">AdMob Settings</span>. Select <strong>Apps &gt; Add App</strong>, specify your OS platform, and copy the assigned <strong className="text-zinc-300">App ID</strong>.
                    </p>
                  </div>

                  <div className="space-y-1.5 border-r border-zinc-900/60 pr-2">
                    <div className="flex items-center space-x-2 text-zinc-200 font-bold font-sans">
                      <span className="w-4.5 h-4.5 rounded-full bg-gold-400/10 border border-gold-400/25 flex items-center justify-center text-gold-400 text-[10px] font-mono">2</span>
                      <span>Provision Ad Units</span>
                    </div>
                    <p className="text-zinc-500">
                      Navigate to **Ad Units &gt; Add Ad Unit**. Choose **Rewarded** or **Rewarded Interstitial** video formats to match user-reward hooks. Copy the <strong className="text-zinc-300">Ad Unit ID</strong>.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 text-zinc-200 font-bold font-sans">
                      <span className="w-4.5 h-4.5 rounded-full bg-gold-400/10 border border-gold-400/25 flex items-center justify-center text-gold-400 text-[10px] font-mono">3</span>
                      <span>Finalize App Codes</span>
                    </div>
                    <p className="text-zinc-500">
                      Include Google Mobile Ads packaged dependency, initialize using <code className="text-zinc-400">MobileAds.instance.initialize()</code>, and load and play user ads safely on requests.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </section>

        {/* RIGHT COL: FLUTTER VIRTUAL SMARTPHONE SIMULATOR */}
        <section className="col-span-1 xl:col-span-5 flex flex-col items-center justify-center pt-2 xl:pt-0" id="dashboard-right-deck">
          
          <div className="relative" id="smartphone-frame-root">
            
            {/* FLOATING CONFETTI OVERLAYS */}
            {showRedeemConfetti && (
              <div className="absolute inset-x-2.5 inset-y-2.5 bg-black/95 rounded-[40px] z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in border border-gold-400/20 shadow-2xl shadow-gold-400/20">
                <div className="w-16 h-16 rounded-full bg-gold-400/10 border-2 border-gold-400 flex items-center justify-center mb-4 shadow-xl shadow-gold-500/10 animate-bounce">
                  <CheckCircle2 className="w-8 h-8 text-gold-400 animate-pulse" />
                </div>
                <h3 className="text-lg font-serif font-black text-white px-2 tracking-wide">Redemption Completed!</h3>
                <p className="text-zinc-400 text-xs font-sans mt-2">The Firestore document audit log verified deductions. Redeemed item:</p>
                <div className="bg-[#0b0b0b] border border-gold-500/20 rounded-lg py-2.5 px-5 mt-3 mb-2 font-mono text-gold-400 font-bold text-xs uppercase tracking-wider shadow-inner">
                  {purchasedTitle}
                </div>
                <p className="text-[10px] text-zinc-500 font-sans mt-2 max-w-[200px]">Active receipt generated securely in collection database log.</p>
                <button 
                  onClick={() => setShowRedeemConfetti(false)}
                  className="mt-6 px-6 py-2 bg-gradient-to-r from-gold-600 to-gold-400 text-black text-xs font-bold rounded-lg cursor-pointer hover:shadow-lg transition-all"
                >
                  Return to Store
                </button>
              </div>
            )}

            {/* FLOATING POINTS +5 MOTIVATOR */}
            {showPointsFloating && (
              <div className="absolute top-28 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold-500 to-gold-400 text-black font-black px-4 py-2 rounded-full flex items-center space-x-1.5 shadow-xl shadow-gold-500/20 font-mono text-xs z-50 animate-bounce ring-2 ring-black">
                <Coins className="w-4 h-4 fill-black stroke-[3]" />
                <span>+5 Points Claimed!</span>
              </div>
            )}

            {/* IMMERSIVE ADMOB FULL SCREEN MODAL */}
            {showAdOverlay && (
              <div className="absolute inset-x-2.5 inset-y-2.5 bg-[#080808] rounded-[40px] z-45 flex flex-col justify-between p-6 select-none overflow-hidden border border-zinc-800" id="admob-sdk-layer">
                
                {/* AD HEADER */}
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-bold bg-gold-450 text-black px-1.5 py-0.5 rounded tracking-widest font-mono">
                      AD SPONSOR
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">ca-pub-3940...</span>
                  </div>
                  
                  {/* Skip block matching standard AdMob triggers */}
                  <div>
                    {adPlaybackTimer > 0 ? (
                      <span className="font-mono text-[10px] text-zinc-400 font-medium bg-[#131313] py-1 px-2.5 rounded-full border border-zinc-850">
                        Skip in {adPlaybackTimer}s
                      </span>
                    ) : (
                      <button 
                        onClick={handleAdMobRewardConsent}
                        className="py-1 px-3 bg-[#e5b83b] hover:bg-[#d4af37] text-black text-xs font-bold rounded-full flex items-center space-x-1 animate-pulse cursor-pointer transition-colors"
                        id="btn-admob-close"
                      >
                        <span>Claim Points</span>
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* AD VIDEO BODY */}
                <div className="flex flex-col items-center justify-center my-auto space-y-6 text-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-gold-600 to-[#121212] flex items-center justify-center shadow-2xl animate-spin-slow border border-gold-500/20">
                      <Play className="w-10 h-10 text-gold-400 fill-gold-400 translate-x-1" />
                    </div>
                    {/* Ring helper overlay */}
                    <div className="absolute -inset-2 bg-gradient-to-tr from-gold-500/10 to-transparent blur-lg rounded-2xl animate-pulse"></div>
                  </div>

                  <div className="space-y-2 max-w-xs">
                    <h4 className="text-xs font-serif font-black tracking-widest text-[#f5edcb] uppercase">Merge Luxury Saga</h4>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">Assemble the ultimate royal dynasty card decks in this premium multi-tier puzzle build! Get free access today.</p>
                  </div>

                  {/* AD PROGRESS DISPLAY */}
                  <div className="w-full bg-[#121212] rounded-full h-1 mt-4 overflow-hidden border border-zinc-850">
                    <div 
                      className="bg-gold-400 h-full transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${100 - (adPlaybackTimer * 20)}%` }}
                    ></div>
                  </div>
                </div>

                {/* AD FOOTER ACTION */}
                <div className="flex flex-col items-center space-y-3 pt-3 border-t border-zinc-900">
                  <div className="flex items-center space-x-1.5 text-[10px] text-zinc-500 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" />
                    <span>AdMob SDK state callback validated.</span>
                  </div>
                  
                  <div className="flex justify-between w-full items-center">
                    <button 
                      onClick={() => setAdVolumeMuted(!adVolumeMuted)}
                      className="p-1 px-2.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 text-[10px] font-semibold border border-zinc-800 rounded flex items-center space-x-1.5 cursor-pointer"
                    >
                      {adVolumeMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-gold-400" />}
                      <span>{adVolumeMuted ? 'Mute' : 'Audio On'}</span>
                    </button>
                    
                    <span className="text-[10px] text-zinc-600 font-mono italic">Google Mobile Ads Simulator</span>
                  </div>
                </div>

              </div>
            )}

            {/* REALISTIC PHYSICAL SMARTPHONE CONTAINER */}
            <div className="w-[365px] h-[750px] bg-[#0d0d0d] border-[10px] border-[#1c1c1c] rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col ring-8 ring-zinc-900/50" id="physical-phone-viewport animate-fade-in">
              
              {/* STATUS BAR BARRIER (TOP SLIT SPEAKER) */}
              <div className="absolute top-0 inset-x-0 h-6 bg-[#0d0d0d] flex items-center justify-between px-6 z-20 select-none">
                <span className="text-[10px] text-zinc-400 font-bold font-mono">12:00</span>
                
                {/* Physical Camera Notch / Island */}
                <div className="w-20 h-4 bg-black rounded-full border border-zinc-900/60 absolute left-1/2 -translate-x-1/2 top-1.5 shadow-inner"></div>
                
                <div className="flex items-center space-x-1.5 text-zinc-400">
                  <span className="text-[8px] font-mono font-bold tracking-tight text-zinc-650 bg-zinc-900 px-1 py-0.2 rounded border border-zinc-850">4G LTE</span>
                  <div className="w-4 h-2.5 border border-zinc-600 rounded-sm relative flex items-center p-0.5"><div className="bg-zinc-400 h-full w-2.5"></div></div>
                </div>
              </div>

              {/* PHONE SCREEN CONTAINER */}
              <div className={`flex-1 pt-6 flex flex-col justify-between transition-all duration-300 ${themeMode === 'light' ? 'bg-[#FAF8F5]' : 'bg-[#050505]'}`} id="phone-display">
                
                {/* 1. M3 TITLE APP HEADER BAR */}
                {mobileScreen !== 'auth' && currentUser && (
                  <div className="flex flex-col">
                    <header className={`px-4 py-2.5 flex items-center justify-between select-none border-b transition-all ${themeMode === 'light' ? 'bg-white border-zinc-200 shadow-sm text-zinc-900' : 'bg-[#0c0c0c] border-zinc-900 text-zinc-100'}`}>
                      <div className="flex items-center space-x-2 max-w-[170px]">
                        <div className="w-6 h-6 rounded bg-gradient-to-tr from-gold-500 to-gold-400 flex items-center justify-center shadow-sm shrink-0">
                          <Coins className="w-3.5 h-3.5 text-black" />
                        </div>
                        <span className={`text-[11px] font-serif font-black truncate tracking-tight uppercase ${themeMode === 'light' ? 'text-zinc-800' : 'text-gold-400'}`}>
                          {MOCK_APPS.find(a => a.id === activeAppId)?.name || t.rewardCenter}
                        </span>
                      </div>

                      {/* Unified App points balance pill */}
                      <div className={`rounded-full px-2.5 py-0.5 flex items-center space-x-1 font-mono text-[9px] font-bold transition-all border ${themeMode === 'light' ? 'bg-amber-500/10 border-amber-300 text-amber-800' : 'bg-gold-500/10 border-gold-500/25 text-gold-300'}`}>
                        <Coins className={`w-3 h-3 ${themeMode === 'light' ? 'text-amber-600 fill-amber-650' : 'text-gold-400 fill-gold-400'}`} />
                        <span>{(currentUser.appPoints && currentUser.appPoints[activeAppId]) || 0} / {currentUser.pointsBalance} Pts</span>
                      </div>
                    </header>

                    {/* Integrated Smartphone Context Swapper */}
                    <div className={`px-4 py-1.5 border-b flex items-center justify-between text-[9px] transition-all pin-top-navbar ${
                      themeMode === 'light' ? 'bg-amber-500/5 border-amber-500/10 text-amber-900' : 'bg-[#100f0d] border-gold-500/10 text-gold-300'
                    }`}>
                      <div className="flex items-center space-x-1 font-sans">
                        <Smartphone className="w-3 h-3 text-gold-400" />
                        <span className="font-bold uppercase tracking-wider text-[8px]">App Simulator Gateway:</span>
                      </div>
                      <select
                        value={activeAppId}
                        onChange={(e) => {
                          setActiveAppId(e.target.value);
                          addLog('system', `App Switch: Loaded simulated mobile interface context [${MOCK_APPS.find(a => a.id === e.target.value)?.name}]`);
                        }}
                        className={`px-1.5 py-0.5 rounded font-bold font-mono border text-[8px] max-w-[160px] outline-none cursor-pointer ${
                          themeMode === 'light'
                            ? 'bg-white border-zinc-200 text-zinc-850'
                            : 'bg-black border-zinc-850 text-gold-400 focus:border-gold-400'
                        }`}
                      >
                        {MOCK_APPS.map(app => (
                          <option key={app.id} value={app.id}>
                            {app.shortName} ({(currentUser.appPoints && currentUser.appPoints[app.id]) || 0} Pts)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* 2. BODY CONTENT ROUTER (Tabbed routing based on screen state selection) */}
                <div className="flex-1 overflow-y-auto px-4 py-3" id="phone-screen-scroller">
                  
                  {/* AUTHENTICATION SCREEN CODE (SCREEN 1) */}
                  {mobileScreen === 'auth' && (
                    <div className="h-full flex flex-col justify-center py-4 text-center">
                      <div className="text-center space-y-2 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-tr from-gold-600 to-gold-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-gold-500/10 border border-gold-500/20">
                          <Coins className="w-6 h-6 text-black" />
                        </div>
                        <h3 className={`text-sm font-serif font-black tracking-wider uppercase ${themeMode === 'light' ? 'text-zinc-850' : 'text-gold-400'}`}>
                          {language === 'am' ? 'የአድክዌስት ምዝገባ' : 'AdQuest Registry'}
                        </h3>
                        <p className={`text-[10px] font-sans ${themeMode === 'light' ? 'text-zinc-650' : 'text-zinc-500'}`}>
                          {language === 'am' ? 'የNoSQL ቀሪ ሂሳብዎን ለመጀመር ልዩ ተጓዳኝ መገለጫዎችን ይፍጠሩ።' : 'Initialize your NoSQL token balance by generating unique companion profiles.'}
                        </p>
                      </div>

                      {/* AUTHENTICATOR METHOD TABS */}
                      <div className={`p-1 rounded-lg flex space-x-1 mb-4 text-[10px] border transition-all ${themeMode === 'light' ? 'bg-zinc-100 border-zinc-200' : 'bg-[#0b0b0b] border-zinc-900'}`}>
                        <button
                          onClick={() => { setIsAuthSignUp(false); setAuthError(''); }}
                          className={`flex-1 py-1.5 font-bold rounded cursor-pointer transition-colors ${!isAuthSignUp ? (themeMode === 'light' ? 'bg-white text-zinc-900 shadow-sm' : 'bg-[#181818] text-gold-400') : 'text-zinc-505'}`}
                        >
                          {t.signIn}
                        </button>
                        <button
                          onClick={() => { setIsAuthSignUp(true); setAuthError(''); }}
                          className={`flex-1 py-1.5 font-bold rounded cursor-pointer transition-colors ${isAuthSignUp ? (themeMode === 'light' ? 'bg-white text-zinc-900 shadow-sm' : 'bg-[#181818] text-gold-400') : 'text-zinc-505'}`}
                        >
                          {t.signUp}
                        </button>
                      </div>

                      <form onSubmit={isAuthSignUp ? handleMobileSignUp : handleMobileSignIn} className="space-y-3.5">
                        {isAuthSignUp && (
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Full Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-650" />
                              <input
                                type="text"
                                value={authName}
                                onChange={(e) => setAuthName(e.target.value)}
                                placeholder="e.g. Jessica Reed"
                                className={`w-full border rounded-lg p-2 pl-9 text-xs placeholder-zinc-500 focus:outline-none transition-all ${
                                  themeMode === 'light'
                                    ? 'bg-white border-zinc-200 text-zinc-800 focus:border-amber-500/55'
                                    : 'bg-[#0c0c0c] border-zinc-900 text-zinc-100 focus:border-gold-550/50'
                                }`}
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-650" />
                            <input
                              type="email"
                              value={authEmail}
                              onChange={(e) => setAuthEmail(e.target.value)}
                              placeholder={isAuthSignUp ? "you@example.com" : "alexbahre@gmail.com"}
                              className={`w-full border rounded-lg p-2 pl-9 text-xs placeholder-zinc-500 focus:outline-none transition-all ${
                                themeMode === 'light'
                                  ? 'bg-white border-zinc-200 text-zinc-800 focus:border-amber-500/55'
                                  : 'bg-[#0c0c0c] border-zinc-900 text-zinc-100 focus:border-gold-550/50'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Security Key</label>
                          <div className="relative">
                            <Key className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-650" />
                            <input
                              type="password"
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                              placeholder="••••••••"
                              className={`w-full border rounded-lg p-2 pl-9 text-xs placeholder-zinc-500 focus:outline-none transition-all ${
                                themeMode === 'light'
                                  ? 'bg-white border-zinc-200 text-zinc-800 focus:border-amber-500/55'
                                  : 'bg-[#0c0c0c] border-zinc-900 text-zinc-100 focus:border-gold-550/50'
                              }`}
                            />
                          </div>
                        </div>

                        {/* ERROR NOTICE INSIDE MOBILE PHONE */}
                        {authError && (
                          <div className="p-2 border border-red-500/20 bg-red-950/20 text-red-400 rounded-lg text-[10px] font-sans leading-normal">
                            {authError}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-gold-600 to-gold-450 hover:from-gold-500 hover:to-gold-400 text-black font-semibold p-2.5 rounded-lg text-xs flex items-center justify-center space-x-1 cursor-pointer transition-all shadow-md active:scale-98"
                        >
                          <span>{isAuthSignUp ? 'Generate Referral Profile' : 'Authenticate User'}</span>
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </form>

                      {/* QUICK GUIDE BLOCK */}
                      <div className="mt-8 p-3 bg-[#0d0d0d] rounded-lg border border-zinc-900 text-[10px] text-zinc-500 space-y-1">
                        <p className="font-serif font-black text-gold-500/80 tracking-wider uppercase text-[9px]">Developer Logins:</p>
                        <p>• alexbahre@gmail.com <span className="text-zinc-600">(Alex)</span></p>
                        <p>• jreed@gmail.com <span className="text-zinc-600">(Jessica)</span></p>
                        <p className="text-[9px] text-zinc-650 pt-1 italic font-sans">Key any mock password to authorize session.</p>
                      </div>
                    </div>
                  )}

                  {/* DASHBOARD OVERVIEW (SCREEN 1 - NEW) */}
                  {mobileScreen === 'dashboard' && currentUser && (
                    <div className="space-y-4 animate-fade-in pb-20">
                      {/* Welcome Card */}
                      <div className={`p-4 rounded-2xl transition-all border ${
                        themeMode === 'light' 
                          ? 'bg-gradient-to-br from-amber-500 to-orange-400 text-white border-transparent shadow-md' 
                          : 'bg-gradient-to-tr from-[#1b1710]/40 to-[#0c0c0c] border-gold-500/10'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif text-sm font-black border ${
                            themeMode === 'light'
                              ? 'bg-white/20 text-white border-white/30'
                              : 'bg-gold-500/10 text-gold-400 border-gold-500/25'
                          }`}>
                            {currentUser.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <p className={`text-[9px] font-sans uppercase tracking-widest ${themeMode === 'light' ? 'text-white/85' : 'text-zinc-500'}`}>
                              {language === 'am' ? 'እንኳን ደህና መጡ' : 'Welcome back'}
                            </p>
                            <h3 className={`text-xs font-serif font-black uppercase tracking-wide ${themeMode === 'light' ? 'text-white' : 'text-zinc-100'}`}>
                              {currentUser.name}
                            </h3>
                          </div>
                        </div>

                        {/* Balance Overview Card */}
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                          <div>
                            <span className={`text-[8px] uppercase tracking-wider font-mono ${themeMode === 'light' ? 'text-white/75' : 'text-zinc-500'}`}>Current Balance</span>
                            <div className="flex items-center space-x-1.5 pt-0.5">
                              <Coins className={`w-4 h-4 ${themeMode === 'light' ? 'text-white' : 'text-gold-400'}`} />
                              <span className={`text-base font-black font-mono ${themeMode === 'light' ? 'text-white' : 'text-gold-400'}`}>
                                {currentUser.pointsBalance} {language === 'am' ? 'ነጥብ' : 'Pts'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-[8px] uppercase tracking-wider font-mono ${themeMode === 'light' ? 'text-white/75' : 'text-zinc-500'}`}>Lifetime Ads</span>
                            <p className={`text-xs font-semibold font-mono mt-0.5 ${themeMode === 'light' ? 'text-white' : 'text-zinc-300'}`}>
                              {currentUser.lifetimeAdsWatched} {language === 'am' ? 'ማስታወቂያ' : 'Watched'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Goal Progress Tracker */}
                      <div className={`p-4 rounded-xl space-y-2.5 transition-all border ${
                        themeMode === 'light' ? 'bg-white border-zinc-200 shadow-sm' : 'bg-[#0c0c0c] border-zinc-900'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] uppercase font-serif font-black tracking-wider ${themeMode === 'light' ? 'text-zinc-700' : 'text-gold-400'}`}>
                            {language === 'am' ? 'የግዢ ዕቅድ ሁኔታ' : 'Reward Goal Progress'}
                          </span>
                          <span className="text-[8px] font-mono text-zinc-500 text-right">Goal: 2000 Pts</span>
                        </div>
                        {(() => {
                          const goal = 2000;
                          const pct = Math.min(Math.round((currentUser.pointsBalance / goal) * 100), 100);
                          return (
                            <div className="space-y-1.5">
                              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-gold-600 to-gold-400 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between items-center text-[9px] font-mono">
                                <span className="text-zinc-500">{pct}% Completed</span>
                                <span className={`font-bold ${themeMode === 'light' ? 'text-zinc-700' : 'text-zinc-300'}`}>
                                  {Math.max(goal - currentUser.pointsBalance, 0)} Pts {language === 'am' ? 'ይቀራል' : 'remaining'}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Unified App Ledger within Client Simulator */}
                      <div className={`p-4 rounded-xl space-y-3 transition-all border ${
                        themeMode === 'light' ? 'bg-white border-zinc-200 shadow-sm' : 'bg-[#0c0c0c] border-zinc-900'
                      }`}>
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-900/10">
                          <span className={`text-[9px] uppercase font-serif font-black tracking-wider ${themeMode === 'light' ? 'text-zinc-700' : 'text-gold-400'}`}>
                            {language === 'am' ? 'የተጓዳኝ መተግበሪያዎች ዝርዝር' : 'Unified App Ledger'}
                          </span>
                          <span className="text-[8px] font-mono text-zinc-500">{language === 'am' ? 'ማዕከላዊ ዳታቤዝ' : 'Central Sync'}</span>
                        </div>

                        <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1 select-none">
                          {MOCK_APPS.map((app) => {
                            const isSelectedApp = app.id === activeAppId;
                            const pts = (currentUser.appPoints && currentUser.appPoints[app.id] !== undefined)
                              ? currentUser.appPoints[app.id]
                              : 0;
                            return (
                              <div 
                                key={app.id} 
                                onClick={() => {
                                  setActiveAppId(app.id);
                                  addLog('system', `App Switch: Clicked mobile ledger switching active context to [${app.name}]`);
                                }}
                                className={`flex items-center justify-between p-2 rounded transition-all cursor-pointer text-[9.5px] ${
                                  isSelectedApp 
                                    ? (themeMode === 'light' ? 'bg-amber-500/15 text-amber-900 font-bold border border-amber-500/30 shadow-sm' : 'bg-gold-400/10 text-gold-300 font-bold border border-gold-400/25')
                                    : (themeMode === 'light' ? 'border border-transparent bg-zinc-50 hover:bg-zinc-100 text-zinc-750' : 'border border-transparent hover:bg-zinc-900/40 text-zinc-400')
                                }`}
                              >
                                <div className="flex items-center space-x-1.5 truncate max-w-[170px]">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isSelectedApp ? 'bg-gold-400 scale-110 animate-ping shadow-sm' : 'bg-zinc-650'}`}></span>
                                  <span className="truncate">{app.name}</span>
                                </div>
                                <span className="font-mono font-bold text-right shrink-0">{pts} Pts</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Interactive Watch Video Banner Trigger */}
                      <div className={`p-4 rounded-xl flex flex-col items-center text-center space-y-2.5 transition-all ${
                        themeMode === 'light' 
                          ? 'bg-gradient-to-br from-amber-50 to-white border border-gold-300 shadow-sm' 
                          : 'bg-gradient-to-br from-[#121212] to-[#040404] border border-gold-500/10'
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${themeMode === 'light' ? 'bg-gold-500/10' : 'bg-gold-400/5 border border-gold-400/15'}`}>
                          {rewardedCooldownLeft > 0 ? (
                            <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                          ) : (
                            <Video className="w-5 h-5 text-gold-400 animate-pulse" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className={`text-xs font-serif font-black tracking-wide uppercase ${themeMode === 'light' ? 'text-zinc-800' : 'text-[#f5edcb]'}`}>
                            {rewardedCooldownLeft > 0 ? t.cooldownStatus : t.needMorePoints}
                          </h4>
                          <p className={`text-[10px] leading-relaxed font-sans ${themeMode === 'light' ? 'text-zinc-650' : 'text-zinc-500'}`}>
                            {rewardedCooldownLeft > 0 
                              ? (language === 'am' ? 'የቪዲዮ ማስታወቂያ እረፍት ላይ ነው። እባክዎ ለሚቀጥለው ነጥብ ጥቂት ሰከንዶች ይጠብቁ!' : 'Spaced out rewarded campaign to maximize payout rates. Watch next limit:') 
                              : t.watchAdToEarn}
                          </p>
                        </div>
                        {rewardedCooldownLeft > 0 ? (
                          <div className="w-full space-y-2">
                            <div className="py-2 px-4 bg-zinc-900 border border-zinc-800 text-gold-400 font-mono text-[10px] font-bold rounded flex items-center justify-center space-x-1.5 shadow-inner">
                              <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                              <span>{Math.floor(rewardedCooldownLeft / 60)}m {rewardedCooldownLeft % 60}s remaining</span>
                            </div>
                            <button
                              onClick={() => {
                                setRewardedCooldownLeft(0);
                                addLog('system', 'Developer Bypass: Bypassed rewarded video cooldown.');
                              }}
                              className="w-full py-1 text-center bg-transparent border-dashed border border-amber-500/30 hover:border-amber-500/60 text-amber-500/80 hover:text-amber-400 text-[8.5px] font-mono rounded tracking-wider cursor-pointer transition-colors"
                            >
                              ⚡ BYPASS COOLDOWN (TEST SHORTCUT)
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={startAdMobVideoPlayback}
                            className="w-full mt-1 px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black text-[10px] font-black tracking-widest uppercase rounded flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-gold-500/10 cursor-pointer active:scale-98"
                          >
                            <Play className="w-3 h-3 fill-current text-black stroke-[3]" />
                            <span>{t.watchAdBtn} (+5)</span>
                          </button>
                        )}
                      </div>

                      {/* Micro Sandbox Status */}
                      <div className="p-3 bg-zinc-950/20 border border-zinc-900 border-dashed rounded-lg text-center space-y-1">
                        <span className="text-[8px] font-mono text-zinc-600">Simulating Live Firebase Stream Feed</span>
                        <div className="flex items-center justify-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          <span className="text-[9px] text-emerald-500/80 font-mono font-bold">SDK Connected & Ready</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* REWARDS STOREFRONT (SCREEN 2) */}
                  {mobileScreen === 'store' && currentUser && (
                    <div className="space-y-4 pb-20 animate-fade-in">
                      
                      {/* Interactive Watch Video Banner Trigger */}
                      <div className={`p-4 rounded-xl flex flex-col items-center text-center space-y-2.5 transition-all ${
                        themeMode === 'light' 
                          ? 'bg-gradient-to-br from-amber-50 to-white border border-gold-300 shadow-sm' 
                          : 'bg-gradient-to-br from-[#121212] to-[#040404] border border-gold-500/10'
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${themeMode === 'light' ? 'bg-gold-500/10' : 'bg-gold-400/5 border border-gold-400/15'}`}>
                          {rewardedCooldownLeft > 0 ? (
                            <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                          ) : (
                            <Video className="w-5 h-5 text-gold-400 animate-pulse" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className={`text-xs font-serif font-black tracking-wide uppercase ${themeMode === 'light' ? 'text-zinc-800' : 'text-[#f5edcb]'}`}>
                            {rewardedCooldownLeft > 0 ? t.cooldownStatus : t.needMorePoints}
                          </h4>
                          <p className={`text-[10px] leading-relaxed font-sans ${themeMode === 'light' ? 'text-zinc-650' : 'text-zinc-500'}`}>
                            {rewardedCooldownLeft > 0 
                              ? (language === 'am' ? 'የቪዲዮ ማስታወቂያ እረፍት ላይ ነው። እባክዎ ለሚቀጥለው ነጥብ ጥቂት ሰከንዶች ይጠብቁ!' : 'Spaced out rewarded campaign to maximize payout rates. Watch next limit:') 
                              : t.watchAdToEarn}
                          </p>
                        </div>
                        {rewardedCooldownLeft > 0 ? (
                          <div className="w-full space-y-2">
                            <div className="py-2 px-4 bg-zinc-900 border border-zinc-800 text-gold-400 font-mono text-[10px] font-bold rounded flex items-center justify-center space-x-1.5 shadow-inner">
                              <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                              <span>{Math.floor(rewardedCooldownLeft / 60)}m {rewardedCooldownLeft % 60}s remaining</span>
                            </div>
                            <button
                              onClick={() => {
                                setRewardedCooldownLeft(0);
                                addLog('system', 'Developer Bypass: Bypassed rewarded video cooldown.');
                              }}
                              className="w-full py-1 text-center bg-transparent border-dashed border border-amber-500/30 hover:border-amber-500/60 text-amber-500/80 hover:text-amber-400 text-[8.5px] font-mono rounded tracking-wider cursor-pointer transition-colors"
                            >
                              ⚡ BYPASS COOLDOWN (TEST SHORTCUT)
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={startAdMobVideoPlayback}
                            className="w-full mt-1 px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black text-[10px] font-black tracking-widest uppercase rounded flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-gold-500/10 cursor-pointer active:scale-98"
                          >
                            <Play className="w-3 h-3 fill-current text-black stroke-[3]" />
                            <span>{t.watchAdBtn} (+5)</span>
                          </button>
                        )}
                      </div>

                      {/* Marketplace list */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-serif font-bold tracking-wider uppercase ${themeMode === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            {t.exclusiveInventory}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-medium font-sans">
                            {language === 'am' ? 'ባለ ሁለት-ዓምድ እይታ' : '2-column GridView'}
                          </span>
                        </div>

                        {/* Inventory lists */}
                        <div className="grid grid-cols-2 gap-2" id="phone-grid">
                          {storeItems.map((item, idx) => {
                            const isLocked = currentUser.pointsBalance < item.pointsCost;
                            
                            // Category translator
                            const getCategoryLabel = (cat: string) => {
                              if (language === 'am') {
                                if (cat === 'Voice') return 'ከተፕ ጥቅል';
                                if (cat === 'Internet') return 'ኢንተርኔት';
                                if (cat === 'Unlimited') return 'ክፍት ድምፅ';
                                if (cat === 'Gift Card') return 'የስጦታ ካርድ';
                              }
                              return cat;
                            };

                            // Map brand background & border styling
                            let brandStyles = "bg-[#0c0c0c] border border-zinc-900";
                            if (themeMode === 'light') {
                              if (item.brand === 'ethio') {
                                brandStyles = "border-2 border-emerald-500 bg-gradient-to-br from-[#ebf5ff] to-[#e6f9f0] shadow-md shadow-emerald-500/5";
                              } else if (item.brand === 'safaricom') {
                                brandStyles = "border-2 border-red-500 bg-gradient-to-br from-[#e6f9f0] to-[#fdf2f2] shadow-md shadow-red-500/5";
                              } else if (item.brand === 'jolly') {
                                brandStyles = "border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm";
                              } else if (item.brand === 'junior') {
                                brandStyles = "border border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-sm";
                              } else {
                                brandStyles = "bg-white border border-zinc-200 shadow-sm";
                              }
                            } else {
                              if (item.brand === 'ethio') {
                                brandStyles = "border-2 border-emerald-500 bg-gradient-to-br from-[#0a1224] to-[#0a1c13] shadow-inner";
                              } else if (item.brand === 'safaricom') {
                                brandStyles = "border-2 border-red-500 bg-gradient-to-br from-[#081a12] to-[#1c0808] shadow-inner";
                              } else if (item.brand === 'jolly') {
                                brandStyles = "border border-amber-600/35 bg-gradient-to-br from-[#1c1208] to-[#130d06] shadow-inner";
                              } else if (item.brand === 'junior') {
                                brandStyles = "border border-cyan-600/35 bg-gradient-to-br from-[#081a1a] to-[#060c18] shadow-inner";
                              }
                            }
                            
                            // Map icon codes
                            let visualIcon = <Gift className="w-5 h-5 text-gold-400" />;
                            if (item.icon === 'palette') visualIcon = <Sparkles className="w-5 h-5 text-gold-400" />;
                            if (item.icon === 'shield') visualIcon = <Shield className="w-5 h-5 text-gold-400" />;
                            if (item.icon === 'infinity') visualIcon = <Flame className="w-5 h-5 text-red-500 animate-pulse" />;
                            if (item.icon === 'wifi') visualIcon = <Coins className="w-5 h-5 text-blue-550" />;
                            if (item.icon === 'phone') visualIcon = <Smartphone className="w-5 h-5 text-emerald-500" />;

                            // Override with premium, distinct telecom SVGs if brand is ethio or safaricom
                            if (item.brand === 'ethio') {
                              visualIcon = (
                                <svg viewBox="0 0 100 100" className="w-10 h-10 select-none animate-fade-in" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="50" cy="50" r="43" fill="none" stroke="#10b981" strokeWidth="8" />
                                  <circle cx="50" cy="50" r="28" fill="none" stroke="#2563eb" strokeWidth="7" />
                                  <circle cx="50" cy="50" r="14" fill="#10b981" stroke="#2563eb" strokeWidth="2" />
                                  <path d="M 18,50 Q 50,15 82,50 C 70,82 50,55 18,50" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
                                </svg>
                              );
                            } else if (item.brand === 'safaricom') {
                              visualIcon = (
                                <svg viewBox="0 0 100 100" className="w-10 h-10 select-none animate-fade-in" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="50" cy="50" r="43" fill="none" stroke="#10b981" strokeWidth="8" />
                                  <path 
                                    d="M32 30 C 44 14, 60 14, 68 28 C 76 40, 60 46, 50 50 C 40 54, 32 60, 36 72 C 42 84, 68 84, 72 70" 
                                    stroke="#ef4444" 
                                    strokeWidth="11" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                  />
                                  <path d="M 30,26 C 40,12 60,12 68,24" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
                                  <circle cx="53" cy="51" r="5" fill="#ef4444" />
                                </svg>
                              );
                            }

                            // Logo Badges
                            let logoBadge = null;
                            if (item.brand === 'ethio') {
                              logoBadge = (
                                <div className="flex items-center space-x-1 justify-center bg-gradient-to-r from-blue-600 to-emerald-600 px-1 py-0.5 rounded-[4px] text-[7px] font-black text-white uppercase tracking-wider mb-1.5 shadow select-none">
                                  <span className="w-1 h-1 rounded-full bg-blue-300 animate-ping"></span>
                                  <span>Ethio Telecom</span>
                                </div>
                              );
                            } else if (item.brand === 'safaricom') {
                              logoBadge = (
                                <div className="flex items-center space-x-1 justify-center bg-gradient-to-r from-emerald-600 to-red-600 px-1 py-0.5 rounded-[4px] text-[7px] font-black text-white uppercase tracking-wider mb-1.5 shadow select-none">
                                  <span className="w-1 h-1 rounded-full bg-red-300 animate-ping"></span>
                                  <span>Safaricom</span>
                                </div>
                              );
                            } else if (item.brand === 'jolly') {
                              logoBadge = (
                                <div className="flex items-center justify-center bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 rounded-[4px] text-[7px] font-bold text-amber-500 uppercase mb-1.5">
                                  <span>Jolly's</span>
                                </div>
                              );
                            } else if (item.brand === 'junior') {
                              logoBadge = (
                                <div className="flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 px-1 py-0.5 rounded-[4px] text-[7px] font-bold text-cyan-500 uppercase mb-1.5">
                                  <span>Junior's</span>
                                </div>
                              );
                            }

                            return (
                              <div 
                                key={idx} 
                                className={`${brandStyles} rounded-lg p-2.5 flex flex-col justify-between transition-all duration-200`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <span className={`text-[7.5px] uppercase tracking-wider font-mono px-1 py-0.5 rounded ${themeMode === 'light' ? 'bg-zinc-100 text-zinc-650' : 'bg-black/40 text-zinc-400'}`}>
                                    {getCategoryLabel(item.category)}
                                  </span>
                                  {isLocked ? (
                                    <Lock className="w-3 h-3 text-red-500/80" />
                                  ) : (
                                    <Unlock className="w-3 h-3 text-emerald-500/80" />
                                  )}
                                </div>

                                <div className="py-2 flex flex-col items-center">
                                  {logoBadge}
                                  <div className="p-1.5 rounded-full bg-black/10">
                                    {visualIcon}
                                  </div>
                                </div>

                                <div className="space-y-0.5">
                                  <h5 className={`text-[10px] font-bold truncate pr-1 ${themeMode === 'light' ? 'text-zinc-900' : 'text-zinc-205'}`}>{item.title}</h5>
                                  <div className="flex items-center space-x-1 pt-0.5 justify-start text-[9px] font-mono text-gold-550 font-black">
                                    <Coins className="w-2.5 h-2.5" />
                                    <span>{item.pointsCost} {language === 'am' ? 'ነጥብ' : 'Pts'}</span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleMarketplacePurchase(item)}
                                  disabled={isLocked}
                                  className={`w-full mt-2.5 py-1.5 rounded text-[9px] tracking-wider uppercase font-bold transition-all text-center cursor-pointer ${
                                    isLocked 
                                      ? 'bg-zinc-950/20 text-zinc-500 border border-zinc-500/15 cursor-not-allowed' 
                                      : 'bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black shadow shadow-gold-500/10'
                                  }`}
                                >
                                  {isLocked ? t.locked : t.redeem}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* REFERRAL SYSTEM SUBMISSION (SCREEN 3) */}
                  {mobileScreen === 'referral' && currentUser && (
                    <div className="space-y-4 pb-20 animate-fade-in">
                      
                      {/* STATS AREA */}
                      <div className={`border rounded-xl p-4 space-y-3 transition-all ${
                        themeMode === 'light' ? 'bg-white border-zinc-200 shadow-sm text-zinc-805' : 'bg-[#0c0c0c] border-zinc-900 text-zinc-200'
                      }`}>
                        <div className="text-center space-y-1">
                          <span className="text-[9px] uppercase font-serif font-extrabold text-zinc-500 tracking-wider">Your Referral Promo Code</span>
                          <div className={`text-base font-black font-mono py-2 px-4 rounded-lg flex items-center justify-center space-x-2 border w-fit mx-auto shadow-inner ${
                            themeMode === 'light' 
                              ? 'text-amber-600 bg-zinc-50 border-zinc-200' 
                              : 'text-gold-400 bg--[#020202] border-zinc-90'
                          }`}>
                            <span>{currentUser.myReferralCode}</span>
                          </div>
                        </div>

                        <div className={`border-t pt-2.5 flex justify-between text-center select-none text-[10px] font-mono ${
                          themeMode === 'light' ? 'border-zinc-200' : 'border-zinc-900'
                        }`}>
                          <div className={`flex-1 border-r pr-2 ${themeMode === 'light' ? 'border-zinc-200' : 'border-zinc-900'}`}>
                            <p className="text-zinc-500 text-[9px] font-sans">Promo Credit</p>
                            <p className="text-emerald-400 font-bold font-mono">+100 Pts</p>
                          </div>
                          <div className="flex-1 pl-2">
                            <p className="text-zinc-500 text-[9px] font-sans">Introduced By</p>
                            <p className={`truncate max-w-[100px] font-mono font-semibold ${
                              themeMode === 'light' ? 'text-zinc-750' : 'text-zinc-350'
                            }`}>
                              {currentUser.referredBy === 'none' 
                                ? 'No referrer' 
                                : users.find(u => u.uid === currentUser.referredBy)?.name || currentUser.referredBy
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ENTER INVITATION CODE FORM */}
                      <form onSubmit={handleReferralSubmission} className={`space-y-3 p-4 rounded-xl border transition-all ${
                        themeMode === 'light' ? 'bg-white border-zinc-200 shadow-sm text-zinc-800' : 'bg-[#0c0c0c] border-zinc-900 text-zinc-100'
                      }`}>
                        <h4 className={`text-xs font-serif font-black uppercase tracking-wider ${
                          themeMode === 'light' ? 'text-amber-600' : 'text-gold-400'
                        }`}>Validate Invite promo</h4>
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">Insert a friend's active code below. Valid once per document session. Generates mutual +100 point credits.</p>

                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={enteredReferralCode}
                            onChange={(e) => setEnteredReferralCode(e.target.value)}
                            disabled={currentUser.referredBy !== 'none'}
                            placeholder={currentUser.referredBy !== 'none' ? "Code already validated" : "Promo e.g. REE7491"}
                            className={`w-full rounded-lg p-2 text-center font-mono uppercase font-bold text-xs placeholder-zinc-450 focus:outline-none transition-all disabled:cursor-not-allowed disabled:opacity-40 border ${
                              themeMode === 'light'
                                ? 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-amber-500/55'
                                : 'bg-[#050505] border-zinc-900 text-[#f5edcb] focus:border-gold-500/40'
                            }`}
                          />
                        </div>

                        {referralFeedback && (
                          <div className={`p-2.5 rounded text-[10px] font-sans font-medium leading-normal ${
                            referralFeedback.success 
                              ? 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-400' 
                              : 'bg-red-950/20 border border-red-500/20 text-red-400'
                          }`}>
                            {referralFeedback.text}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={currentUser.referredBy !== 'none'}
                          className={`w-full font-bold py-2 text-xs rounded transition-all cursor-pointer border ${
                            currentUser.referredBy !== 'none'
                              ? 'bg-zinc-950/20 text-zinc-500 border-zinc-500/15 cursor-not-allowed'
                              : (themeMode === 'light'
                                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white border-transparent shadow shadow-amber-500/10'
                                  : 'bg-gradient-to-r from-gold-600 to-gold-400 text-black border-gold-500/10 shadow shadow-gold-500/10')
                          }`}
                        >
                          {currentUser.referredBy !== 'none' ? 'Promo Code Utilized' : 'Authorize Invitation'}
                        </button>
                      </form>

                      {/* ACTIVE AUDITS COMPRESSED LIST */}
                      <div className="space-y-2">
                        <h5 className="text-[9px] uppercase font-serif font-extrabold text-zinc-500 tracking-widest">Active Connections</h5>
                        
                        {referrals.filter(r => r.referrerUid === currentUser.uid || r.referredUid === currentUser.uid).length === 0 ? (
                          <p className={`text-[9px] text-center py-4 rounded border border-dashed font-sans ${
                            themeMode === 'light'
                              ? 'bg-zinc-50 border-zinc-205 text-zinc-500'
                              : 'bg-[#0a0a0a]/30 border-zinc-900 text-zinc-650'
                          }`}>
                            No invite records found. Invite companions using your code!
                          </p>
                        ) : (
                          <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                            {referrals.filter(r => r.referrerUid === currentUser.uid || r.referredUid === currentUser.uid).map((ref, idx) => {
                              const partnerUid = ref.referrerUid === currentUser.uid ? ref.referredUid : ref.referrerUid;
                              const partnerName = users.find(u => u.uid === partnerUid)?.name || 'Invited User';
                              const role = ref.referrerUid === currentUser.uid ? 'Host Referrer' : 'Introduced user';
                              
                              return (
                                <div key={idx} className={`p-2 border rounded flex justify-between items-center text-[10px] transition-all ${
                                  themeMode === 'light' ? 'bg-zinc-100/50 border-zinc-200' : 'bg-[#0b0b0b] border-zinc-900'
                                }`}>
                                  <div>
                                    <p className={`font-semibold font-sans truncate max-w-[130px] ${themeMode === 'light' ? 'text-zinc-800' : 'text-zinc-300'}`}>{partnerName}</p>
                                    <span className={`text-[8px] font-mono italic ${themeMode === 'light' ? 'text-amber-600 font-bold' : 'text-gold-400'}`}>{role}</span>
                                  </div>
                                  <div className="bg-emerald-500/5 text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/10 text-[9px]">
                                    +100 Pts
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* ARCADE / PLAY ZONE (SCREEN 4.5 - NEW ADDITION) */}
                  {mobileScreen === 'game' && currentUser && (
                    <div className="space-y-4 pb-24 animate-fade-in text-left">
                      
                      {/* Active Multiplier Promo Banner */}
                      <div className={`p-3.5 rounded-2xl text-center space-y-1.5 border transition-all ${
                        boostTimeLeft > 0 
                          ? 'bg-gradient-to-tr from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-100 shadow-lg animate-pulse'
                          : themeMode === 'light'
                            ? 'bg-gradient-to-tr from-zinc-50 to-white border-zinc-200 text-zinc-800'
                            : 'bg-zinc-950/40 border-zinc-900 text-zinc-300'
                      }`}>
                        {boostTimeLeft > 0 ? (
                          <div className="flex flex-col items-center justify-center space-y-1">
                            <div className="flex items-center space-x-1">
                              <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-bounce" />
                              <span className="font-serif font-black uppercase text-xs tracking-wider text-amber-400 text-center">
                                {t.doublePointsActive}
                              </span>
                            </div>
                            <p className="text-[9px] text-zinc-400 font-mono text-center">
                              Multiplier duration: {Math.floor(boostTimeLeft / 60)}m {boostTimeLeft % 60}s left
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-1 text-center">
                            <span className="font-serif font-black uppercase text-[10px] tracking-wide text-zinc-400">
                              No Point Booster Active
                            </span>
                            <p className="text-[9px] text-zinc-500 max-w-[200px] leading-tight font-sans">
                              Watch a rewarded video in the Dashboard or Store to unlock 2x Points multiplier & Premium levels!
                            </p>
                            {rewardedCooldownLeft > 0 ? (
                              <div className="text-[8px] font-mono text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/15 mt-1">
                                Ad Cooldown: {Math.floor(rewardedCooldownLeft / 60)}m {rewardedCooldownLeft % 60}s
                              </div>
                            ) : (
                              <button
                                onClick={startAdMobVideoPlayback}
                                className="mt-1 px-3 py-1 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-black text-[8px] font-black tracking-widest uppercase rounded flex items-center justify-center space-x-1 cursor-pointer transition-all active:scale-95 border-none"
                              >
                                <span>Get Booster (+5 Pts)</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Game Mode Selector Tabs */}
                      <div className="flex bg-zinc-950/60 p-1 rounded-xl border border-zinc-900/80 justify-around select-none">
                        <button
                          onClick={() => setGameMode('trivia')}
                          className={`flex-1 text-center py-1.5 text-[9.5px] font-bold rounded-lg transition-all border-none bg-transparent cursor-pointer ${
                            gameMode === 'trivia'
                              ? 'bg-zinc-800 text-gold-400 shadow-md font-black'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {t.triviaQuest}
                        </button>
                        <button
                          onClick={() => setGameMode('tapper')}
                          className={`flex-1 text-center py-1.5 text-[9.5px] font-bold rounded-lg transition-all border-none bg-transparent cursor-pointer ${
                            gameMode === 'tapper'
                              ? 'bg-zinc-800 text-gold-400 shadow-md font-black'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {t.coinTapper}
                        </button>
                      </div>

                      {/* MODE A: TRIVIA CHALLENGE */}
                      {gameMode === 'trivia' && (
                        <div className={`p-4 rounded-xl border space-y-3.5 transition-all ${
                          themeMode === 'light' ? 'bg-white border-zinc-200' : 'bg-black/40 border-zinc-900'
                        }`}>
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded px-1.5 py-0.5 tracking-wider uppercase">
                              Level {activeTriviaIndex + 1}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-500">
                              Question {activeTriviaIndex + 1} of {TRIVIA_QUESTIONS.length}
                            </span>
                          </div>

                          {/* Question text */}
                          <p className={`text-[11.5px] font-bold leading-relaxed ${themeMode === 'light' ? 'text-zinc-850' : 'text-zinc-100'}`}>
                            {language === 'am' ? TRIVIA_QUESTIONS[activeTriviaIndex].am.question : TRIVIA_QUESTIONS[activeTriviaIndex].en.question}
                          </p>

                          {/* Options Grid */}
                          <div className="space-y-2">
                            {(() => {
                              const currentQ = language === 'am' ? TRIVIA_QUESTIONS[activeTriviaIndex].am : TRIVIA_QUESTIONS[activeTriviaIndex].en;
                              return currentQ.options.map((option, idx) => {
                                let optionStyle = "border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700";
                                if (themeMode === 'light') {
                                  optionStyle = "border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700";
                                }

                                if (selectedAnswerIndex === idx) {
                                  optionStyle = "border-amber-500 bg-amber-500/10 text-amber-400";
                                }

                                if (answerSubmitted) {
                                  if (idx === currentQ.correctIndex) {
                                    optionStyle = "border-emerald-550 bg-emerald-500/15 text-emerald-400 font-extrabold";
                                  } else if (selectedAnswerIndex === idx) {
                                    optionStyle = "border-rose-550 bg-rose-500/15 text-rose-450";
                                  } else {
                                    optionStyle = "opacity-40 border-zinc-900";
                                  }
                                }

                                return (
                                  <button
                                    key={idx}
                                    disabled={answerSubmitted}
                                    onClick={() => handleTriviaAnswerSelect(idx)}
                                    className={`w-full p-2.5 text-left text-[10px] rounded-lg border font-medium transition-all duration-200 flex justify-between items-center cursor-pointer bg-transparent ${optionStyle}`}
                                  >
                                    <span>{option}</span>
                                    {answerSubmitted && idx === currentQ.correctIndex && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    )}
                                    {answerSubmitted && selectedAnswerIndex === idx && idx !== currentQ.correctIndex && (
                                      <X className="w-3.5 h-3.5 text-rose-400" />
                                    )}
                                  </button>
                                );
                              });
                            })()}
                          </div>

                          {/* Verify/Next Button */}
                          {!answerSubmitted ? (
                            <button
                              disabled={selectedAnswerIndex === null}
                              onClick={handleTriviaVerification}
                              className={`w-full py-2 rounded font-black font-sans uppercase text-[10.5px] tracking-wide transition-all border-none flex items-center justify-center space-x-1.5 ${
                                selectedAnswerIndex === null
                                  ? 'bg-zinc-850 text-zinc-500 cursor-not-allowed opacity-50'
                                  : 'bg-[#e5b83b] hover:bg-[#d4af37] text-black cursor-pointer'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{t.selectAnswer}</span>
                            </button>
                          ) : (
                            <button
                              onClick={handleNextTriviaQuestion}
                              className="w-full py-2 bg-[#e5b83b] hover:bg-[#d4af37] text-black rounded font-black font-sans uppercase text-[10.5px] tracking-wide transition-all cursor-pointer flex items-center justify-center space-x-1 border-none"
                            >
                              <span>{language === 'am' ? 'ቀጣይ ጥያቄ' : 'Next Level'}</span>
                              <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* MODE B: GOLDEN COIN TAPPER */}
                      {gameMode === 'tapper' && (
                        <div className={`p-4 rounded-xl border space-y-3.5 transition-all flex flex-col items-center ${
                          themeMode === 'light' ? 'bg-white border-zinc-200' : 'bg-black/40 border-zinc-900'
                        }`}>
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[8px] font-mono text-zinc-500">
                              {language === 'am' ? 'የፍጥነት መለኪያ ጨዋታ' : 'Reflex Multiplier Arena'}
                            </span>
                            <span className="text-[9px] font-mono text-gold-500 font-bold">
                              Score: {tapScore} Pts Gained
                            </span>
                          </div>

                          <p className={`text-[10px] text-center leading-relaxed font-sans ${themeMode === 'light' ? 'text-zinc-650' : 'text-zinc-400'}`}>
                            {language === 'am' 
                              ? 'ሲገለጥ ወርቃማውን ሳንቲም በፍጥነት በመንካት ነጥብ ይሰብስቡ!' 
                              : 'Tap the glowing golden cell immediately when it lights up to claim your reward points!'}
                          </p>

                          {/* Grid cells (6 cells: 2 columns, 3 rows) */}
                          <div className="grid grid-cols-3 gap-2 w-full mt-2">
                            {Array.from({ length: 6 }).map((_, cellIdx) => {
                              const isActive = cellIdx === activeCoinCell;
                              return (
                                <button
                                  key={cellIdx}
                                  onClick={() => handleCoinTap(cellIdx)}
                                  className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-150 border relative overflow-hidden bg-transparent cursor-pointer ${
                                    isActive
                                      ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20 scale-102 ring-1 ring-amber-400'
                                      : 'border-zinc-800 bg-zinc-950/20 opacity-80 hover:bg-zinc-900/10'
                                  }`}
                                >
                                  {isActive && (
                                    <>
                                      <div className="absolute inset-0 bg-gradient-radial from-amber-500/30 to-transparent animate-ping"></div>
                                      <Coins className="w-6 h-6 text-amber-400 fill-amber-400 stroke-[2] animate-bounce" />
                                    </>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Quick statistics */}
                          {boostTimeLeft > 0 && (
                            <div className="flex items-center space-x-1 pt-1.5 text-amber-500 font-sans text-[9.5px] font-semibold animate-pulse">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span>⚡ Points Doubled (+2 per coin tap!)</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SYSTEM & NETWORK SETTINGS (SCREEN 4) */}
                  {mobileScreen === 'setting' && currentUser && (
                    <div className="space-y-4 pb-20 animate-fade-in">
                      
                      {settingSubView === 'main' ? (
                        <>
                          {/* Interactive App controls */}
                          <div className={`p-4 rounded-xl space-y-3.5 transition-all border ${
                            themeMode === 'light' ? 'bg-white border-zinc-200 shadow-sm' : 'bg-[#0c0c0c] border-zinc-900'
                          }`}>
                            
                            {/* Theme Toggle option */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Layers className="w-4 h-4 text-zinc-400" />
                                <div className="text-left">
                                  <p className={`text-[11px] font-bold ${themeMode === 'light' ? 'text-zinc-800' : 'text-zinc-200'}`}>{language === 'am' ? 'ገጽታ' : 'App Theme'}</p>
                                  <p className="text-[9px] text-zinc-500">{themeMode === 'light' ? 'Light Theme Active' : 'Dark Theme Active'}</p>
                                </div>
                              </div>
                              
                              {/* Toggle Switch */}
                              <button
                                onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                                className={`w-[36px] h-[22px] rounded-full p-0.5 transition-colors relative focus:outline-none flex items-center cursor-pointer ${
                                  themeMode === 'light' ? 'bg-amber-500 text-white' : 'bg-zinc-800 border border-zinc-700'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                                  themeMode === 'light' ? 'translate-x-[14px]' : 'translate-x-0'
                                }`} />
                              </button>
                            </div>

                            {/* Language Selection option */}
                            <div className="flex items-center justify-between border-t border-zinc-900/10 pt-3">
                              <div className="flex items-center space-x-2">
                                <Compass className="w-4 h-4 text-zinc-400" />
                                <div className="text-left">
                                  <p className={`text-[11px] font-bold ${themeMode === 'light' ? 'text-zinc-800' : 'text-zinc-200'}`}>{language === 'am' ? 'ቋንቋ' : 'Language'}</p>
                                  <p className="text-[9px] text-zinc-500">{language === 'en' ? 'English (US)' : 'አማርኛ (Ethiopia)'}</p>
                                </div>
                              </div>

                              {/* Language Choice buttons */}
                              <div className={`flex space-x-1 p-0.5 rounded-md border ${
                                themeMode === 'light' ? 'bg-zinc-100 border-zinc-200' : 'bg-black/20 border-zinc-850'
                              }`}>
                                <button
                                  onClick={() => setLanguage('en')}
                                  className={`px-2 py-0.5 text-[9px] font-extrabold rounded cursor-pointer transition-all ${
                                    language === 'en' 
                                      ? (themeMode === 'light' ? 'bg-amber-500 text-white font-black shadow-sm' : 'bg-gold-400 text-black font-black') 
                                      : (themeMode === 'light' ? 'text-zinc-500 hover:text-zinc-800 animate-none' : 'text-zinc-500 hover:text-zinc-400')
                                  }`}
                                >
                                  EN
                                </button>
                                <button
                                  onClick={() => setLanguage('am')}
                                  className={`px-2 py-0.5 text-[9px] font-extrabold rounded cursor-pointer transition-all ${
                                    language === 'am' 
                                      ? (themeMode === 'light' ? 'bg-amber-500 text-white font-black shadow-sm' : 'bg-gold-400 text-black font-black') 
                                      : (themeMode === 'light' ? 'text-zinc-500 hover:text-zinc-800 animate-none' : 'text-zinc-500 hover:text-zinc-400')
                                  }`}
                                >
                                  አማ
                                </button>
                              </div>
                            </div>

                            {/* QA Speed Testing Accelerator Option */}
                            <div className="flex items-center justify-between border-t border-zinc-900/10 pt-3">
                              <div className="flex items-center space-x-2">
                                <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                                <div className="text-left">
                                  <p className={`text-[11px] font-bold ${themeMode === 'light' ? 'text-[#040404]' : 'text-zinc-200'}`}>QA Speed Testing Mode</p>
                                  <p className="text-[9px] text-zinc-500">Accelerates ad cooldown to 15s / multiplier to 30s</p>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setActiveSpeedTesting(!activeSpeedTesting);
                                  addLog('system', `QA Simulation: Toggled speed testing mode to ${!activeSpeedTesting ? 'ENABLED' : 'DISABLED'}`);
                                }}
                                className={`w-[36px] h-[22px] rounded-full p-0.5 transition-colors relative focus:outline-none flex items-center cursor-pointer ${
                                  activeSpeedTesting ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                                  activeSpeedTesting ? 'translate-x-[14px]' : 'translate-x-0'
                                }`} />
                              </button>
                            </div>

                          </div>

                          {/* About Page Trigger Link */}
                          <button
                            onClick={() => setSettingSubView('about')}
                            className={`w-full p-4 rounded-xl flex items-center justify-between transition-all border text-left cursor-pointer ${
                              themeMode === 'light' ? 'bg-white border-zinc-200 shadow-sm hover:bg-zinc-50' : 'bg-[#0c0c0c] border-[#1c1c1c]/80 hover:bg-[#111]'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <User className="w-4 h-4 text-gold-400 animate-pulse" />
                              <div className="text-left">
                                <p className={`text-[11px] font-bold ${themeMode === 'light' ? 'text-zinc-800' : 'text-zinc-200'}`}>{language === 'am' ? 'ስለ እኔ / ገለጻ' : 'About Me / Developer Info'}</p>
                                <p className="text-[9px] text-zinc-500">bahreab feleke</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-400" />
                          </button>

                          {/* SYSTEM SETTINGS METADATA */}
                          <div className={`border rounded-xl divide-y text-[10px] overflow-hidden transition-all ${
                            themeMode === 'light' 
                              ? 'bg-white border-zinc-205 divide-zinc-200 text-zinc-700' 
                              : 'bg-[#0c0c0c] border-zinc-900 divide-zinc-900 text-zinc-400'
                          }`}>
                            
                            <div className={`p-3 flex justify-between items-center transition-colors ${
                              themeMode === 'light' ? 'bg-amber-500/5' : 'bg-gold-400/5'
                            }`}>
                              <span className="text-zinc-500 flex items-center space-x-1.5 font-semibold">
                                <Award className={`w-3.5 h-3.5 ${themeMode === 'light' ? 'text-amber-600 animate-none' : 'text-gold-400'}`} />
                                <span>Developer Creator</span>
                              </span>
                              <span className={`font-serif font-extrabold uppercase tracking-wide ${
                                themeMode === 'light' ? 'text-amber-600' : 'text-gold-400'
                              }`}>bahreab feleke</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                              <span className="text-zinc-500">Personal Referral Key</span>
                              <span className={`font-mono font-bold ${
                                themeMode === 'light' ? 'text-amber-650' : 'text-gold-400'
                              }`}>{currentUser.myReferralCode}</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                              <span className="text-zinc-500">Document Parent Status</span>
                              <span className="font-mono">
                                {currentUser.referredBy === 'none' ? 'Primary Document' : 'Referral Child'}
                              </span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                              <span className="text-zinc-500">Sandbox Database State</span>
                              <span className="text-emerald-400 flex items-center space-x-1 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                                <span>Firestore Online</span>
                              </span>
                            </div>
                            
                          </div>

                          {/* Log out of Profile Button */}
                          <button
                            onClick={() => {
                              setActiveUid('');
                              addLog('auth', `Auth Logout: Logged out profile details`);
                              setMobileScreen('auth');
                            }}
                            className={`w-full border p-2.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 cursor-pointer transition-all ${
                              themeMode === 'light'
                                ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600'
                                : 'bg-[#1b1b1b] hover:bg-[#252525] border-zinc-850 text-red-400'
                            }`}
                          >
                            <LogOut className="w-3.5 h-3.5 text-red-400" />
                            <span>{t.signout}</span>
                          </button>
                        </>
                      ) : (
                        /* DEDICATED ABOUT ME SUB-VIEW SCREEN */
                        <div className="space-y-4 animate-fade-in text-left">
                          
                          {/* Back to main setting header */}
                          <button
                            onClick={() => setSettingSubView('main')}
                            className={`flex items-center space-x-1 text-[10px] uppercase tracking-wider font-extrabold transition-colors p-1 cursor-pointer ${
                              themeMode === 'light' ? 'text-amber-600 hover:text-amber-500' : 'text-gold-300 hover:text-gold-200'
                            }`}
                          >
                            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                            <span>{language === 'am' ? 'ተመለስ' : 'Back to Settings'}</span>
                          </button>

                          {/* Premium developer bio card */}
                          <div className={`p-5 rounded-2xl border relative overflow-hidden transition-all ${
                            themeMode === 'light' 
                              ? 'bg-gradient-to-b from-white to-zinc-50 border-zinc-200 shadow' 
                              : 'bg-gradient-to-b from-[#0a0a0a] to-[#010101] border-zinc-900 shadow-xl'
                          }`}>
                            
                            {/* Decorative gold ambient glow in dark mode */}
                            {themeMode !== 'light' && (
                              <div className="absolute right-0 top-0 w-24 h-24 bg-gold-400/5 rounded-full filter blur-xl pointer-events-none" />
                            )}

                            <div className="flex flex-col items-center text-center space-y-3">
                              
                              {/* Avatar placeholder / decorative badge */}
                              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gold-600 to-amber-400 p-0.5 flex items-center justify-center shadow-lg">
                                <div className={`w-full h-full rounded-full flex items-center justify-center font-serif text-lg font-black ${
                                  themeMode === 'light' ? 'bg-white text-zinc-900' : 'bg-black text-gold-400'
                                }`}>
                                  BF
                                </div>
                              </div>

                              <div className="space-y-0.5">
                                <h3 className={`font-serif text-base font-black tracking-wide uppercase ${
                                  themeMode === 'light' ? 'text-zinc-900' : 'text-[#f5edcb]'
                                }`}>
                                  bahreab feleke
                                </h3>
                                <p className="text-[9px] font-mono uppercase tracking-widest text-gold-500 weight-black font-extrabold">
                                  Full-Stack Engineer & Creator
                                </p>
                              </div>

                              <div className={`w-12 h-0.5 rounded-full ${themeMode === 'light' ? 'bg-zinc-200' : 'bg-zinc-850'}`} />

                              {/* Personal detailed bio text */}
                              <div className={`text-[10.5px] leading-relaxed font-sans ${themeMode === 'light' ? 'text-zinc-650' : 'text-zinc-400'}`}>
                                <p>
                                  {language === 'am' ? (
                                    'እንኳን ደህና መጡ! እኔ ባህርአብ ፈለቀ (bahreab feleke) እባላለሁ። AdQuest የተሰኘውን ይህንን ዘመናዊ መተግበርያ ሙሉ በሙሉ የገነባሁት ሲሆን ፤ መተግበርያው የቀጣይ ትውልድ ስማርት የሽልማት ማስተላለፊያዎችን ፣ የግብዣ ስርዓቶችን እንዲሁም የአድሞብ ማስታወቂያዎችን በተጨባጭ የሚቀርጽ ነው።'
                                  ) : (
                                    "Hi, I'm Bahreab Feleke! I am the lead software architect behind AdQuest Rewards & Referrals Emulator. I design fluid client interfaces, highly integrated NoSQL database adapters, and interactive simulation structures with pixel-perfect modern visual layouts."
                                  )}
                                </p>
                              </div>

                              {/* Special stats or features */}
                              <div className="grid grid-cols-2 gap-2 w-full pt-2">
                                <div className={`p-2 rounded-lg text-center border ${
                                  themeMode === 'light' ? 'bg-zinc-100/50 border-zinc-200' : 'bg-zinc-900/40 border-zinc-900'
                                }`}>
                                  <p className="text-[8px] text-zinc-500 uppercase tracking-wider font-mono">My Vision</p>
                                  <p className={`text-[10px] font-bold mt-0.5 ${themeMode === 'light' ? 'text-zinc-800' : 'text-zinc-200'}`}>Clean Craft</p>
                                </div>
                                <div className={`p-2 rounded-lg text-center border ${
                                  themeMode === 'light' ? 'bg-zinc-100/50 border-zinc-200' : 'bg-zinc-900/40 border-zinc-900'
                                }`}>
                                  <p className="text-[8px] text-zinc-500 uppercase tracking-wider font-mono">Expertise</p>
                                  <p className={`text-[10px] font-bold mt-0.5 ${themeMode === 'light' ? 'text-zinc-800' : 'text-zinc-200'}`}>Mobile & Web</p>
                                </div>
                              </div>

                              <div className="pt-2 w-full">
                                <button
                                  onClick={() => setSettingSubView('main')}
                                  className="w-full bg-gold-400 hover:bg-gold-300 text-black p-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wide cursor-pointer text-center"
                                >
                                  {language === 'am' ? 'እሺ' : 'Dismiss'}
                                </button>
                              </div>

                            </div>

                          </div>

                        </div>
                      )}

                    </div>
                  )}

                </div>

                {/* 3. FLOATING BOTTOM NAVIGATION BAR (Glossy capsule hovering above content) */}
                {mobileScreen !== 'auth' && currentUser && (
                  <div className="absolute bottom-4 left-4 right-4 z-40 select-none">
                    <nav className={`p-1.5 rounded-2xl flex justify-between items-center border shadow-xl backdrop-blur-md transition-all duration-300 ${
                      themeMode === 'light' 
                        ? 'bg-white/95 border-zinc-200 text-zinc-700 shadow-zinc-300/40' 
                        : 'bg-black/90 border-[#1c1c1c]/80 text-zinc-400 shadow-black/85'
                    }`}>
                      {/* DASHBOARD TAB */}
                      <button
                        onClick={() => handleMobileScreenChange('dashboard')}
                        className={`flex-1 flex flex-col items-center py-1 px-1.5 space-y-0.5 rounded-xl transition-all border-none bg-transparent cursor-pointer ${
                          mobileScreen === 'dashboard'
                            ? (themeMode === 'light' ? 'text-amber-600 bg-amber-500/10 font-bold' : 'text-gold-400 bg-gold-400/10 font-bold')
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Home className="w-4 h-4 transition-colors" />
                        <span className="text-[7px] tracking-wide font-sans font-black uppercase text-center">{t.dashboard}</span>
                      </button>

                      {/* STORE TAB */}
                      <button
                        onClick={() => handleMobileScreenChange('store')}
                        className={`flex-1 flex flex-col items-center py-1 px-1.5 space-y-0.5 rounded-xl transition-all border-none bg-transparent cursor-pointer ${
                          mobileScreen === 'store'
                            ? (themeMode === 'light' ? 'text-amber-600 bg-amber-500/10 font-bold' : 'text-gold-400 bg-gold-400/10 font-bold')
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4 transition-colors" />
                        <span className="text-[7px] tracking-wide font-sans font-black uppercase text-center">{t.store}</span>
                      </button>

                      {/* ARCADE / INTERACTIVE PLAY ZONE TAB */}
                      <button
                        onClick={() => handleMobileScreenChange('game')}
                        className={`flex-1 flex flex-col items-center py-1 px-1.5 space-y-0.5 rounded-xl transition-all border-none bg-transparent cursor-pointer ${
                          mobileScreen === 'game'
                            ? (themeMode === 'light' ? 'text-amber-600 bg-amber-500/10 font-bold' : 'text-gold-400 bg-gold-400/10 font-bold')
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Flame className="w-4 h-4 transition-colors text-amber-500" />
                        <span className="text-[7px] tracking-wide font-sans font-black uppercase text-center">{t.gameTab}</span>
                      </button>

                      {/* REFERRAL TAB */}
                      <button
                        onClick={() => handleMobileScreenChange('referral')}
                        className={`flex-1 flex flex-col items-center py-1 px-1.5 space-y-0.5 rounded-xl transition-all border-none bg-transparent cursor-pointer ${
                          mobileScreen === 'referral'
                            ? (themeMode === 'light' ? 'text-amber-600 bg-amber-500/10 font-bold' : 'text-gold-400 bg-gold-400/10 font-bold')
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Gift className="w-4 h-4 transition-colors" />
                        <span className="text-[7px] tracking-wide font-sans font-black uppercase text-center">{t.earn}</span>
                      </button>

                      {/* SETTING TAB */}
                      <button
                        onClick={() => handleMobileScreenChange('setting')}
                        className={`flex-1 flex flex-col items-center py-1 px-1.5 space-y-0.5 rounded-xl transition-all border-none bg-transparent cursor-pointer ${
                          mobileScreen === 'setting'
                            ? (themeMode === 'light' ? 'text-amber-600 bg-amber-500/10 font-bold' : 'text-gold-400 bg-gold-400/10 font-bold')
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Settings className="w-4 h-4 transition-colors" />
                        <span className="text-[7px] tracking-wide font-sans font-black uppercase text-center">{t.setting}</span>
                      </button>
                    </nav>
                  </div>
                )}

              </div>
            </div>

            {/* MOBILE QUICK-BOOST ACCELERATOR FOOTNOTE */}
            <div className="mt-3 text-center text-zinc-600 text-[9px] space-y-1 select-none font-mono">
              <p>Simulating Dart virtual thread triggers on port 3000</p>
              <p>Double-incentive transaction models compiled successfully</p>
            </div>

          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#0b0b0b] py-6 px-6 border-t border-zinc-950 text-zinc-605 text-[11px] font-sans text-center">
        <p className="max-w-2xl mx-auto leading-relaxed text-zinc-600">© 2026 AdQuest Mobile Hub • Production-Ready Flutter Firebase Integration Sandbox • Crafted with exquisite typographic hierarchy under Google AI Studio specifications.</p>
      </footer>
    </div>
  );
}
