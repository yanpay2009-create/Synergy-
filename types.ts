export enum UserTier {
  STARTER = 'Starter', // 5%
  MARKETER = 'Marketer', // 8% (Req: 3000 sales)
  BUILDER = 'Builder', // 12% (Req: 9000 sales)
  EXECUTIVE = 'Executive' // 15% (Req: 18000 sales)
}

export interface SystemSettings {
  logo: string | null;
  contactLinks: {
    line: string;
    phone: string;
    email: string;
    website: string;
    terms: string;
    privacy: string;
  };
}

export interface Promotion {
  id: number;
  image: string;
  title: string;
  active: boolean;
  link?: string;
}

export interface CampaignAsset {
  id: number;
  title: string;
  description: string;
  image: string;
  active: boolean;
}

export interface Review {
  id: number;
  user: string;
  rating: number;
  text: string;
  date: string;
  images?: string[];
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  images?: string[]; 
  category: string;
  sold: number;
  description?: string;
  reviews?: Review[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Comment {
  id: number;
  user: string;
  avatar: string;
  text: string;
  date: string;
}

export interface FeedItem {
  id: number;
  type: 'image' | 'video';
  category: 'Trending' | 'For You';
  user: string;
  userId: string; 
  avatar: string;
  content: string; 
  caption: string;
  mood?: string;
  status: 'Approved' | 'Pending';
  likes: number;
  isLiked: boolean;
  shares: number;
  comments: Comment[];
  isAi: boolean;
}

export interface Ad {
  id: number;
  title: string;
  image: string;
  active: boolean;
  subtitle?: string;
}

export interface OnboardingSlide {
  id: number;
  title: string;
  desc: string;
  image: string;
}

export interface TeamMember {
  id: number;
  uplineId: string; 
  name: string;
  tier: UserTier;
  avatar: string;
  totalSales: number;
  joinedDate: string;
  relationship: 'Direct' | 'Indirect';
  phone?: string;
  lineId?: string;
}

export interface Referrer {
  name: string;
  code: string;
  tier: UserTier;
  avatar: string;
  phone: string;
  lineId: string;
}

export interface CommissionTransaction {
  id: number;
  userId: string; 
  orderId?: string; // Linked order
  date: string;
  source: string; 
  type: 'Direct' | 'Team' | 'Withdrawal';
  amount: number;
  salesVolume?: number; 
  status: 'Pending' | 'Paid' | 'Completed' | 'Waiting' | 'Cancelled';
}

export interface User {
  name: string;
  username?: string;
  email: string;
  phone?: string;
  lineId?: string;
  tier: UserTier;
  accumulatedSales: number;
  walletBalance: number;
  avatar: string;
  referralCode: string;
  pin?: string;
  password?: string;
  teamIncomeExpiry?: string; 
  socials?: {
    facebook: { connected: boolean; name: string };
    line: { connected: boolean; name: string };
    google: { connected: boolean; name: string };
  };
}

export interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  isDefault: boolean;
}

export interface Coupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  description: string;
}

export interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface CreditCardInfo {
  id: number;
  cardNumber: string;
  expiryDate: string;
  cardHolder: string;
  brand: 'Visa' | 'Mastercard' | 'JCB' | 'Amex';
}

export interface Notification {
  id: number;
  userId: string; 
  title: string;
  message: string;
  date: string;
  type: 'order' | 'promo' | 'system';
  read: boolean;
  relatedId?: string | number;
  relatedType?: 'order' | 'commission' | 'promo';
  relatedData?: string;
}

export interface ToastMessage {
  id: number;
  title: string;
  amount: number;
  user: string; // Buyer name or Promo Header
  earnerName?: string; // Account that received commission
  type: 'commission' | 'info' | 'promo';
  transactionId?: number;
  image?: string;
  description?: string;
  link?: string;
}

export type KYCStatus = 'Unverified' | 'Pending' | 'Verified' | 'Rejected';
export type PaymentType = 'Wallet' | 'CreditCard' | 'PromptPay';
export type OrderStatus = 'Pending' | 'To Ship' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderTimelineItem {
  status: string;
  date: string;
  completed: boolean;
}

export interface Order {
  id: string;
  userId: string; 
  date: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address; 
  trackingNumber?: string;
  shippingProvider?: string;
  timeline: OrderTimelineItem[];
}

export type Language = 'en' | 'th' | 'mm';
export type FontSize = 'small' | 'medium' | 'large';

