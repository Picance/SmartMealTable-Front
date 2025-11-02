import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { FiChevronRight } from "react-icons/fi";
import BottomNavigation from "../../components/layout/BottomNav";

const SettingsPage = () => {
  const navigate = useNavigate();

  // 알림 설정
  const [pushNotification, setPushNotification] = useState(true);
  const [storeNotification, setStoreNotification] = useState(true);
  const [recommendationNotification, setRecommendationNotification] =
    useState(false);

  // 개인정보 및 보안
  const [userTracking, setUserTracking] = useState(false);

  // 캐시 삭제
  const handleClearCache = () => {
    if (window.confirm("캐시를 삭제하시겠습니까?")) {
      // TODO: 실제 캐시 삭제 로직
      alert("캐시가 삭제되었습니다.");
    }
  };

  return (
    <Container>
      <Header>
        <Title>앱 설정</Title>
        <Avatar>👤</Avatar>
      </Header>

      <Content>
        {/* 알림 설정 */}
        <Section>
          <SectionTitle>알림 설정</SectionTitle>

          <SettingItem>
            <SettingIcon>🔔</SettingIcon>
            <SettingContent>
              <SettingLabel>전체 푸시 알림</SettingLabel>
              <SettingDescription>
                새로운 업데이트, 공지 및 이벤트 알림
              </SettingDescription>
            </SettingContent>
            <Toggle
              isOn={pushNotification}
              onClick={() => setPushNotification(!pushNotification)}
            >
              <ToggleCircle isOn={pushNotification} />
            </Toggle>
          </SettingItem>

          <SettingItem>
            <SettingIcon>✏️</SettingIcon>
            <SettingContent>
              <SettingLabel>가게 공지 알림</SettingLabel>
              <SettingDescription>
                즐겨찾는 가게에서 공지하는 글을 알림
              </SettingDescription>
            </SettingContent>
            <Toggle
              isOn={storeNotification}
              onClick={() => setStoreNotification(!storeNotification)}
            >
              <ToggleCircle isOn={storeNotification} />
            </Toggle>
          </SettingItem>

          <SettingItem>
            <SettingIcon>📋</SettingIcon>
            <SettingContent>
              <SettingLabel>음식점 추천 알림</SettingLabel>
              <SettingDescription>
                식사 시간대 별 음식점 추천 알림
              </SettingDescription>
            </SettingContent>
            <Toggle
              isOn={recommendationNotification}
              onClick={() =>
                setRecommendationNotification(!recommendationNotification)
              }
            >
              <ToggleCircle isOn={recommendationNotification} />
            </Toggle>
          </SettingItem>
        </Section>

        {/* 개인정보 및 보안 */}
        <Section>
          <SectionTitle>개인정보 및 보안</SectionTitle>

          <SettingItem>
            <SettingIcon>🛡️</SettingIcon>
            <SettingContent>
              <SettingLabel>사용자 추적</SettingLabel>
              <SettingDescription>
                앱 사용 데이터 익명 추적 허용
              </SettingDescription>
            </SettingContent>
            <Toggle
              isOn={userTracking}
              onClick={() => setUserTracking(!userTracking)}
            >
              <ToggleCircle isOn={userTracking} />
            </Toggle>
          </SettingItem>
        </Section>

        {/* 앱 정보 */}
        <Section>
          <SectionTitle>앱 정보</SectionTitle>

          <MenuItem onClick={() => navigate("/settings/language")}>
            <MenuIcon>🌐</MenuIcon>
            <MenuContent>
              <MenuLabel>언어 설정</MenuLabel>
              <MenuDescription>앱 언어 변경</MenuDescription>
            </MenuContent>
            <MenuArrow>
              <FiChevronRight />
            </MenuArrow>
          </MenuItem>

          <MenuItem onClick={() => navigate("/settings/help")}>
            <MenuIcon>❓</MenuIcon>
            <MenuContent>
              <MenuLabel>도움말 및 지원</MenuLabel>
              <MenuDescription>자주 묻는 질문, 문의하기</MenuDescription>
            </MenuContent>
            <MenuArrow>
              <FiChevronRight />
            </MenuArrow>
          </MenuItem>

          <MenuItem onClick={() => navigate("/settings/privacy")}>
            <MenuIcon>ⓘ</MenuIcon>
            <MenuContent>
              <MenuLabel>개인정보처리방침</MenuLabel>
            </MenuContent>
            <MenuArrow>
              <FiChevronRight />
            </MenuArrow>
          </MenuItem>

          <MenuItem onClick={() => navigate("/settings/terms")}>
            <MenuIcon>ⓘ</MenuIcon>
            <MenuContent>
              <MenuLabel>이용 약관</MenuLabel>
            </MenuContent>
            <MenuArrow>
              <FiChevronRight />
            </MenuArrow>
          </MenuItem>
        </Section>

        {/* 캐시 삭제 */}
        <ClearCacheButton onClick={handleClearCache}>
          캐시 삭제
        </ClearCacheButton>
      </Content>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="spending" />
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: #fafafa;
  padding-bottom: 80px;
`;

const Header = styled.header`
  background-color: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
  flex: 1;
  text-align: center;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.xl};
`;

const Content = styled.div`
  padding: ${theme.spacing.lg};
`;

const Section = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0 0 ${theme.spacing.lg} 0;
`;

const SettingItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} 0;

  &:not(:last-child) {
    border-bottom: 1px solid #f5f5f5;
  }
`;

const SettingIcon = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  flex-shrink: 0;
  margin-top: 2px;
`;

const SettingContent = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
  margin-bottom: ${theme.spacing.xs};
`;

const SettingDescription = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: #757575;
  line-height: 1.4;
`;

const Toggle = styled.button<{ isOn: boolean }>`
  width: 52px;
  height: 32px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${(props) =>
    props.isOn ? theme.colors.accent : "#e0e0e0"};
  border: none;
  cursor: pointer;
  position: relative;
  transition: background-color 0.3s;
  flex-shrink: 0;

  &:hover {
    opacity: 0.9;
  }
`;

const ToggleCircle = styled.div<{ isOn: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: white;
  position: absolute;
  top: 2px;
  left: ${(props) => (props.isOn ? "22px" : "2px")};
  transition: left 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} 0;
  cursor: pointer;
  transition: background-color 0.2s;

  &:not(:last-child) {
    border-bottom: 1px solid #f5f5f5;
  }

  &:hover {
    background-color: #fafafa;
  }

  &:active {
    transform: scale(0.99);
  }
`;

const MenuIcon = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  flex-shrink: 0;
`;

const MenuContent = styled.div`
  flex: 1;
`;

const MenuLabel = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: #212121;
  margin-bottom: ${theme.spacing.xs};
`;

const MenuDescription = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: #757575;
`;

const MenuArrow = styled.div`
  color: #9e9e9e;
  font-size: ${theme.typography.fontSize.lg};
  flex-shrink: 0;
`;

const ClearCacheButton = styled.button`
  width: 100%;
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

export default SettingsPage;
