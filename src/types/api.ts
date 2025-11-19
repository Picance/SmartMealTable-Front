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

// 월별 예산 조회 응답
export interface MonthlyBudgetResponse {
  year: number;
  month: number;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  utilizationRate: number;
  daysRemaining: number;
}

// 일별 예산 조회 응답
export interface DailyBudgetResponse {
  date: string;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  mealBudgets: Array<{
    mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER";
    budget: number;
    spent: number;
    remaining: number;
  }>;
}

// 월별 예산 수정 요청
export interface UpdateMonthlyBudgetRequest {
  monthlyFoodBudget: number;
  dailyFoodBudget: number;
}

// 월별 예산 수정 응답
export interface UpdateMonthlyBudgetResponse {
  message: string;
}

// 일별 예산 수정 요청
export interface UpdateDailyBudgetRequest {
  dailyFoodBudget: number;
  applyForward?: boolean;
}

// 일별 예산 수정 응답
export interface UpdateDailyBudgetResponse {
  message: string;
  targetDate: string;
  dailyBudget: number;
  affectedDatesCount?: number;
}

// 월별 예산 생성 요청
export interface CreateMonthlyBudgetRequest {
  monthlyFoodBudget: number;
  dailyFoodBudget: number;
}

// 월별 예산 생성 응답
export interface CreateMonthlyBudgetResponse {
  message: string;
}

// 일별 예산 일괄 생성 요청
export interface BulkCreateDailyBudgetRequest {
  startDate: string;
  endDate: string;
  dailyFoodBudget: number;
  mealBudgets?: {
    BREAKFAST?: number;
    LUNCH?: number;
    DINNER?: number;
    OTHER?: number;
  };
}

// 일별 예산 일괄 생성 응답
export interface BulkCreateDailyBudgetResponse {
  message: string;
  dailyBudgetCount: number;
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
  name?: string; // API 응답에서 사용하는 필드명
  storeName?: string; // 기존 코드 호환성을 위해 유지
  category?: string;
  categoryName?: string; // API 응답에서 사용하는 필드명
  categoryId: number;
  distance: number;
  reviewCount: number;
  averagePrice: number;
  isOpen: boolean;
  popularityTag?: string;
  imageUrl: string;
  address: string;
  isFavorite?: boolean;
}

export interface StoreDetail extends Store {
  description?: string;
  operatingHours?: Array<{
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    isHoliday: boolean;
    breakStartTime?: string;
    breakEndTime?: string;
  }>;
  openingHours?: Array<{
    // API 명세에서 사용하는 필드명
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    isHoliday: boolean;
    breakStartTime?: string;
    breakEndTime?: string;
  }>;
  phone?: string;
  phoneNumber?: string; // API 명세에서 사용하는 필드명
  location?: {
    latitude: number;
    longitude: number;
  };
  latitude?: number;
  longitude?: number;
  menus?: Menu[];
  recommendedMenus?: Menu[]; // API 명세에서 제공하는 추천 메뉴
  isFavorite: boolean;
  lotNumberAddress?: string;
  images?: Array<{
    storeImageId: number;
    imageUrl: string;
    isMain: boolean;
    displayOrder: number;
  }>;
  temporaryClosures?: Array<{
    closureDate: string;
    startTime: string;
    endTime: string;
    reason: string;
  }>;
  isCampusRestaurant?: boolean;
  isTemporaryClosed?: boolean;
  favoriteCount?: number;
  viewCount?: number;
  seller?: {
    sellerId: number;
    businessNumber: string;
    ownerName: string;
  };
  registeredAt?: string;
  storeType?: string;
}

export interface Menu {
  foodId: number;
  foodName: string;
  price: number;
  imageUrl: string;
  description?: string;
  budgetDifference?: number;
  isRecommended?: boolean;
  isMain?: boolean; // 대표 메뉴 여부
  displayOrder?: number; // 표시 순서
  isAvailable?: boolean; // 판매 가능 여부
  registeredDt?: string; // 메뉴 등록일
  budgetComparison?: {
    // API 명세의 예산 비교 정보
    userMealBudget: number;
    difference: number;
    isOverBudget: boolean;
    differenceText: string;
  };
  recommendationScore?: number; // 추천 점수
}

// 지출 관련
export interface ExpenditureItem {
  foodId: number; // API 명세: 음식 ID (필수)
  quantity: number; // API 명세: 수량 (1 이상)
  price: number; // API 명세: 가격 (0 이상)
}

export interface ExpenditureItemDetail {
  expenditureItemId?: number;
  itemId?: number;
  foodId?: number;
  foodName: string;
  quantity: number;
  price: number;
  hasFoodLink?: boolean;
}