export interface AppContextType {
  user: User | null;
  isLoggedIn: boolean;
  cart: CartItem[];
  products: Product[];
  feed: FeedItem[];
  ads: Ad[];
  campaignAssets: CampaignAsset[];
  onboardingSlides: OnboardingSlide[];
  team: TeamMember[];
  referrer: Referrer | null;
  commissions: CommissionTransaction[];
  orders: Order[];
  addresses: Address[];
  selectedAddressId: number | null;
  paymentMethod: PaymentType;
  appliedCoupon: Coupon | null;
  notifications: Notification[];
  activePromo: Promotion | null;
  systemSettings: SystemSettings;
  isSearchActive: boolean;
  setIsSearchActive: (active: boolean) => void;
  
  // Security State
  isSecurityUnlocked: boolean;
  setIsSecurityUnlocked: (unlocked: boolean) => void;

  // Notification State
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;

  // Floating Notification
  currentToast: ToastMessage | null;
  showToast: (msg: Omit<ToastMessage, 'id'>) => void;
  bottomNavHidden: boolean;
  setBottomNavHidden: (hidden: boolean) => void;
  dismissToast: () => void;
  
  // Admin Data Extensions
  allOrders: Order[];
  allTeamMembers: TeamMember[];
  allCommissions: CommissionTransaction[];

  // Personal Info & Security
  bankAccounts: BankAccount[];
  savedCards: CreditCardInfo[];
  selectedCardId: number | null;
  kycStatus: KYCStatus;

  // Language & Font
  language: Language;
  setLanguage: (lang: Language) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  t: (key: string) => string;
  
  login: (email: string, username?: string) => void;
  logout: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, delta: number) => void;
  checkout: () => void;
  calculateCommission: (price: number) => number;
  getNextTierTarget: () => number;
  getCommissionRate: () => number;
  
  // New Methods
  addAddress: (address: Omit<Address, 'id'>) => void;
  selectAddress: (id: number) => void;
  setPaymentMethod: (method: PaymentType) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  getCartTotals: () => { 
    subtotal: number; 
    discount: number; 
    memberDiscount: number; 
    couponDiscount: number;
    vat: number; 
    total: number 
  };

  // Personal Info Methods
  addBankAccount: (account: Omit<BankAccount, 'id'>) => boolean;
  removeBankAccount: (id: number) => void;
  
  // Credit Card Methods
  addCreditCard: (card: Omit<CreditCardInfo, 'id' | 'brand'>) => void;
  removeCreditCard: (id: number) => void;
  selectCreditCard: (id: number) => void;

  updateKycStatus: (status: KYCStatus) => void;
  updateUserProfile: (data: Partial<User>) => void;
  withdrawFunds: (amount: number, bankId: number) => CommissionTransaction | null;
  markNotificationAsRead: (id: number) => void;

  // Feed Methods
  toggleFeedLike: (id: number) => void;
  addFeedComment: (id: number, text: string) => void;
  createPost: (data: { image: string, caption: string, mood: string }) => void;
  
  // Real Functionality
  addReview: (productId: number, rating: number, text: string, images: string[]) => void;
  updateUserSocials: (platform: 'facebook' | 'line' | 'google', connected: boolean, name: string) => void;
  updateUserSecurity: (type: 'password' | 'pin', value: string) => void;
  addReferrer: (code: string) => boolean;
  updateOrderAddress: (orderId: string, address: Address) => void;

  // Admin Methods
  updateProduct: (productId: number, data: Partial<Product>) => void;
  deleteProduct: (productId: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateAd: (adId: number, data: Partial<Ad>) => void;
  deleteAd: (adId: number) => void;
  addAd: (ad: Omit<Ad, 'id'>) => void;
  updateCampaignAsset: (assetId: number, data: Partial<CampaignAsset>) => void;
  deleteCampaignAsset: (assetId: number) => void;
  addCampaignAsset: (asset: Omit<CampaignAsset, 'id'>) => void;
  updateOnboardingSlide: (slideId: number, data: Partial<OnboardingSlide>) => void;
  deleteOnboardingSlide: (slideId: number) => void;
  addOnboardingSlide: (slide: Omit<OnboardingSlide, 'id'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  updateCommissionStatus: (txId: number, status: CommissionTransaction['status']) => void;
  deleteCommission: (txId: number) => void;
  deleteTeamMember: (memberId: number) => void;
  updateMemberTier: (memberId: number, tier: UserTier) => void;
  updateFeedStatus: (postId: number, status: 'Approved' | 'Pending') => void;
  deleteFeedPost: (postId: number) => void;
  broadcastPromotion: (promo: Omit<Promotion, 'id' | 'active'>) => void;
  dismissPromotion: () => void;
  updateSystemSettings: (data: Partial<SystemSettings>) => void;
}