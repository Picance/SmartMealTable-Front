import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import {
  FiBell,
  FiBook,
  FiBriefcase,
  FiChevronLeft,
  FiEdit2,
  FiHome,
  FiMapPin,
  FiNavigation,
  FiSearch,
  FiStar,
} from "react-icons/fi";

interface Address {
  id: number;
  type: "집" | "직장" | "학교";
  nickname: string;
  roadAddress: string;
  jibunAddress: string;
  detailAddress: string;
  isDefault: boolean;
}

const AddressManagementPage = () => {
  const navigate = useNavigate();

  // 임시 주소 데이터
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      type: "집",
      nickname: "우리집",
      roadAddress: "서울시 강남구 테헤란로 123, 스마트빌딩 5층",
      jibunAddress: "서울시 강남구 역삼동 123-45",
      detailAddress: "5층 501호",
      isDefault: true,
    },
    {
      id: 2,
      type: "직장",
      nickname: "회사",
      roadAddress: "부산시 해운대구 마린시티2로 38, 오션타워 15층",
      jibunAddress: "부산시 해운대구 우동 456-78",
      detailAddress: "15층",
      isDefault: false,
    },
    {
      id: 3,
      type: "학교",
      nickname: "학교",
      roadAddress: "대구시 북구 대학로 80, 대구대학교 공학관",
      jibunAddress: "대구시 북구 산격동 890-12",
      detailAddress: "공학관 3층",
      isDefault: false,
    },
  ]);

  // 주소 삭제
  const handleDelete = (id: number) => {
    if (window.confirm("이 주소를 삭제하시겠습니까?")) {
      setAddresses(addresses.filter((addr) => addr.id !== id));
    }
  };

  // 주소 수정
  const handleEdit = (id: number) => {
    navigate(`/address/edit/${id}`);
  };

  // 대표 주소 설정
  const handleSetDefault = (id: number) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "집":
        return <FiHome />;
      case "직장":
        return <FiBriefcase />;
      case "학교":
        return <FiBook />;
      default:
        return <FiMapPin />;
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </BackButton>
        <Title>주소 관리</Title>
        <HeaderIcons>
          <NotificationIcon>
            <FiBell />
          </NotificationIcon>
          <ProfileAvatar />
        </HeaderIcons>
      </Header>

      <Content>
        <Description>저장 받문하는 곳의 주소를 등록해보세요</Description>

        {/* 주소 추가 */}
        <Section>
          <SectionTitle>주소 추가</SectionTitle>
          <SearchButton onClick={() => navigate("/address/search")}>
            <FiSearch />
            주소 검색...
          </SearchButton>
          <LocationButton onClick={() => navigate("/address/map")}>
            <FiNavigation /> 현재 위치로 찾기
          </LocationButton>
        </Section>

        {/* 저장된 주소 */}
        <Section>
          <SectionTitle>저장된 주소</SectionTitle>
          <AddressList>
            {addresses.map((address) => (
              <AddressCard key={address.id}>
                <AddressHeader>
                  <AddressTypeRow>
                    <AddressIcon>{getAddressIcon(address.type)}</AddressIcon>
                    <AddressType>{address.type}</AddressType>
                    {address.isDefault && (
                      <DefaultBadge>
                        <FiStar />
                      </DefaultBadge>
                    )}
                  </AddressTypeRow>
                  <RadioButton
                    checked={address.isDefault}
                    onClick={() => handleSetDefault(address.id)}
                  />
                </AddressHeader>

                <AddressInfo>
                  <AddressText>{address.roadAddress}</AddressText>
                  <ActionButtons>
                    <EditButton onClick={() => handleEdit(address.id)}>
                      <FiEdit2 />
                      수정
                    </EditButton>
                    <DeleteButton onClick={() => handleDelete(address.id)}>
                      <FiTrash2 />
                      삭제
                    </DeleteButton>
                  </ActionButtons>
                </AddressInfo>
              </AddressCard>
            ))}
          </AddressList>
        </Section>
      </Content>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: #fafafa;
`;

const Header = styled.header`
  background-color: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e0e0e0;
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  font-size: ${theme.typography.fontSize["2xl"]};
  color: ${theme.colors.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xs};

  &:hover {
    opacity: 0.7;
  }
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
  flex: 1;
  text-align: center;
`;

const HeaderIcons = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const NotificationIcon = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.xl};
  cursor: pointer;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const ProfileAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${theme.colors.primary} 0%,
    ${theme.colors.secondary} 100%
  );
  cursor: pointer;
`;

const Content = styled.div`
  padding: ${theme.spacing.lg};
`;

const Description = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin: 0 0 ${theme.spacing.xl} 0;
`;

const Section = styled.section`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0 0 ${theme.spacing.md} 0;
`;

const SearchButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: white;
  color: #9e9e9e;
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: ${theme.spacing.md};

  &:hover {
    background-color: #f5f5f5;
  }

  svg {
    font-size: ${theme.typography.fontSize.lg};
  }
`;

const LocationButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: white;
  color: #424242;
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const AddressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const AddressCard = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const AddressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const AddressTypeRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const AddressIcon = styled.div`
  font-size: ${theme.typography.fontSize.xl};

  svg {
    width: 24px;
    height: 24px;
  }
`;

const AddressType = styled.span`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
`;

const DefaultBadge = styled.span`
  display: flex;
  align-items: center;
  color: ${theme.colors.accent};
  font-size: ${theme.typography.fontSize.xl};
  margin-left: ${theme.spacing.xs};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const RadioButton = styled.div<{ checked?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid
    ${(props) => (props.checked ? theme.colors.accent : "#e0e0e0")};
  background-color: ${(props) =>
    props.checked ? theme.colors.accent : "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &::after {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: white;
    opacity: ${(props) => (props.checked ? 1 : 0)};
  }

  &:hover {
    border-color: ${theme.colors.accent};
  }
`;

const AddressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${theme.spacing.md};
`;

const AddressText = styled.div`
  flex: 1;
  font-size: ${theme.typography.fontSize.sm};
  color: #424242;
  line-height: 1.5;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const EditButton = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: transparent;
  color: #424242;
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: #f5f5f5;
  }

  svg {
    font-size: ${theme.typography.fontSize.sm};
  }
`;

const DeleteButton = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: transparent;
  color: #d32f2f;
  border: 1px solid #ffcdd2;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: #ffebee;
  }

  svg {
    font-size: ${theme.typography.fontSize.sm};
  }
`;

export default AddressManagementPage;
