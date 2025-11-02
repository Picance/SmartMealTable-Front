import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { FiChevronRight } from "react-icons/fi";

const ProfilePage = () => {
  const navigate = useNavigate();
  
  // 임시 사용자 데이터
  const [user] = useState({
    name: "김민준",
    email: "minjun.kim@example.com",
    nickname: "김민준",
    avatar: "👤",
    affiliation: "스마트멀티이동 배달",
    address: "서울시 강남구 테헤란로 123",
  });

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      navigate("/login-options");
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("정말로 회원 탈퇴하시겠습니까?\n모든 데이터가 삭제됩니다.")) {
      navigate("/login-options");
    }
  };

  return (
    <Container>
      <Header>
        <Title>프로필</Title>
        <HeaderIcons>
          <NotificationIcon>🔔</NotificationIcon>
          <ProfileAvatar small />
        </HeaderIcons>
      </Header>

      <Content>
        {/* 프로필 헤더 */}
        <ProfileHeader>
          <ProfileAvatar large>
            <AvatarImage>👤</AvatarImage>
          </ProfileAvatar>
          <ProfileInfo>
            <ProfileName>{user.name}</ProfileName>
            <ProfileSubtitle>내 정보 관리</ProfileSubtitle>
          </ProfileInfo>
        </ProfileHeader>

        {/* 계정 관리 */}
        <Section>
          <SectionTitle>계정 관리</SectionTitle>
          <InfoBox>
            <InfoLabel>이메일 주소</InfoLabel>
            <InfoValue>{user.email}</InfoValue>
          </InfoBox>
          <ButtonRow>
            <ActionButton outline onClick={() => navigate("/profile/nickname")}>
              닉네임 업데이트
            </ActionButton>
            <ActionButton outline onClick={() => navigate("/profile/password")}>
              비밀번호 변경
            </ActionButton>
          </ButtonRow>
        </Section>

        {/* 소셜 로그인 관리 */}
        <Section>
          <SectionTitle>소셜 로그인 관리</SectionTitle>
          <SocialCard>
            <SocialInfo>
              <SocialIcon>🔆</SocialIcon>
              <SocialName>카카오</SocialName>
              <ConnectedBadge>연결됨</ConnectedBadge>
            </SocialInfo>
            <UnlinkButton>해제</UnlinkButton>
          </SocialCard>
          <SocialCard>
            <SocialInfo>
              <SocialIcon>🌐</SocialIcon>
              <SocialName>구글</SocialName>
              <ConnectedBadge>연결됨</ConnectedBadge>
            </SocialInfo>
            <UnlinkButton>해제</UnlinkButton>
          </SocialCard>
        </Section>

        {/* 사용자 정보 */}
        <Section>
          <SectionTitle>사용자 정보</SectionTitle>
          <MenuList>
            <MenuItem onClick={() => navigate("/profile/affiliation")}>
              <MenuItemIcon>📄</MenuItemIcon>
              <MenuItemContent>
                <MenuItemLabel>소속</MenuItemLabel>
                <MenuItemDescription>{user.affiliation}</MenuItemDescription>
              </MenuItemContent>
              <MenuItemArrow>
                <FiChevronRight />
              </MenuItemArrow>
            </MenuItem>
            
            <MenuItem onClick={() => navigate("/profile/address")}>
              <MenuItemIcon>🏠</MenuItemIcon>
              <MenuItemContent>
                <MenuItemLabel>대표 주소</MenuItemLabel>
                <MenuItemDescription>{user.address}</MenuItemDescription>
              </MenuItemContent>
              <MenuItemArrow>
                <FiChevronRight />
              </MenuItemArrow>
            </MenuItem>
            
            <MenuItem onClick={() => navigate("/profile/preference")}>
              <MenuItemIcon>≡</MenuItemIcon>
              <MenuItemContent>
                <MenuItemLabel>음식 선호/불호</MenuItemLabel>
              </MenuItemContent>
              <MenuItemArrow>
                <FiChevronRight />
              </MenuItemArrow>
            </MenuItem>
            
            <MenuItem onClick={() => navigate("/profile/budget")}>
              <MenuItemIcon>📅</MenuItemIcon>
              <MenuItemContent>
                <MenuItemLabel>예산 관리</MenuItemLabel>
                <MenuItemDescription>월별 예산 및 지출 확인</MenuItemDescription>
              </MenuItemContent>
              <MenuItemArrow>
                <FiChevronRight />
              </MenuItemArrow>
            </MenuItem>
            
            <MenuItem onClick={() => navigate("/profile/recommendation")}>
              <MenuItemIcon>🍴</MenuItemIcon>
              <MenuItemContent>
                <MenuItemLabel>음식 추천 시스템 선택</MenuItemLabel>
              </MenuItemContent>
              <MenuItemArrow>
                <FiChevronRight />
              </MenuItemArrow>
            </MenuItem>
          </MenuList>
        </Section>

        {/* 앱 설정 */}
        <Section>
          <SectionTitle>앱 설정</SectionTitle>
          <MenuList>
            <MenuItem onClick={() => navigate("/settings")}>
              <MenuItemIcon>👤</MenuItemIcon>
              <MenuItemContent>
                <MenuItemLabel>앱 설정</MenuItemLabel>
              </MenuItemContent>
              <MenuItemArrow>
                <FiChevronRight />
              </MenuItemArrow>
            </MenuItem>
          </MenuList>
        </Section>

        {/* 기타 */}
        <Section>
          <SectionTitle>기타</SectionTitle>
          <LogoutButton onClick={handleLogout}>
            로그아웃
          </LogoutButton>
          <DeleteButton onClick={handleDeleteAccount}>
            회원 탈퇴
          </DeleteButton>
        </Section>

        {/* 앱 버전 */}
        <AppVersion>앱 버전 1.0.0</AppVersion>
      </Content>

      {/* 하단 네비게이션 */}
      <BottomNav>
        <NavItem onClick={() => navigate("/home")}>
          <NavIcon>🏠</NavIcon>
          <NavLabel>홈</NavLabel>
        </NavItem>
        <NavItem onClick={() => navigate("/spending")}>
          <NavIcon>📋</NavIcon>
          <NavLabel>지출 내역</NavLabel>
        </NavItem>
        <NavItem onClick={() => navigate("/recommendation")}>
          <NavIcon>🍽️</NavIcon>
          <NavLabel>음식 추천</NavLabel>
        </NavItem>
        <NavItem onClick={() => navigate("/favorites")}>
          <NavIcon>❤️</NavIcon>
          <NavLabel>즐겨 찾는 가게</NavLabel>
        </NavItem>
        <NavItem active>
          <NavIcon>👤</NavIcon>
          <NavLabel active>프로필</NavLabel>
        </NavItem>
      </BottomNav>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
`;

const HeaderIcons = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const NotificationIcon = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  cursor: pointer;
`;

const ProfileAvatar = styled.div<{ large?: boolean; small?: boolean }>`
  width: ${props => (props.large ? "60px" : props.small ? "40px" : "40px")};
  height: ${props => (props.large ? "60px" : props.small ? "40px" : "40px")};
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AvatarImage = styled.div`
  font-size: 32px;
`;

const Content = styled.div`
  padding: ${theme.spacing.lg};
`;

const ProfileHeader = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: ${theme.spacing.lg};
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const ProfileSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin: 0;
`;

const Section = styled.section`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
  margin: 0 0 ${theme.spacing.md} 0;
`;

const InfoBox = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const InfoLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin-bottom: ${theme.spacing.xs};
`;

const InfoValue = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
`;

const ButtonRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
`;

const ActionButton = styled.button<{ outline?: boolean }>`
  padding: ${theme.spacing.md};
  background-color: ${props => (props.outline ? "white" : theme.colors.accent)};
  color: ${props => (props.outline ? theme.colors.secondary : "white")};
  border: ${props => (props.outline ? `1px solid ${theme.colors.secondary}` : "none")};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => (props.outline ? "#fff8f0" : "#e55a2b")};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SocialCard = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: ${theme.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SocialInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const SocialIcon = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
`;

const SocialName = styled.span`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: #212121;
`;

const ConnectedBadge = styled.span`
  background-color: ${theme.colors.accent};
  color: white;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const UnlinkButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background-color: transparent;
  color: #757575;
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const MenuList = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const MenuItem = styled.div`
  padding: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #fafafa;
  }

  &:active {
    background-color: #f5f5f5;
  }
`;

const MenuItemIcon = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.secondary};
`;

const MenuItemContent = styled.div`
  flex: 1;
`;

const MenuItemLabel = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: #212121;
  margin-bottom: ${theme.spacing.xs};
`;

const MenuItemDescription = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
`;

const MenuItemArrow = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  color: #bdbdbd;
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: white;
  color: #424242;
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: ${theme.spacing.md};

  &:hover {
    background-color: #f5f5f5;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const DeleteButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #b71c1c;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const AppVersion = styled.div`
  text-align: center;
  font-size: ${theme.typography.fontSize.sm};
  color: #9e9e9e;
  margin-top: ${theme.spacing.xl};
`;

const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  padding: ${theme.spacing.sm} 0;
  z-index: 100;
`;

const NavItem = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
  cursor: pointer;
  flex: 1;
  transition: all 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

const NavIcon = styled.div`
  font-size: ${theme.typography.fontSize.xl};
`;

const NavLabel = styled.span<{ active?: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  color: ${props => (props.active ? theme.colors.accent : "#757575")};
  font-weight: ${props => (props.active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal)};
`;

export default ProfilePage;
