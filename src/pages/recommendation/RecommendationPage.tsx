import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  FiArrowLeft,
  FiSearch,
  FiSliders,
  FiChevronDown,
  FiMapPin,
  FiMessageCircle,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import {
  recommendationService,
  RecommendationParams,
  RecommendedStore,
  StoreShortcut,
} from "../../services/recommendation.service";
import { favoriteService } from "../../services/favorite.service";
import { getHomeDashboard } from "../../services/home.service";
import { useAuthStore } from "../../store/authStore";
import BottomNav from "../../components/layout/BottomNav";

type SortBy = "SCORE" | "DISTANCE";
type DistanceFilter = 0.5 | 1 | 2 | 5 | 10;

const RecommendationPage = () => {
  console.log("[RecommendationPage] 함수 컴포넌트 실행 시작!!! ");

  const navigate = useNavigate();
  console.log("useNavigate 성공");

  const location = useLocation();
  console.log("useLocation 성공");

  const { isAuthenticated, accessToken } = useAuthStore();
  console.log("useAuthStore 성공:", {
    isAuthenticated,
    hasToken: !!accessToken,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("SCORE");
  const [distance, setDistance] = useState<DistanceFilter>(0.5);
  const [isOpenOnly, setIsOpenOnly] = useState(false);
  const [excludeDislikes, setExcludeDislikes] = useState(true);
  const [stores, setStores] = useState<RecommendedStore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteStores, setFavoriteStores] = useState<Set<number>>(new Set());
  const [favoriteIdMap, setFavoriteIdMap] = useState<Map<number, number>>(
    new Map()
  ); // storeId -> favoriteId

  console.log("[RecommendationPage] 현재 상태:", {
    isAuthenticated,
    hasToken: !!accessToken,
    pathname: location.pathname,
  });

  // 자동완성 관련 상태
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<
    string[]
  >([]);
  const [autocompleteShortcuts, setAutocompleteShortcuts] = useState<
    StoreShortcut[]
  >([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 사용자 위치 정보 (홈에서 전달받음)
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // 드롭다운 상태
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    console.log("[RecommendationPage] 컴포넌트 마운트");
    console.log("[RecommendationPage] 인증 상태:", {
      isAuthenticated,
      hasToken: !!accessToken,
    });

    // 로그인 체크
    if (!isAuthenticated || !accessToken) {
      console.log("[RecommendationPage] 로그인 필요 - 로그인 페이지로 이동");
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    console.log("[RecommendationPage] location.state:", location.state);

    // location.state에서 위치 정보 가져오기
    if (location.state && location.state.userLocation) {
      console.log(
        " [RecommendationPage] location.state에서 위치 정보 사용:",
        location.state.userLocation
      );
      setUserLocation(location.state.userLocation);
    } else {
      console.log("[RecommendationPage] API에서 위치 정보 가져오기 시작");
      // API에서 사용자의 현재 주소 가져오기
      fetchUserLocation();
    }
  }, [location.state, isAuthenticated, accessToken, navigate]);

  const fetchUserLocation = async () => {
    console.log("[fetchUserLocation] 시작");
    try {
      const dashboardResponse = await getHomeDashboard();
      console.log("[fetchUserLocation] API 응답:", dashboardResponse);

      if (
        dashboardResponse.result === "SUCCESS" &&
        dashboardResponse.data?.location
      ) {
        const { latitude, longitude } = dashboardResponse.data.location;
        console.log("[fetchUserLocation] 위치 정보 설정:", {
          latitude,
          longitude,
        });
        setUserLocation({ latitude, longitude });
      } else {
        console.log("[fetchUserLocation] 위치 정보 없음 - 기본 위치 사용");
        // 기본 위치 (서울시청)
        setUserLocation({
          latitude: 37.5665,
          longitude: 126.978,
        });
      }
    } catch (err) {
      console.error("[fetchUserLocation] 에러:", err);
      // 실패 시 기본 위치 사용
      setUserLocation({
        latitude: 37.5665,
        longitude: 126.978,
      });
    }
  };

  useEffect(() => {
    console.log("[RecommendationPage] 검색 조건 변경:", {
      hasLocation: !!userLocation,
      userLocation,
      sortBy,
      distance,
      isOpenOnly,
      excludeDislikes,
    });

    if (userLocation) {
      console.log("[RecommendationPage] searchStores 호출");
      searchStores();
    } else {
      console.log("[RecommendationPage] 위치 정보 대기 중...");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, sortBy, distance, isOpenOnly, excludeDislikes]);

  // 거리 라벨 가져오기
  const getDistanceLabel = () => {
    return `${distance}km`;
  };

  // 정렬 라벨 가져오기
  const getSortLabel = () => {
    switch (sortBy) {
      case "SCORE":
        return "추천순";
      case "DISTANCE":
        return "거리순";
      default:
        return "추천순";
    }
  };

  const searchStores = async (keywordOverride?: string) => {
    console.log("[searchStores] 시작");

    if (!userLocation) {
      console.log("[searchStores] 위치 정보 없음 - 중단");
      return;
    }

    console.log("[searchStores] 로딩 시작");
    setIsLoading(true);

    try {
      const params: RecommendationParams = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius: distance,
        includeDisliked: !excludeDislikes,
        openNow: isOpenOnly,
        page: 0,
        size: 20,
      };

      // sortBy가 SCORE가 아닐 때만 추가 (기본값이 SCORE이므로)
      if (sortBy !== "SCORE") {
        params.sortBy = sortBy;
      }

      const keywordToUse = keywordOverride ?? searchKeyword.trim();
      if (keywordToUse) {
        params.keyword = keywordToUse;
      }

      console.log("[searchStores] API 호출 파라미터:", params);
      const response = await recommendationService.getRecommendations(params);

      console.log("[RecommendationPage] API 응답 전체:", response);
      console.log("[RecommendationPage] API 응답 result:", response.result);
      console.log("[RecommendationPage] API 응답 data:", response.data);
      console.log(
        " [RecommendationPage] API 응답 data 타입:",
        typeof response.data,
        Array.isArray(response.data)
      );

      if (response.result === "SUCCESS" && response.data) {
        // API 응답: { result: "SUCCESS", data: RecommendedStore[] }
        const storeList = Array.isArray(response.data) ? response.data : [];
        console.log(
          " [RecommendationPage] 파싱된 storeList 길이:",
          storeList.length
        );
        console.log("[RecommendationPage] 파싱된 storeList:", storeList);
        console.log(" [RecommendationPage] 첫 번째 가게 데이터:", storeList[0]);
        console.log(
          " [RecommendationPage] 첫 번째 가게의 isFavorite:",
          storeList[0]?.isFavorite
        );
        console.log(
          " [RecommendationPage] 첫 번째 가게의 favoriteId:",
          storeList[0]?.favoriteId
        );
        console.log(
          " [RecommendationPage] 첫 번째 가게의 categoryName:",
          storeList[0]?.categoryName
        );
        console.log(
          " [RecommendationPage] 첫 번째 가게의 isOpen:",
          storeList[0]?.isOpen
        );
        setStores(storeList);

        // API 응답의 isFavorite와 favoriteId를 활용하여 상태 초기화
        const favorites = new Set<number>();
        const idMap = new Map<number, number>();

        storeList.forEach((store, index) => {
          console.log(
            ` [RecommendationPage] 가게 #${index} (${
              store.name || store.storeName
            }):`,
            {
              storeId: store.storeId,
              name: store.name,
              storeName: store.storeName,
              isFavorite: store.isFavorite,
              favoriteId: store.favoriteId,
            }
          );

          if (store.isFavorite) {
            favorites.add(store.storeId);
            // API 응답에 favoriteId가 있다면 매핑에 추가
            if (store.favoriteId) {
              idMap.set(store.storeId, store.favoriteId);
            }
          }
        });

        console.log(
          "[RecommendationPage] 즐겨찾기 상태 로드:",
          favorites.size,
          "개"
        );
        console.log(
          "[RecommendationPage] favoriteStores Set:",
          Array.from(favorites)
        );
        console.log(
          "[RecommendationPage] favoriteIdMap:",
          Array.from(idMap.entries())
        );

        setFavoriteStores(favorites);
        setFavoriteIdMap(idMap);
      } else {
        setStores([]);
        setFavoriteStores(new Set());
        setFavoriteIdMap(new Map());
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/login");
      } else if (err.code === "ECONNABORTED") {
        alert("서버 응답 시간이 초과되었습니다. 다시 시도해주세요.");
      } else if (err.response?.status === 404) {
        alert("서비스를 찾을 수 없습니다.");
      } else if (err.response?.status === 500) {
        alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }

      setStores([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setShowAutocomplete(false);
    searchStores();
  };

  // 자동완성 검색
  const handleAutocompleteSearch = async (keyword: string) => {
    if (keyword.trim().length < 2) {
      setAutocompleteSuggestions([]);
      setAutocompleteShortcuts([]);
      setShowAutocomplete(false);
      return;
    }

    try {
      const response = await recommendationService.getAutocomplete({
        keyword: keyword.trim(),
        limit: 10,
        storeShortcutsLimit: 5,
      });

      console.log("[자동완성] API 응답:", response);

      if (response.result === "SUCCESS" && response.data) {
        setAutocompleteSuggestions(response.data.suggestions || []);
        setAutocompleteShortcuts(response.data.storeShortcuts || []);
        setShowAutocomplete(true);
        console.log("[자동완성] 성공:", {
          suggestions: response.data.suggestions?.length || 0,
          shortcuts: response.data.storeShortcuts?.length || 0,
        });
      } else {
        setAutocompleteSuggestions([]);
        setAutocompleteShortcuts([]);
        setShowAutocomplete(false);
      }
    } catch (err) {
      console.error("[자동완성] 에러:", err);
      setAutocompleteSuggestions([]);
      setAutocompleteShortcuts([]);
      setShowAutocomplete(false);
    }
  };

  // 검색어 변경 핸들러
  const handleSearchKeywordChange = (value: string) => {
    setSearchKeyword(value);
    handleAutocompleteSearch(value);
  };

  // 자동완성 키워드 선택
  const handleSuggestionClick = (suggestion: string) => {
    const trimmedSuggestion = suggestion.trim();
    setSearchKeyword(trimmedSuggestion);
    setShowAutocomplete(false);

    if (userLocation) {
      searchStores(trimmedSuggestion);
    }
  };

  // 가게 바로가기 선택
  const handleShortcutClick = (storeId: number) => {
    navigate(`/store/${storeId}`);
  };

  const handleStoreClick = (storeId: number) => {
    navigate(`/store/${storeId}`);
  };

  const handleFavoriteToggle = async (storeId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    const isFavorite = favoriteStores.has(storeId);

    try {
      if (isFavorite) {
        // 즐겨찾기 제거
        let favoriteId = favoriteIdMap.get(storeId);

        // favoriteId가 없으면 즐겨찾기 목록을 조회해서 찾기
        if (!favoriteId) {
          console.log(
            "[RecommendationPage] favoriteId가 없어서 즐겨찾기 목록 조회:",
            storeId
          );

          try {
            // 파라미터 없이 전체 목록 조회
            const favoritesResponse = await favoriteService.getFavorites();

            console.log(
              " [RecommendationPage] 즐겨찾기 응답:",
              favoritesResponse
            );

            if (
              favoritesResponse.result === "SUCCESS" &&
              favoritesResponse.data
            ) {
              const favoritesList = favoritesResponse.data.favorites;
              console.log(
                " [RecommendationPage] 즐겨찾기 목록:",
                favoritesList
              );

              const favoriteItem = favoritesList.find(
                (item) => item.storeId === storeId
              );

              if (favoriteItem) {
                favoriteId = favoriteItem.favoriteId;
                console.log(
                  " [RecommendationPage] favoriteId 찾음:",
                  favoriteId
                );
                // 찾은 favoriteId를 맵에 저장
                setFavoriteIdMap((prev) => {
                  const newMap = new Map(prev);
                  newMap.set(storeId, favoriteId!);
                  return newMap;
                });
              } else {
                console.log(
                  "[RecommendationPage] 즐겨찾기 목록에서 storeId를 찾을 수 없음:",
                  storeId
                );
              }
            }
          } catch (err) {
            console.error(
              " [RecommendationPage] 즐겨찾기 목록 조회 실패:",
              err
            );
          }
        }

        if (!favoriteId) {
          console.error(
            " [RecommendationPage] favoriteId를 찾을 수 없습니다:",
            storeId
          );
          alert("즐겨찾기 정보를 찾을 수 없습니다. 다시 시도해주세요.");
          // 상태 동기화를 위해 전체 목록 다시 로드
          await searchStores();
          return;
        }

        await favoriteService.deleteFavorite(favoriteId);

        // UI 즉시 업데이트
        setFavoriteStores((prev) => {
          const newSet = new Set(prev);
          newSet.delete(storeId);
          return newSet;
        });

        setFavoriteIdMap((prev) => {
          const newMap = new Map(prev);
          newMap.delete(storeId);
          return newMap;
        });

        console.log("[RecommendationPage] 즐겨찾기 제거 완료:", storeId);
      } else {
        // 즐겨찾기 추가
        const response = await favoriteService.addFavorite(storeId);

        if (response.result === "SUCCESS" && response.data) {
          // UI 즉시 업데이트
          setFavoriteStores((prev) => {
            const newSet = new Set(prev);
            newSet.add(storeId);
            return newSet;
          });

          setFavoriteIdMap((prev) => {
            const newMap = new Map(prev);
            if (response.data) {
              newMap.set(storeId, response.data.favoriteId);
            }
            return newMap;
          });

          console.log(
            "[RecommendationPage] 즐겨찾기 추가 완료:",
            storeId,
            "favoriteId:",
            response.data.favoriteId
          );
        }
      }
    } catch (err: any) {
      console.error("[RecommendationPage] 즐겨찾기 토글 실패:", err);

      // 409 에러 (이미 즐겨찾기에 있음)
      if (err.response?.status === 409) {
        // UI 상태 동기화를 위해 전체 목록 다시 로드
        await searchStores();
        alert("이미 즐겨찾기에 추가되어 있습니다.");
      } else if (err.response?.status === 404) {
        // 404 에러 (존재하지 않는 즐겨찾기)
        await searchStores();
        alert("즐겨찾기 정보를 찾을 수 없습니다. 다시 시도해주세요.");
      } else {
        alert(`즐겨찾기 ${isFavorite ? "제거" : "추가"}에 실패했습니다.`);
      }
    }
  };

  console.log("[RecommendationPage] return문 직전 도달!");
  return (
    <PageContainer onClick={() => setShowAutocomplete(false)}>
      {/* 상단 검색바 */}
      <TopBar>
        <BackButton onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} />
        </BackButton>
        <SearchBoxContainer>
          <SearchBox>
            <FiSearch size={18} color="#999" />
            <SearchInput
              ref={searchInputRef}
              type="text"
              value={searchKeyword}
              onChange={(e) => handleSearchKeywordChange(e.target.value)}
              onFocus={() => {
                if (searchKeyword.trim().length >= 2) {
                  setShowAutocomplete(true);
                }
              }}
              placeholder="가게 또는 메뉴 검색"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </SearchBox>

          {/* 자동완성 드롭다운 */}
          {showAutocomplete &&
            (autocompleteSuggestions.length > 0 ||
              autocompleteShortcuts.length > 0) && (
              <AutocompleteDropdown
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                {/* 키워드 제안 */}
                {autocompleteSuggestions.length > 0 && (
                  <>
                    <AutocompleteSection>키워드</AutocompleteSection>
                    {autocompleteSuggestions.map((suggestion, index) => (
                      <AutocompleteItemStyled
                        key={`suggestion-${index}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <AutocompleteIcon aria-hidden="true">
                          <FiSearch />
                        </AutocompleteIcon>
                        <AutocompleteContent>
                          <AutocompleteName>{suggestion}</AutocompleteName>
                        </AutocompleteContent>
                      </AutocompleteItemStyled>
                    ))}
                  </>
                )}

                {/* 가게 바로가기 */}
                {autocompleteShortcuts.length > 0 && (
                  <>
                    <AutocompleteSection>가게 바로가기</AutocompleteSection>
                    {autocompleteShortcuts.map((shortcut) => (
                      <StoreShortcutCard
                        key={`shortcut-${shortcut.storeId}`}
                        onClick={() => handleShortcutClick(shortcut.storeId)}
                      >
                        <ShortcutImage
                          src={
                            shortcut.imageUrl ||
                            "https://via.placeholder.com/60x60?text=No+Image"
                          }
                          alt={shortcut.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/60x60?text=No+Image";
                          }}
                        />
                        <ShortcutInfo>
                          <ShortcutName>{shortcut.name}</ShortcutName>
                          <ShortcutStatus $isOpen={shortcut.isOpen}>
                            {shortcut.isOpen ? "영업중" : "영업종료"}
                          </ShortcutStatus>
                        </ShortcutInfo>
                      </StoreShortcutCard>
                    ))}
                  </>
                )}
              </AutocompleteDropdown>
            )}
        </SearchBoxContainer>
        <FilterIconButton>
          <FiSliders size={20} />
        </FilterIconButton>
      </TopBar>

      {/* 필터 버튼들 */}
      <FilterBar>
        <FilterButton
          onClick={() => {
            console.log("거리 필터 클릭, 현재 상태:", showDistanceDropdown);
            setShowDistanceDropdown(!showDistanceDropdown);
            setShowSortDropdown(false);
          }}
        >
          <FilterLabel>
            <InlineIcon>
              <FiMapPin />
            </InlineIcon>
            거리: {getDistanceLabel()}
          </FilterLabel>
          <FiChevronDown size={14} />
        </FilterButton>
        <FilterButton
          onClick={() => {
            console.log(
              "[RecommendationPage] 정렬 필터 클릭, 현재 상태:",
              showSortDropdown
            );
            setShowSortDropdown(!showSortDropdown);
            setShowDistanceDropdown(false);
          }}
        >
          <FilterLabel>
            <InlineIcon>
              <FiTrendingUp />
            </InlineIcon>
            정렬: {getSortLabel()}
          </FilterLabel>
          <FiChevronDown size={14} />
        </FilterButton>
      </FilterBar>

      {/* 드롭다운 메뉴들 */}
      {showDistanceDropdown && (
        <DropdownContainer onClick={(e) => e.stopPropagation()}>
          <DropdownItem
            $active={distance === 0.5}
            onClick={() => {
              setDistance(0.5);
              setShowDistanceDropdown(false);
            }}
          >
            0.5km
          </DropdownItem>
          <DropdownItem
            $active={distance === 1}
            onClick={() => {
              setDistance(1);
              setShowDistanceDropdown(false);
            }}
          >
            1km
          </DropdownItem>
          <DropdownItem
            $active={distance === 2}
            onClick={() => {
              setDistance(2);
              setShowDistanceDropdown(false);
            }}
          >
            2km
          </DropdownItem>
          <DropdownItem
            $active={distance === 5}
            onClick={() => {
              setDistance(5);
              setShowDistanceDropdown(false);
            }}
          >
            5km
          </DropdownItem>
          <DropdownItem
            $active={distance === 10}
            onClick={() => {
              setDistance(10);
              setShowDistanceDropdown(false);
            }}
          >
            10km
          </DropdownItem>
        </DropdownContainer>
      )}

      {showSortDropdown && (
        <DropdownContainer onClick={(e) => e.stopPropagation()}>
          <DropdownItem
            $active={sortBy === "SCORE"}
            onClick={() => {
              setSortBy("SCORE");
              setShowSortDropdown(false);
            }}
          >
            추천순
          </DropdownItem>
          <DropdownItem
            $active={sortBy === "DISTANCE"}
            onClick={() => {
              setSortBy("DISTANCE");
              setShowSortDropdown(false);
            }}
          >
            거리순
          </DropdownItem>
        </DropdownContainer>
      )}

      {/* 필터 태그 */}
      <TagBar>
        <TagChip>정렬: {getSortLabel()}</TagChip>
        <TagChip>거리: {getDistanceLabel()}</TagChip>
        <TagChip
          $clickable
          $active={isOpenOnly}
          onClick={() => setIsOpenOnly(!isOpenOnly)}
        >
          영업중: {isOpenOnly ? "예" : "모두"}
        </TagChip>
        <TagChip
          $clickable
          $active={excludeDislikes}
          onClick={() => setExcludeDislikes(!excludeDislikes)}
        >
          불호제외: {excludeDislikes ? "예" : "아니오"}
        </TagChip>
      </TagBar>

      {/* 결과 텍스트 */}
      {!isLoading && stores.length > 0 && (
        <ResultHeader>
          <ResultCount>{stores.length}개 결과</ResultCount>
          {searchKeyword && <ResultKeyword>*{searchKeyword}*</ResultKeyword>}
        </ResultHeader>
      )}

      {/* 상점 리스트 */}
      <StoreList>
        {!userLocation ? (
          <LoadingText>위치 정보를 불러오는 중...</LoadingText>
        ) : isLoading ? (
          <LoadingText>추천 가게를 검색하는 중...</LoadingText>
        ) : stores && stores.length > 0 ? (
          stores.map((store, index) => (
            <StoreCard
              key={`${store.storeId}-${store.cursorId}-${index}`}
              onClick={() => handleStoreClick(store.storeId)}
            >
              {/* 상점 메인 이미지 */}
              <StoreImageContainer>
                <StoreMainImage
                  src={store.imageUrl}
                  alt={store.storeName}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/800x400?text=No+Image";
                  }}
                />
                <StoreNameOverlay>
                  <StoreName>{store.name || store.storeName}</StoreName>
                  <StoreCategoryName>
                    {store.categoryName || `카테고리 ${store.categoryId || ""}`}
                  </StoreCategoryName>
                </StoreNameOverlay>
                <FavoriteButton
                  onClick={(e) => handleFavoriteToggle(store.storeId, e)}
                  $isFavorite={favoriteStores.has(store.storeId)}
                >
                  {favoriteStores.has(store.storeId) ? (
                    <IoHeart size={28} color="#ff6b35" />
                  ) : (
                    <IoHeartOutline size={28} color="#fff" />
                  )}
                </FavoriteButton>
              </StoreImageContainer>

              {/* 상점 정보 */}
              <StoreInfoSection>
                <InfoRow>
                  <InfoItem>
                    <InlineIcon>
                      <FiMapPin />
                    </InlineIcon>
                    {store.distance.toFixed(1)}km
                  </InfoItem>
                  <InfoItem>
                    <InlineIcon>
                      <FiMessageCircle />
                    </InlineIcon>
                    {store.reviewCount.toLocaleString()}개 리뷰
                  </InfoItem>
                </InfoRow>

                <BadgeRow>
                  {store.isOpen ? (
                    <OpenBadge>영업중</OpenBadge>
                  ) : (
                    <ClosedBadge>영업종료</ClosedBadge>
                  )}
                  <PriceInfo>
                    <InlineIcon>
                      <FiDollarSign />
                    </InlineIcon>
                    평균{" "}
                    {store.averagePrice > 0
                      ? `${store.averagePrice.toLocaleString()}원`
                      : "정보없음"}
                  </PriceInfo>
                  {(store.score || store.recommendationScore || 0) >= 40000 && (
                    <PopularityBadge>
                      <InlineIcon>
                        <FiTrendingUp />
                      </InlineIcon>
                      추천점수{" "}
                      {(
                        (store.score || store.recommendationScore || 0) / 1000
                      ).toFixed(0)}
                      K
                    </PopularityBadge>
                  )}
                </BadgeRow>
              </StoreInfoSection>
            </StoreCard>
          ))
        ) : (
          <EmptyText>검색 결과가 없습니다</EmptyText>
        )}
      </StoreList>

      <BottomNav activeTab="recommendation" />
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchBoxContainer = styled.div`
  flex: 1;
  position: relative;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background-color: #f5f5f5;
  border-radius: 8px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: #000;
  outline: none;

  &::placeholder {
    color: #999;
  }
`;

const AutocompleteDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 500px;
  overflow-y: auto;
  z-index: 1000;
`;

const AutocompleteSection = styled.div`
  padding: 12px 16px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: #f8f8f8;
  border-top: 1px solid #f0f0f0;

  &:first-child {
    border-top: none;
  }
`;

const AutocompleteItemStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8f8f8;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const AutocompleteIcon = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ff6b35;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const AutocompleteContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AutocompleteName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const StoreShortcutCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8f8f8;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ShortcutImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
`;

const ShortcutInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ShortcutName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const ShortcutStatus = styled.div<{ $isOpen: boolean }>`
  font-size: 12px;
  font-weight: 500;
  color: ${(props) => (props.$isOpen ? "#4caf50" : "#999")};
`;

const FilterIconButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background-color: #fff;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  white-space: nowrap;

  &:active {
    background-color: #f5f5f5;
  }
`;

const FilterLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const TagBar = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background-color: #fff;
  overflow-x: auto;
  border-bottom: 1px solid #e0e0e0;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TagChip = styled.div<{ $clickable?: boolean; $active?: boolean }>`
  padding: 6px 12px;
  background-color: ${(props) =>
    props.$active ? "#ff6b35" : props.$clickable ? "#e8f5e9" : "#f5f5f5"};
  border-radius: 16px;
  font-size: 12px;
  color: ${(props) => (props.$active ? "#fff" : "#666")};
  white-space: nowrap;
  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};
  transition: all 0.2s;

  &:active {
    transform: ${(props) => (props.$clickable ? "scale(0.95)" : "none")};
  }
`;

const DropdownContainer = styled.div`
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
`;

const DropdownItem = styled.div<{ $active?: boolean }>`
  padding: 14px 16px;
  font-size: 14px;
  color: ${(props) => (props.$active ? "#ff6b35" : "#333")};
  background-color: ${(props) => (props.$active ? "#fff5f2" : "#fff")};
  cursor: pointer;
  font-weight: ${(props) => (props.$active ? "600" : "400")};
  border-bottom: 1px solid #f5f5f5;

  &:hover {
    background-color: #f9f9f9;
  }

  &:active {
    background-color: #f0f0f0;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ResultHeader = styled.div`
  padding: 16px;
  background-color: #fff;
`;

const ResultCount = styled.div`
  font-size: 16px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
`;

const ResultKeyword = styled.div`
  font-size: 24px;
  color: #000;
  font-weight: 700;
`;

const StoreList = styled.div`
  padding: 0;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
`;

const EmptyText = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
`;

const StoreCard = styled.div`
  background-color: #fff;
  margin-bottom: 12px;
  cursor: pointer;
`;

const StoreImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
`;

const StoreMainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StoreNameOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 20px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.6) 50%,
    transparent 100%
  );
`;

const StoreName = styled.h3`
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
`;

const StoreCategoryName = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const FavoriteButton = styled.button<{ $isFavorite?: boolean }>`
  position: absolute;
  top: 16px;
  right: 16px;
  background: ${(props) =>
    props.$isFavorite ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.3)"};
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const StoreInfoSection = styled.div`
  padding: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
`;

const InfoItem = styled.span`
  font-size: 13px;
  color: #666;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const PriceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
`;

const OpenBadge = styled.span`
  display: inline-flex;
  align-items: center;
  background: #ff6b35;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border-radius: 6px;
  padding: 6px 12px;
  letter-spacing: -0.3px;
`;

const ClosedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  background: #666;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border-radius: 6px;
  padding: 6px 12px;
  letter-spacing: -0.3px;
`;

const PopularityBadge = styled.span`
  padding: 6px 12px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  background-color: #fff3e0;
  color: #f57c00;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const InlineIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 14px;
    height: 14px;
  }
`;

export default RecommendationPage;
