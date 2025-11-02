import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { FiChevronLeft } from "react-icons/fi";

const AddressMapPage = () => {
  const navigate = useNavigate();

  const handleConfirmLocation = () => {
    // 선택된 위치 정보 전달
    navigate("/address/detail", {
      state: {
        roadAddress: "서울 노원구 공릉로 179",
        jibunAddress: "서울 노원구 공릉동 419-43",
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

      {/* 지도 영역 */}
      <MapContainer>
        <MapPlaceholder>
          <MapIcon>🗺️</MapIcon>
          <MapText>지도 영역</MapText>
          <MapSubText>실제로는 카카오맵 또는 네이버맵 API 사용</MapSubText>
        </MapPlaceholder>
        <LocationMarker>📍</LocationMarker>
        <CompassButton>🧭</CompassButton>
      </MapContainer>

      {/* 주소 정보 */}
      <AddressInfo>
        <AddressTitle>서울 노원구 공릉로 179</AddressTitle>
        <AddressSubtitle>서울 노원구 공릉동 419-43</AddressSubtitle>
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
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
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

const MapContainer = styled.div`
  position: relative;
  flex: 1;
  background-color: #e8f0f2;
  overflow: hidden;
`;

const MapPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #b3d9e6 0%, #d4e7f0 50%, #e8f0f2 100%);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 20%;
    left: 10%;
    width: 200px;
    height: 150px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: ${theme.borderRadius.lg};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 15%;
    right: 15%;
    width: 150px;
    height: 100px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: ${theme.borderRadius.lg};
  }
`;

const MapIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${theme.spacing.md};
  position: relative;
  z-index: 1;
`;

const MapText = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #424242;
  position: relative;
  z-index: 1;
`;

const MapSubText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin-top: ${theme.spacing.sm};
  position: relative;
  z-index: 1;
`;

const LocationMarker = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  font-size: 48px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  z-index: 2;
`;

const CompassButton = styled.button`
  position: absolute;
  bottom: 120px;
  right: ${theme.spacing.lg};
  width: 48px;
  height: 48px;
  background-color: white;
  border: none;
  border-radius: 50%;
  font-size: ${theme.typography.fontSize["2xl"]};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const AddressInfo = styled.div`
  background-color: white;
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
  border-top-left-radius: ${theme.borderRadius.lg};
  border-top-right-radius: ${theme.borderRadius.lg};
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;

const AddressTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const AddressSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: #757575;
  margin: 0 0 ${theme.spacing.lg} 0;
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
  margin: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
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
