import { useState } from "react";
import styled from "styled-components";
import NaverMapPicker from "../map/NaverMapPicker";
import { mapService } from "../../services/map.service";

interface AddressMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: {
    lat: number;
    lng: number;
    address: string;
    roadAddress?: string;
    jibunAddress?: string;
  }) => void;
  title?: string;
  confirmButtonText?: string;
}

const AddressMapModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "지도에서 위치 확인",
  confirmButtonText = "이 위치로 주소 등록",
}: AddressMapModalProps) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    roadAddress?: string;
    jibunAddress?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleLocationSelect = async (location: {
    lat: number;
    lng: number;
    address: string;
    roadAddress?: string;
    jibunAddress?: string;
  }) => {
    // Backend API로 역지오코딩하여 정확한 주소 가져오기
    try {
      const result = await mapService.reverseGeocode(
        location.lat,
        location.lng
      );
      if (result) {
        setSelectedLocation({
          lat: location.lat,
          lng: location.lng,
          address: result.roadAddress || result.jibunAddress,
          roadAddress: result.roadAddress,
          jibunAddress: result.jibunAddress,
        });
      } else {
        setSelectedLocation(location);
      }
    } catch (error) {
      console.error("역지오코딩 실패, 기본 주소 사용:", error);
      // API 실패 시 기본 주소 사용
      setSelectedLocation(location);
    }
  };

  const handleConfirm = () => {
    if (!selectedLocation) {
      alert("위치를 선택해주세요.");
      return;
    }
    onConfirm(selectedLocation);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <BackButton onClick={onClose}>←</BackButton>
          <ModalTitle>{title}</ModalTitle>
          <Spacer />
        </ModalHeader>

        <ModalContent>
          <MapContainer>
            <NaverMapPicker
              onLocationSelect={handleLocationSelect}
              height="100%"
              showAddressBox={false}
            />
          </MapContainer>

          <LocationInfo>
            <LocationAddress>
              {selectedLocation?.roadAddress ||
                selectedLocation?.address ||
                "위치를 선택해주세요"}
            </LocationAddress>
            {selectedLocation?.jibunAddress && (
              <LocationJibun>{selectedLocation.jibunAddress}</LocationJibun>
            )}
            <LocationWarning>
              지도의 표시와 실제 주소가 맞는지 확인해주세요.
            </LocationWarning>
          </LocationInfo>

          <ConfirmButton onClick={handleConfirm} disabled={!selectedLocation}>
            {confirmButtonText}
          </ConfirmButton>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const ModalContainer = styled.div`
  background-color: #fafafa;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #000000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;

  &:hover {
    opacity: 0.7;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
  flex: 1;
  text-align: center;
`;

const Spacer = styled.div`
  width: 40px;
`;

const ModalContent = styled.div`
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;

  /* 스크롤이 지도 조작을 방해하지 않도록 */
  -webkit-overflow-scrolling: touch;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: visible;
  background-color: #e8f0f2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  isolation: isolate;

  /* 지도 조작이 가능하도록 명시적 설정 */
  * {
    pointer-events: auto;
    touch-action: pan-x pan-y;
  }

  /* 네이버 지도 컨테이너 */
  & > div {
    pointer-events: auto !important;
  }
`;

const LocationInfo = styled.div`
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
`;

const LocationAddress = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
`;

const LocationJibun = styled.p`
  font-size: 0.875rem;
  color: #757575;
  margin: 0;
`;

const LocationWarning = styled.p`
  font-size: 0.75rem;
  color: #ff6b35;
  background-color: #fff5f0;
  padding: 0.75rem;
  border-radius: 6px;
  margin: 0.5rem 0 0 0;
`;

const ConfirmButton = styled.button`
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
  flex-shrink: 0;

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

export default AddressMapModal;