export interface Expenditure {
  expenditureId: number;
  storeName: string;
  amount: number;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER";
  expendedDate: string;
  expendedTime?: string;
  categoryId?: number;
  categoryName: string;
  memo?: string;
  items?: ExpenditureItemDetail[];
}

export interface ExpenditureDetail extends Expenditure {
  storeId?: number;
  expendedTime: string;
  items: ExpenditureItemDetail[];
  createdAt: string;
  hasStoreLink?: boolean;
}

export interface CreateExpenditureRequest {
  storeName: string;
  amount: number;
  expendedDate: string;
  expendedTime: string;
  categoryId: number;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER";
  memo?: string | null;
  items?: ExpenditureItem[] | null;
}

export interface CreateExpenditureFromCartRequest {
  storeId: number;
  storeName: string;
  amount: number;
  expendedDate: string;
  expendedTime: string;
  categoryId: number;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  memo?: string;
  items: Array<{
    foodId: number;
    foodName: string;
    quantity: number;
    price: number;
  }>;
}

export interface ParseSmsRequest {
  smsMessage: string;
}

export interface ParseSmsResponse {
  storeName: string;
  amount: number;
  date: string;
  time: string;
  isParsed: boolean;
}

export interface ExpenditureSummary {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
}

export interface ExpenditureListResponse {
  summary: ExpenditureSummary;
  expenditures: PageResponse<Expenditure>;
}

export interface DailyStatistic {
  date: string;
  amount?: number; // 구버전 호환
  totalSpentAmount: number; // 실제 API 응답
  budget?: number; // API에서 제공하는 예산 정보
  balance?: number;
  overBudget?: boolean;
  budgetRegistered?: boolean;
}

export interface CategoryStatistic {
  categoryId: number;
  categoryName: string;
  amount: number;
}

export interface MealTypeStatistic {
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER";
  amount: number;
}

export interface DailyStatisticsResponse {
  totalAmount: number;
  categoryStatistics: CategoryStatistic[];
  dailyStatistics: DailyStatistic[];
  mealTypeStatistics: MealTypeStatistic[];
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
  version: string;
  type: "TERMS_OF_SERVICE" | "PRIVACY_POLICY" | "MARKETING_CONSENT" | string; // API 응답: 약관 유형
  isRequired?: boolean; // 계산된 필드
  summary?: string;
  contentUrl?: string;
  updatedAt?: string;
  content?: string;
  // 프론트엔드에서 사용할 표시 타입
  displayType?: "REQUIRED" | "OPTIONAL";
}

export interface PolicyListResponse {
  policies: Policy[];
}

export interface PolicyDetailResponse {
  policyId: number;
  title: string;
  type: "TERMS_OF_SERVICE" | "PRIVACY_POLICY" | "MARKETING_CONSENT" | string; // 약관 유형
  version: string;
  isRequired: boolean; // 필수 약관 여부
  content: string;
  updatedAt: string; // 업데이트 일시
}

// 홈 대시보드 관련
export interface HomeDashboardLocation {
  addressHistoryId: number;
  addressAlias: string;
  fullAddress: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
  isPrimary: boolean;
}

export interface MealBudget {
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  budget: number;
  spent: number;
  remaining: number;
}

export interface HomeDashboardBudget {
  todaySpent: number;
  todayBudget: number;
  remaining: number;
  utilizationRate: number;
  mealBudgets: MealBudget[];
}

export interface RecommendedMenu {
  foodId: number;
  foodName: string;
  price: number;
  storeId: number;
  storeName: string;
  distance: number;
  tags: string[];
  imageUrl: string;
}

export interface RecommendedStore {
  storeId: number;
  storeName: string;
  categoryName: string;
  distance: number;
  distanceText: string;
  contextInfo: string;
  averagePrice: number;
  reviewCount: number;
  imageUrl: string;
}

export interface HomeDashboardResponse {
  location: HomeDashboardLocation;
  budget: HomeDashboardBudget;
  recommendedMenus: RecommendedMenu[];
  recommendedStores: RecommendedStore[];
}

// 온보딩 상태 관련
export interface OnboardingStatusResponse {
  isOnboardingComplete: boolean;
  hasSelectedRecommendationType: boolean;
  hasConfirmedMonthlyBudget: boolean;
  currentMonth: string;
  showRecommendationTypeModal: boolean;
  showMonthlyBudgetModal: boolean;
}

// 월별 예산 확인 관련
export interface MonthlyBudgetConfirmRequest {
  year: number;
  month: number;
  action: "KEEP" | "CHANGE";
}

export interface MonthlyBudgetConfirmResponse {
  year: number;
  month: number;
  confirmedAt: string;
  monthlyBudget: number;
}
