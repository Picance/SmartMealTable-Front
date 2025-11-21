import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FiBook,
  FiBriefcase,
  FiEdit2,
  FiHome,
  FiMapPin,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import AddressMapModal from "../../components/address/AddressMapModal";
import { addressService } from "../../services/address.service";
import type { AddressType, Address } from "../../services/address.service";
import { mapService } from "../../services/map.service";
import type { AddressSearchResult } from "../../services/map.service";

interface TempAddress {
  addressAlias: string;
  addressType: AddressType;
  streetNameAddress: string;
  lotNumberAddress: string;
  detailedAddress: string;
  latitude: number;
  longitude: number;
}

const OnboardingAddressPage = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<AddressSearchResult[]>([]);
  const [tempAddress, setTempAddress] = useState<TempAddress | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // 저장된 주소 관련 state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [nextAddressId, setNextAddressId] = useState(1); // 임시 ID 생성용

  // 저장된 주소 목록 불러오기
  useEffect(() => {
    // 온보딩 중에는 localStorage에서 임시 저장된 주소 불러오기
    loadLocalAddresses();
  }, []);

  const loadLocalAddresses = () => {
    try {
      const localAddresses = localStorage.getItem("onboarding_addresses");
      if (localAddresses) {
        const addresses = JSON.parse(localAddresses);
        setSavedAddresses(addresses);
        // 다음 ID 설정
        if (addresses.length > 0) {
          const maxId = Math.max(
            ...addresses.map((a: Address) => a.addressHistoryId)
          );
          setNextAddressId(maxId + 1);
        }
      }
    } catch (error) {
      console.error("로컬 주소 불러오기 실패:", error);
    }
  };

  const saveLocalAddresses = (addresses: Address[]) => {
    try {
      localStorage.setItem("onboarding_addresses", JSON.stringify(addresses));
    } catch (error) {
      console.error("로컬 주소 저장 실패:", error);
    }
  };

  // 온보딩 중에는 사용하지 않음 (주석 처리)
  // const loadAddresses = async () => { ... };

  // 주소 검색
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }

    try {
      const result = await mapService.searchAddress(searchKeyword, 10);
      if (result) {
        setSearchResults(result.addresses);
      }
    } catch (error) {
      console.error("주소 검색 실패:", error);
      alert("주소 검색에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 검색 결과에서 주소 선택
  const handleSelectSearchResult = (result: AddressSearchResult) => {
    // 편집 중이 아니라면 편집 모드 초기화
    setEditingAddressId(null);

    setTempAddress({
      addressAlias: "집",
      addressType: "HOME",
      streetNameAddress: result.roadAddress,
      lotNumberAddress: result.jibunAddress,
      detailedAddress: "",
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setSearchResults([]);
    setSearchKeyword("");
  };

  // 현재 위치로 주소 등록
  const handleRegisterLocation = (location: {
    lat: number;
    lng: number;
    address: string;
    roadAddress?: string;
    jibunAddress?: string;
  }) => {
    // 편집 중이 아니라면 편집 모드 초기화
    setEditingAddressId(null);

    setTempAddress({
      addressAlias: "집",
      addressType: "HOME",
      streetNameAddress: location.roadAddress || location.address,
      lotNumberAddress: location.jibunAddress || location.address,
      detailedAddress: "",
      latitude: location.lat,
      longitude: location.lng,
    });
    setShowLocationModal(false);
  };

  // 주소 추가 (온보딩 중에는 로컬에만 저장)
  const handleAddAddress = () => {
    if (!tempAddress) {
      alert("주소를 선택해주세요.");
      return;
    }

    console.log("=== 주소 추가 시작 ===");
    console.log("추가할 주소:", tempAddress);
    console.log("현재 저장된 주소 개수:", savedAddresses.length);

    // 새 주소 객체 생성
    const newAddress: Address = {
      addressHistoryId: nextAddressId,
      addressAlias: tempAddress.addressAlias,
      addressType: tempAddress.addressType as AddressType,
      streetNameAddress: tempAddress.streetNameAddress,
      lotNumberAddress: tempAddress.lotNumberAddress,
      detailedAddress: tempAddress.detailedAddress || "",
      latitude: tempAddress.latitude,
      longitude: tempAddress.longitude,
      isPrimary: savedAddresses.length === 0, // 첫 번째 주소는 자동으로 Primary
      registeredAt: new Date().toISOString(),
    };

    // 주소 목록에 추가
    const updatedAddresses = [...savedAddresses, newAddress];
    setSavedAddresses(updatedAddresses);
    saveLocalAddresses(updatedAddresses);
    setNextAddressId(nextAddressId + 1);

    // 입력 초기화
    setTempAddress(null);
    setSearchKeyword("");

    console.log("[OnboardingAddress] Address added:", newAddress);
    console.log("=== 전체 주소 개수:", updatedAddresses.length);
  };

  // 주소 삭제 (온보딩 중에는 로컬에서만 삭제)
  const handleDeleteAddress = (addressId: number) => {
    if (!confirm("이 주소를 삭제하시겠습니까?")) {
      return;
    }

    console.log("=== 주소 삭제 시작 ===");
    console.log("삭제할 주소 ID:", addressId);

    const updatedAddresses = savedAddresses.filter(
      (addr) => addr.addressHistoryId !== addressId
    );

    // Primary 주소를 삭제한 경우, 첫 번째 주소를 Primary로 설정
    if (updatedAddresses.length > 0) {
      const deletedAddress = savedAddresses.find(
        (addr) => addr.addressHistoryId === addressId
      );
      if (deletedAddress?.isPrimary) {
        updatedAddresses[0].isPrimary = true;
      }
    }

    setSavedAddresses(updatedAddresses);
    saveLocalAddresses(updatedAddresses);

    // 현재 편집 중인 주소를 삭제한 경우 편집 모드 초기화
    if (editingAddressId === addressId) {
      setEditingAddressId(null);
      setTempAddress(null);
    }

    console.log("[OnboardingAddress] Address deleted");
    console.log("=== 남은 주소 개수:", updatedAddresses.length);
  };

  // Primary 주소 설정 (온보딩 중에는 로컬에서만 변경)
  const handleSetPrimary = (addressId: number) => {
    console.log("=== Primary 주소 설정 시작 ===");
    console.log("설정할 주소 ID:", addressId);

    const updatedAddresses = savedAddresses.map((addr) => ({
      ...addr,
      isPrimary: addr.addressHistoryId === addressId,
    }));

    setSavedAddresses(updatedAddresses);
    saveLocalAddresses(updatedAddresses);

    console.log("[OnboardingAddress] Primary address updated");
  };

  // 주소 수정
  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address.addressHistoryId);
    setTempAddress({
      addressAlias: address.addressAlias,
      addressType: address.addressType as AddressType,
      streetNameAddress: address.streetNameAddress,
      lotNumberAddress: address.lotNumberAddress,
      detailedAddress: address.detailedAddress || "",
      latitude: address.latitude,
      longitude: address.longitude,
    });
  };

  // 주소 수정 저장 (온보딩 중에는 로컬에서만 수정)
  const handleUpdateAddress = () => {
    if (!tempAddress || !editingAddressId) {
      return;
    }

    console.log("=== 주소 수정 시작 ===");
    console.log("수정할 주소 ID:", editingAddressId);
    console.log("수정 내용:", tempAddress);

    const updatedAddresses = savedAddresses.map((addr) =>
      addr.addressHistoryId === editingAddressId
        ? {
            ...addr,
            addressAlias: tempAddress.addressAlias,
            addressType: tempAddress.addressType as AddressType,
            streetNameAddress: tempAddress.streetNameAddress,
            lotNumberAddress: tempAddress.lotNumberAddress,
            detailedAddress: tempAddress.detailedAddress || "",
            latitude: tempAddress.latitude,
            longitude: tempAddress.longitude,
          }
        : addr
    );

    setSavedAddresses(updatedAddresses);
    saveLocalAddresses(updatedAddresses);

    // 수정 완료 후 편집 모드 종료
    setTempAddress(null);
    setEditingAddressId(null);

    console.log("[OnboardingAddress] Address updated");
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setTempAddress(null);
    setEditingAddressId(null);
  };

  // 주소 타입 아이콘
  const getAddressIcon = (type: string) => {
    switch (type) {
      case "HOME":
        return <FiHome />;
      case "WORK":
        return <FiBriefcase />;
      case "SCHOOL":
        return <FiBook />;
      default:
        return <FiMapPin />;
    }
  };

  // 주소 타입 라벨
  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case "HOME":
        return "집";
      case "WORK":
        return "직장";
      case "SCHOOL":
        return "학교";
      default:
        return "기타";
    }
  };

  // 엔터키로 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 계속하기 - 온보딩 완료 시 백엔드에 저장
  const handleContinue = async () => {
    console.log("=== 온보딩 주소 저장 시작 ===");
    console.log("저장할 주소 개수:", savedAddresses.length);

    if (savedAddresses.length > 0) {
      // 인증된 상태라면 백엔드에 저장 시도
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          // 각 주소를 순차적으로 저장
          for (const address of savedAddresses) {
            const addressData = {
              addressAlias: address.addressAlias,
              addressType: address.addressType,
              streetNameAddress: address.streetNameAddress,
              lotNumberAddress: address.lotNumberAddress,
              detailedAddress: address.detailedAddress,
              latitude: address.latitude,
              longitude: address.longitude,
            };

            const savedAddress = await addressService.createAddress(
              addressData
            );

            // Primary 주소 설정
            if (address.isPrimary && savedAddress) {
              await addressService.setPrimaryAddress(
                savedAddress.addressHistoryId
              );
            }
          }

          // 저장 완료 후 로컬 스토리지 정리
          localStorage.removeItem("onboarding_addresses");
          console.log("[OnboardingAddress] All addresses saved to backend");
        }
      } catch (error) {
        console.error(
          "[OnboardingAddress] Failed to save addresses, continuing:",
          error
        );
        // 에러가 발생해도 다음 단계로 진행
      }
    }

    navigate("/onboarding/budget");
  };

  return (
    <PageContainer>
      <ContentContainer>
        <Header>
          <Title>신규 회원 주소 등록</Title>
        </Header>

        <InfoText>자주 방문하는 곳의 주소를 등록해보세요</InfoText>

        <Section>
          <SectionLabel>주소 추가</SectionLabel>
          <SearchContainer>
            <SearchInputWrapper>
              <SearchIcon>
                <FiSearch />
              </SearchIcon>
              <SearchInput
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="주소 검색..."
              />
            </SearchInputWrapper>
            <SearchButton onClick={handleSearch}>검색</SearchButton>
          </SearchContainer>

          {/* 검색 결과 */}
          {searchResults.length > 0 && (
            <SearchResultsList>
              {searchResults.map((result, index) => (
                <SearchResultItem
                  key={index}
                  onClick={() => handleSelectSearchResult(result)}
                >
                  <ResultAddress>{result.roadAddress}</ResultAddress>
                  <ResultJibun>{result.jibunAddress}</ResultJibun>
                </SearchResultItem>
              ))}
            </SearchResultsList>
          )}

          <LocationButton onClick={() => setShowLocationModal(true)}>
            <FiMapPin />
            현재 위치로 찾기
          </LocationButton>
        </Section>

        {/* 추가/수정할 주소 */}
        {tempAddress && (
          <Section>
            <SectionLabel>주소 추가</SectionLabel>
            <AddressPreviewCard>
              <AddressCardHeader>
                <AddressIcon>
                  {getAddressIcon(tempAddress.addressType)}
                </AddressIcon>
                <AddressTypeText>
                  {getAddressTypeLabel(tempAddress.addressType)}
                </AddressTypeText>
              </AddressCardHeader>
              <AddressMainText>{tempAddress.streetNameAddress}</AddressMainText>
              <AddressSubText>{tempAddress.lotNumberAddress}</AddressSubText>
              <DetailInput
                type="text"
                placeholder="상세 주소 (선택)"
                value={tempAddress.detailedAddress}
                onChange={(e) =>
                  setTempAddress({
                    ...tempAddress,
                    detailedAddress: e.target.value,
                  })
                }
              />
              <AddButtonGroup>
                {editingAddressId ? (
                  <>
                    <SaveButton onClick={handleUpdateAddress}>
                      수정 완료
                    </SaveButton>
                    <CancelButton onClick={handleCancelEdit}>취소</CancelButton>
                  </>
                ) : (
                  <SaveButton onClick={handleAddAddress}>주소 추가</SaveButton>
                )}
              </AddButtonGroup>
            </AddressPreviewCard>
          </Section>
        )}

        {/* 저장된 주소 */}
        <Section>
          <SectionLabel>저장된 주소</SectionLabel>
          {savedAddresses.length === 0 ? (
            <EmptyText>등록된 주소가 없습니다.</EmptyText>
          ) : (
            <AddressList>
              {savedAddresses.map((address) => (
                <AddressItem key={address.addressHistoryId}>
                  <RadioWrapper>
                    <Radio
                      type="radio"
                      name="primaryAddress"
                      checked={address.isPrimary}
                      onChange={() =>
                        handleSetPrimary(address.addressHistoryId)
                      }
                    />
                  </RadioWrapper>
                  <AddressContent>
                    <AddressItemHeader>
                      <AddressIcon>
                        {getAddressIcon(address.addressType)}
                      </AddressIcon>
                      <AddressTypeText>
                        {getAddressTypeLabel(address.addressType)}
                      </AddressTypeText>
                    </AddressItemHeader>
                    <AddressMainText>
                      {address.streetNameAddress}
                    </AddressMainText>
                    {address.detailedAddress && (
                      <AddressSubText>{address.detailedAddress}</AddressSubText>
                    )}
                  </AddressContent>
                  <ActionButtons>
                    <ActionButton onClick={() => handleEditAddress(address)}>
                      <FiEdit2 size={12} />
                      수정
                    </ActionButton>
                    <DeleteButton
                      onClick={() =>
                        handleDeleteAddress(address.addressHistoryId)
                      }
                    >
                      <FiTrash2 size={12} />
                      삭제
                    </DeleteButton>
                  </ActionButtons>
                </AddressItem>
              ))}
            </AddressList>
          )}
        </Section>

        <FinalButtonGroup>
          <ContinueButton onClick={handleContinue}>계속</ContinueButton>
        </FinalButtonGroup>
      </ContentContainer>

      {/* 현재 위치 찾기 모달 */}
      <AddressMapModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onConfirm={handleRegisterLocation}
        title="현재 위치로 찾기"
        confirmButtonText="이 위치로 주소 등록"
      />
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1.5rem;
  background-color: #ffffff;
  width: 100%;
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 390px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  padding: 1rem 0;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
  text-align: center;
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: #666666;
  margin: -0.5rem 0 0 0;
  text-align: center;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SectionLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #000000;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999999;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 1rem 0 3rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  color: #000000;

  &::placeholder {
    color: #999999;
  }

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
`;

const SearchButton = styled.button`
  height: 48px;
  padding: 0 1.5rem;
  border: none;
  border-radius: 8px;
  background-color: #ff6b35;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ff5722;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SearchResultsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  margin-top: 0.5rem;
`;

const SearchResultItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #fff5f0;
  }
`;

const ResultAddress = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: #000000;
  margin: 0 0 0.25rem 0;
`;

const ResultJibun = styled.p`
  font-size: 0.75rem;
  color: #666666;
  margin: 0;
`;

const AddressPreviewCard = styled.div`
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const AddressCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AddressTypeText = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #000000;
`;

const AddressMainText = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
  line-height: 1.4;
`;

const AddressSubText = styled.p`
  font-size: 0.875rem;
  color: #666666;
  margin: 0;
  line-height: 1.4;
`;

const DetailInput = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #000000;
  background-color: #ffffff;
  margin-top: 0.5rem;

  &::placeholder {
    color: #999999;
  }

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
`;

const LocationButton = styled.button`
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  color: #000000;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff6b35;
    background-color: #fff5f0;
  }
`;

const AddressIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const AddButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const SaveButton = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  background-color: #ff6b35;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ff5722;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  background-color: #ffffff;
  color: #666666;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const AddressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const AddressItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.25rem;
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff6b35;
    box-shadow: 0 2px 8px rgba(255, 107, 53, 0.1);
  }
`;

const RadioWrapper = styled.div`
  padding-top: 0.25rem;
`;

const Radio = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #ff6b35;
`;

const AddressContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AddressItemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #ffffff;
  color: #666666;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff6b35;
    color: #ff6b35;
    background-color: #fff5f0;
  }
`;

const DeleteButton = styled(ActionButton)`
  &:hover {
    border-color: #ff4444;
    color: #ff4444;
    background-color: #fff0f0;
  }
`;

const EmptyText = styled.p`
  text-align: center;
  color: #999999;
  font-size: 0.875rem;
  padding: 2rem 0;
`;

const FinalButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const ContinueButton = styled.button`
  width: 100%;
  height: 56px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  background-color: #ff6b35;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ff5722;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default OnboardingAddressPage;
