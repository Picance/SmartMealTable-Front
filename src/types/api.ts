// API 공통 응답 타입
export type ResultType = "SUCCESS" | "ERROR";

export interface ApiResponse<T = any> {
  result: ResultType;
  data: T | null;
  error: ErrorMessage | null;
}

export interface ErrorMessage {
  code: string;
  message: string;
  data?: any;
}

// 페이징 타입
export interface Pageable {
  page: number;
  size: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// 인증 관련
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  memberId: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  memberId: number;
  email: string;
  name: string;
  onboardingComplete: boolean;
}

// 소셜 로그인 요청 (구글, 카카오)
export interface SocialLoginRequest {
  authorizationCode: string;
  redirectUri: string;
}

// 소셜 로그인 응답
export interface SocialLoginResponse {
  accessToken: string;
  refreshToken: string;
  memberId: number;
  email: string;
  name: string;
  profileImageUrl?: string;
  onboardingComplete: boolean;
}

// 이메일 중복 확인 응답
export interface EmailCheckResponse {
  available: boolean;
  message: string;
}

// 온보딩 관련
export interface OnboardingProfileRequest {
  nickname: string;
  groupId?: number;
}

export interface OnboardingProfileResponse {
  memberId: number;
  nickname: string;
  group: Group;
}

export interface AddressRequest {
  addressAlias: string;
  addressType: "HOME" | "WORK" | "ETC";
  streetNameAddress: string;
  lotNumberAddress?: string;
  detailedAddress?: string;
  latitude: number;
  longitude: number;
  isPrimary: boolean;
}

export interface BudgetRequest {
  monthlyBudget: number;
  dailyBudget: number;
  mealBudgets: {
    BREAKFAST: number;
    LUNCH: number;
    DINNER: number;
  };
}

export interface PreferenceRequest {
  recommendationType: "SAVER" | "ADVENTURER" | "BALANCED";
  preferences: Array<{
    categoryId: number;
    weight: 100 | 0 | -100;
  }>;
}

export interface FoodPreferenceRequest {
  preferredFoodIds: number[];
}

export interface FoodPreferenceResponse {
  savedCount: number;
  preferredFoods: Array<{
    foodId: number;
    foodName: string;
    categoryName: string;
    imageUrl: string;
  }>;
  message: string;
}

export interface PolicyAgreementRequest {
  agreements: Array<{
    policyId: number;
    isAgreed: boolean;
  }>;
}

export interface PolicyAgreementResponse {
  agreedCount: number;
  memberAuthenticationId: number;
  message: string;
}

// 가게 관련
export interface Store {
  storeId: number;
  storeName: string;
  category: string;
  categoryId: number;
  distance: number;
  reviewCount: number;
  averagePrice: number;
  isOpen: boolean;
  popularityTag: string;
  imageUrl: string;
  address: string;
  isFavorite?: boolean;
}

export interface StoreDetail extends Store {
  description: string;
  operatingHours: Array<{
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    isHoliday: boolean;
  }>;
  phone: string;
  location: {
    latitude: number;
    longitude: number;
  };
  menus: Menu[];
  isFavorite: boolean;
}

export interface Menu {
  foodId: number;
  foodName: string;
  price: number;
  imageUrl: string;
  description: string;
  budgetDifference?: number;
  isRecommended?: boolean;
}

// 지출 관련
export interface Expenditure {
  expenditureId: number;
  storeName: string;
  amount: number;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  expendedDate: string;
  expendedTime: string;
  categoryId: number;
  categoryName: string;
  memo?: string;
  items?: ExpenditureItem[];
}

export interface ExpenditureItem {
  foodName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateExpenditureRequest {
  storeName: string;
  amount: number;
  expendedDate: string;
  expendedTime: string;
  categoryId: number;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  memo?: string;
  items?: ExpenditureItem[];
}

// 장바구니 관련
export interface CartItem {
  cartItemId: number;
  foodId: number;
  foodName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl: string;
  options?: Array<{
    optionName: string;
    optionValue: string;
    additionalPrice: number;
  }>;
}

export interface Cart {
  cartId: number;
  storeId: number;
  storeName: string;
  items: CartItem[];
  totalAmount: number;
}

// 예산 관련
export interface Budget {
  monthlyBudget: number;
  dailyBudget: number;
  spent: number;
  remaining: number;
  mealBudgets: {
    BREAKFAST: { budget: number; spent: number };
    LUNCH: { budget: number; spent: number };
    DINNER: { budget: number; spent: number };
  };
}

// 추천 관련
export interface RecommendationRequest {
  latitude?: number;
  longitude?: number;
  radius?: 0.5 | 1 | 2;
  excludeDisliked?: boolean;
  isOpenOnly?: boolean;
  storeType?: "ALL" | "CAMPUS_RESTAURANT" | "RESTAURANT";
  sortBy?:
    | "recommendation"
    | "distance"
    | "reviewCount"
    | "priceAsc"
    | "priceDesc";
}

// 그룹 관련
export interface Group {
  groupId: number;
  name: string;
  type: "UNIVERSITY" | "COMPANY" | "OTHER";
  address: string;
}

// 그룹 목록 페이징 정보
export interface GroupPageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// 그룹 목록 조회 응답
export interface GroupListResponse {
  content: Group[];
  pageInfo: GroupPageInfo;
}

// 카테고리 관련
export interface Category {
  categoryId: number;
  name: string; // API 응답 구조에 맞게 수정
}

// 음식 관련
export interface Food {
  foodId: number;
  foodName: string;
  categoryId: number;
  categoryName: string;
  imageUrl: string;
  description: string;
  averagePrice: number;
}

// 약관 관련
export interface Policy {
  policyId: number;
  title: string;
  type: "REQUIRED" | "OPTIONAL";
  version: string;
  content?: string;
}

export interface PolicyListResponse {
  policies: Policy[];
}

export interface PolicyDetailResponse {
  policyId: number;
  title: string;
  content: string;
  type: "REQUIRED" | "OPTIONAL";
  version: string;
}
