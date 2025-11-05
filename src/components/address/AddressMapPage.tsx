import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { FiChevronLeft } from "react-icons/fi";
import NaverMapPicker from "../map/NaverMapPicker";

const AddressMapPage = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    roadAddress?: string;
    jibunAddress?: string;
  } | null>(null);

  const handleLocationSelect = (location: {
    lat: number;
    lng: number;
    address: string;
    roadAddress?: string;
    jibunAddress?: string;
  }) => {
    setSelectedLocation(location);
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      alert("위치를 선택해주세요.");
      return;
    }

    // 선택된 위치 정보 전달
    navigate("/address/detail", {
      state: {
        roadAddress: selectedLocation.address,
        jibunAddress: selectedLocation.address,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      },
    });
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </BackButton>
        <Title>지도에서 위치 확인</Title>
        <Spacer />
      </Header>

      <Content>
        {/* 지도 영역 */}
        <MapContainer>
          <NaverMapPicker
            onLocationSelect={handleLocationSelect}
            height="100%"
            showAddressBox={false}
          />
        </MapContainer>

        {/* 주소 정보 */}
        <AddressInfo>
          <AddressTitle>
            {selectedLocation?.roadAddress ||
              selectedLocation?.address ||
              "위치를 선택해주세요"}
          </AddressTitle>
          {selectedLocation?.jibunAddress && (
            <AddressSubtitle>{selectedLocation.jibunAddress}</AddressSubtitle>
          )}
          <WarningBox>
            <WarningText>
              지도의 표시와 실제 주소가 맞는지 확인해주세요.
            </WarningText>
          </WarningBox>
        </AddressInfo>

        {/* 확인 버튼 */}
        <ConfirmButton onClick={handleConfirmLocation}>
          이 위치로 주소 등록
        </ConfirmButton>
      </Content>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background-color: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e0e0e0;
  z-index: 10;
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

const Spacer = styled.div`
  width: 32px;
`;

const Content = styled.div`
  flex: 1;
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  overflow-y: auto;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 400px;
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  background-color: #e8f0f2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const AddressInfo = styled.div`
  background-color: white;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const AddressTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
`;

const AddressSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: #757575;
  margin: 0;
`;

const WarningBox = styled.div`
  background-color: #fff3e0;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border-left: 4px solid ${theme.colors.secondary};
`;

const WarningText = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #e65100;
  margin: 0;
  line-height: 1.5;
`;

const ConfirmButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e55a2b;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default AddressMapPage;
