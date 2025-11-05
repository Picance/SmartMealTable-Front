import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FiSearch, FiMapPin, FiEdit2, FiTrash2 } from "react-icons/fi";
import AddressMapModal from "../../components/address/AddressMapModal";

interface SavedAddress {
  id: number;
  type: "home" | "work" | "school";
  address: string;
  icon: string;
}

const OnboardingAddressPage = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
    {
      id: 1,
      type: "home",
      address: "서울시 강남구 테헤란로 123, 스마트빌딩 5층",
      icon: "🏠",
    },
    {
      id: 2,
      type: "work",
      address: "부산시 해운대구 마린시티2로 38, 오션타워 15층",
      icon: "🏢",
    },
    {
      id: 3,
      type: "school",
      address: "대구시 북구 대학로 80, 대구대학교 공학관",
      icon: "🎓",
    },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState<number>(1);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // 주소 수정
  const handleEdit = (id: number) => {
    console.log("Edit address:", id);
    // TODO: 주소 수정 로직
  };

  // 주소 삭제
  const handleDelete = (id: number) => {
    setSavedAddresses(savedAddresses.filter((addr) => addr.id !== id));
    if (selectedAddressId === id && savedAddresses.length > 1) {
      const remaining = savedAddresses.filter((addr) => addr.id !== id);
      setSelectedAddressId(remaining[0].id);
    }
  };

  // 계속하기
  const handleContinue = () => {
    navigate("/onboarding/budget");
  };

  // 건너뛰기
  const handleSkip = () => {
    navigate("/onboarding/budget");
  };

  // 선택한 위치로 주소 등록
  const handleRegisterLocation = (location: {
    lat: number;
    lng: number;
    address: string;
    roadAddress?: string;
    jibunAddress?: string;
  }) => {
    // 새 주소 추가
    const newAddress: SavedAddress = {
      id: savedAddresses.length + 1,
      type: "home",
      address: location.address,
      icon: "🏠",
    };

    setSavedAddresses([...savedAddresses, newAddress]);
    setShowLocationModal(false);
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
          <SearchInputWrapper>
            <SearchIcon>
              <FiSearch />
            </SearchIcon>
            <SearchInput
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="주소 검색..."
            />
          </SearchInputWrapper>

          <LocationButton onClick={() => setShowLocationModal(true)}>
            <FiMapPin />
            현재 위치로 찾기
          </LocationButton>
        </Section>

        <Section>
          <SectionLabel>저장된 주소</SectionLabel>
          <AddressList>
            {savedAddresses.map((address) => (
              <AddressItem key={address.id}>
                <Radio
                  type="radio"
                  checked={selectedAddressId === address.id}
                  onChange={() => setSelectedAddressId(address.id)}
                />
                <AddressContent>
                  <AddressHeader>
                    <AddressIcon>{address.icon}</AddressIcon>
                    <AddressType>
                      {address.type === "home"
                        ? "집"
                        : address.type === "work"
                        ? "직장"
                        : "학교"}
                    </AddressType>
                  </AddressHeader>
                  <AddressText>{address.address}</AddressText>
                </AddressContent>
                <ActionButtons>
                  <ActionButton onClick={() => handleEdit(address.id)}>
                    <FiEdit2 />
                    수정
                  </ActionButton>
                  <DeleteButton onClick={() => handleDelete(address.id)}>
                    <FiTrash2 />
                    삭제
                  </DeleteButton>
                </ActionButtons>
              </AddressItem>
            ))}
          </AddressList>
        </Section>

        <ButtonGroup>
          <ContinueButton onClick={handleContinue}>계속</ContinueButton>
          <SkipButton onClick={handleSkip}>건너뛰기</SkipButton>
        </ButtonGroup>
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

const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
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

const AddressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const AddressItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
`;

const Radio = styled.input`
  width: 20px;
  height: 20px;
  margin-top: 0.25rem;
  cursor: pointer;
  accent-color: #ff6b35;
`;

const AddressContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AddressHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AddressIcon = styled.span`
  font-size: 1.25rem;
`;

const AddressType = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #000000;
`;

const AddressText = styled.p`
  font-size: 0.875rem;
  color: #666666;
  margin: 0;
  line-height: 1.4;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #ffffff;
  color: #666666;
  font-size: 0.75rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff6b35;
    color: #ff6b35;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const DeleteButton = styled(ActionButton)`
  &:hover {
    border-color: #ff4444;
    color: #ff4444;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
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

const SkipButton = styled.button`
  width: 100%;
  height: 56px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  background-color: #ffffff;
  color: #000000;
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

export default OnboardingAddressPage;
