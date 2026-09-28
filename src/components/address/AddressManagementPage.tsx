import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import {
  FiBell,
  FiBook,
  FiBriefcase,
  FiChevronLeft,
  FiHome,
  FiMapPin,
  FiNavigation,
  FiStar,
  FiTrash2,
} from "react-icons/fi";
import {
  addressService,
  type Address,
  type AddressType,
} from "../../services/address.service";

const ADDRESS_TYPE_LABEL: Record<AddressType, string> = {
  HOME: "집",
  OFFICE: "직장",
  SCHOOL: "학교",
  ETC: "기타",
};

const getErrorMessage = (error: any, fallback: string): string =>
  error?.response?.data?.error?.message || fallback;

const AddressManagementPage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoadError(null);
      setAddresses(await addressService.getAddresses());
    } catch (error) {
      setLoadError(getErrorMessage(error, "주소 목록을 불러오지 못했습니다."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // 주소 삭제 (대표 주소를 지우면 서버가 대표 주소를 다시 정하므로 목록을 새로 받는다)
  const handleDelete = async (addressHistoryId: number) => {
    if (!window.confirm("이 주소를 삭제하시겠습니까?")) return;

    try {
      await addressService.deleteAddress(addressHistoryId);
      await fetchAddresses();
    } catch (error) {
      alert(getErrorMessage(error, "주소를 삭제하지 못했습니다."));
    }
  };

  // 대표 주소 설정
  const handleSetPrimary = async (address: Address) => {
    if (address.isPrimary) return;

    try {
      await addressService.setPrimaryAddress(address.addressHistoryId);
      await fetchAddresses();
    } catch (error) {
      alert(getErrorMessage(error, "대표 주소를 변경하지 못했습니다."));
    }
  };

  const getAddressIcon = (type: AddressType) => {
    switch (type) {
      case "HOME":
        return <FiHome />;
      case "OFFICE":
        return <FiBriefcase />;
      case "SCHOOL":
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
        <Description>자주 방문하는 곳의 주소를 등록해 보세요</Description>

        {/* 주소 추가 */}
        <Section>
          <SectionTitle>주소 추가</SectionTitle>
          <LocationButton onClick={() => navigate("/address/map")}>
            <FiNavigation /> 현재 위치로 찾기
          </LocationButton>
        </Section>

        {/* 저장된 주소 */}
        <Section>
          <SectionTitle>저장된 주소</SectionTitle>
          {isLoading ? (
            <StatusText>주소를 불러오는 중...</StatusText>
          ) : loadError ? (
            <StatusText>{loadError}</StatusText>
          ) : addresses.length === 0 ? (
            <StatusText>저장된 주소가 없습니다.</StatusText>
          ) : (
            <AddressList>
              {addresses.map((address) => (
                <AddressCard key={address.addressHistoryId}>
                  <AddressHeader>
                    <AddressTypeRow>
                      <AddressIcon>
                        {getAddressIcon(address.addressType)}
                      </AddressIcon>
                      <AddressName>
                        {address.addressAlias ||
                          ADDRESS_TYPE_LABEL[address.addressType] ||
                          "기타"}
                      </AddressName>
                      {address.isPrimary && (
                        <DefaultBadge>
                          <FiStar />
                        </DefaultBadge>
                      )}
                    </AddressTypeRow>
                    <RadioButton
                      checked={address.isPrimary}
                      onClick={() => handleSetPrimary(address)}
                    />
                  </AddressHeader>

                  <AddressInfo>
                    <AddressText>
                      {address.streetNameAddress}
                      {address.detailedAddress &&
                        ` ${address.detailedAddress}`}
                    </AddressText>
                    <ActionButtons>
                      <DeleteButton
                        onClick={() => handleDelete(address.addressHistoryId)}
                      >
                        <FiTrash2 />
                        삭제
                      </DeleteButton>
                    </ActionButtons>
                  </AddressInfo>
                </AddressCard>
              ))}
            </AddressList>
          )}
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

const StatusText = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  text-align: center;
  margin: 0;
  padding: ${theme.spacing.xl} 0;
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

const AddressName = styled.span`
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
