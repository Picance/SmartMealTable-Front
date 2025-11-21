import { useEffect, useState, useRef } from "react";
import { Container as MapDiv, NaverMap, useNavermaps } from "react-naver-maps";
import styled from "styled-components";
import { FiCompass, FiMapPin } from "react-icons/fi";

interface NaverMapPickerProps {
  onLocationSelect?: (location: {
    lat: number;
    lng: number;
    address: string;
    roadAddress?: string;
    jibunAddress?: string;
  }) => void;
  initialCenter?: { lat: number; lng: number };
  height?: string;
  showAddressBox?: boolean;
}

function MapContent({
  onLocationSelect,
  initialCenter,
  showAddressBox = true,
}: NaverMapPickerProps) {
  const navermaps = useNavermaps();
  const [map, setMap] = useState<any>(null);
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [center] = useState(() =>
    initialCenter
      ? new navermaps.LatLng(initialCenter.lat, initialCenter.lng)
      : new navermaps.LatLng(37.5665, 126.978)
  );
  const isUpdatingRef = useRef(false);
  const reverseGeocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 현재 위치 가져오기
  useEffect(() => {
    if (!map) return;

    if (!initialCenter && navigator.geolocation) {
      console.log("위치 권한 요청 중...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("현재 위치 감지 성공:", position.coords);
          const location = new navermaps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          map.setCenter(location);
          reverseGeocode(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("위치 권한 오류:", error);
          alert("위치 권한이 거부되었습니다.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else if (initialCenter) {
      reverseGeocode(initialCenter.lat, initialCenter.lng);
    }

    // 컴포넌트 언마운트 시 타임아웃 정리
    return () => {
      if (reverseGeocodeTimeoutRef.current) {
        clearTimeout(reverseGeocodeTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, initialCenter]);

  // 역지오코딩 - 좌표를 주소로 변환
  const reverseGeocode = (lat: number, lng: number) => {
    console.log("역지오코딩 시작:", { lat, lng });

    // 이전 타임아웃 클리어
    if (reverseGeocodeTimeoutRef.current) {
      clearTimeout(reverseGeocodeTimeoutRef.current);
      reverseGeocodeTimeoutRef.current = null;
    }

    // geocoder를 통한 역지오코딩
    navermaps.Service.reverseGeocode(
      {
        coords: new navermaps.LatLng(lat, lng),
        orders: [
          navermaps.Service.OrderType.ROAD_ADDR,
          navermaps.Service.OrderType.ADDR,
        ].join(","),
      },
      (status: any, response: any) => {
        if (status !== navermaps.Service.Status.OK) {
          console.error("역지오코딩 실패:", status);
          setCurrentAddress("주소를 가져올 수 없습니다");
          return;
        }

        console.log("역지오코딩 성공:", response);

        const result = response.v2;
        let roadAddress = "";
        let jibunAddress = "";
        let simpleAddress = "";

        // 도로명 주소
        if (result.address?.roadAddress) {
          roadAddress = result.address.roadAddress;
          simpleAddress = roadAddress;
        }

        // 지번 주소
        if (result.address?.jibunAddress) {
          jibunAddress = result.address.jibunAddress;
          if (!simpleAddress) simpleAddress = jibunAddress;
        }

        // 주소가 없으면 지역 정보 조합
        if (!simpleAddress && result.results && result.results.length > 0) {
          const region = result.results[0].region;
          simpleAddress = `${region.area1.name} ${region.area2.name} ${region.area3.name}`;
        }

        setCurrentAddress(simpleAddress || "주소를 가져올 수 없습니다");
        console.log("주소 설정 완료:", {
          roadAddress,
          jibunAddress,
          simpleAddress,
        });

        if (onLocationSelect && simpleAddress) {
          onLocationSelect({
            lat,
            lng,
            address: simpleAddress,
            roadAddress: roadAddress || simpleAddress,
            jibunAddress: jibunAddress || simpleAddress,
          });
        }
      }
    );
  };

  // 현재 위치로 이동
  const handleCurrentLocation = () => {
    if (!map) return;

    if (navigator.geolocation) {
      console.log("현재 위치 버튼 클릭");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("현재 위치 재감지:", position.coords);
          const location = new navermaps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          map.setCenter(location);
          reverseGeocode(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("위치 정보 가져오기 실패:", error);
          alert("위치 정보를 가져올 수 없습니다: " + error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      alert("이 브라우저는 위치 서비스를 지원하지 않습니다.");
    }
  };

  // 드래그 시작 이벤트
  const handleDragStart = () => {
    console.log("[MapPicker] 드래그 시작");
  };

  // 드래그 종료 이벤트
  const handleDragEnd = () => {
    if (!map || isUpdatingRef.current) return;

    const mapCenter = map.getCenter();
    const lat = mapCenter.lat();
    const lng = mapCenter.lng();
    console.log("[MapPicker] 드래그 종료, 중심 좌표:", { lat, lng });
    reverseGeocode(lat, lng);
  };

  // 줌 변경 이벤트
  const handleZoomChanged = (zoom: number) => {
    console.log("[MapPicker] 줌 변경:", zoom);
  };

  // 지도 클릭 이벤트
  const handleMapClick = (e: any) => {
    console.log("[MapPicker] 지도 클릭:", e);
  };

  // 마우스 이동 이벤트 (테스트용)
  const handleMouseMove = () => {
    // 너무 많은 로그 방지 - 주석 처리
    // console.log("[MapPicker] 마우스 이동");
  };

  return (
    <MapWrapper>
      {/* 지도 레이어 (최하단, z-index 낮음) */}
      <MapLayer>
        <NaverMap
          ref={setMap}
          defaultCenter={center}
          defaultZoom={16}
          minZoom={7}
          maxZoom={21}
          draggable={true}
          pinchZoom={true}
          scrollWheel={true}
          keyboardShortcuts={true}
          disableDoubleClickZoom={false}
          disableDoubleTapZoom={false}
          disableTwoFingerTapZoom={false}
          scaleControl={false}
          logoControl={false}
          mapDataControl={false}
          zoomControl={true}
          zoomControlOptions={{
            position: navermaps.Position.TOP_RIGHT,
          }}
          onZoomChanged={handleZoomChanged}
          {...({ onDragstart: handleDragStart } as any)}
          {...({ onDragend: handleDragEnd } as any)}
          {...({ onClick: handleMapClick } as any)}
          {...({ onMousemove: handleMouseMove } as any)}
        />
      </MapLayer>

      {/* 오버레이 레이어 (상단, pointer-events 제어) */}
      <OverlayLayer>
        {/* 중앙 고정 마커 */}
        <CenterMarker>
          <FiMapPin />
        </CenterMarker>

        {/* 현재 위치 버튼 */}
        <CurrentLocationButton onClick={handleCurrentLocation}>
          <FiCompass />
        </CurrentLocationButton>

        {/* 주소 정보 */}
        {showAddressBox && currentAddress && (
          <AddressInfoBox>
            <AddressText>{currentAddress}</AddressText>
          </AddressInfoBox>
        )}
      </OverlayLayer>
    </MapWrapper>
  );
}

const NaverMapPicker = ({
  onLocationSelect,
  initialCenter,
  height = "100%",
  showAddressBox = true,
}: NaverMapPickerProps) => {
  return (
    <MapDiv style={{ width: "100%", height }}>
      <MapContent
        onLocationSelect={onLocationSelect}
        initialCenter={initialCenter}
        height={height}
        showAddressBox={showAddressBox}
      />
    </MapDiv>
  );
};

// Styled Components
const MapWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const MapLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;

  /* 지도가 모든 터치/마우스 이벤트를 받을 수 있도록 */
  & > div {
    position: relative !important;
    width: 100% !important;
    height: 100% !important;
    pointer-events: auto !important;
  }

  /* 네이버 지도 canvas */
  canvas {
    pointer-events: auto !important;
    touch-action: pan-x pan-y pinch-zoom !important;
  }
`;

const OverlayLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  pointer-events: none; /* 기본적으로 이벤트 통과 */

  /* 자식 요소는 개별적으로 pointer-events 제어 */
  & > * {
    pointer-events: auto;
  }
`;

const CenterMarker = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  font-size: 48px;
  pointer-events: none !important; /* 마커는 절대 클릭 안됨 */
  user-select: none;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  animation: bounce 0.6s ease;

  svg {
    width: 48px;
    height: 48px;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translate(-50%, -100%);
    }
    50% {
      transform: translate(-50%, -110%);
    }
  }
`;

const CurrentLocationButton = styled.button`
  position: absolute;
  bottom: 120px;
  right: 16px;
  width: 48px;
  height: 48px;
  background-color: white;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  pointer-events: auto !important; /* 버튼은 클릭 가능 */

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const AddressInfoBox = styled.div`
  position: absolute;
  bottom: 60px;
  left: 16px;
  right: 16px;
  background-color: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
`;

const AddressText = styled.p`
  font-size: 14px;
  color: #212121;
  margin: 0;
  font-weight: 500;
`;

export default NaverMapPicker;
