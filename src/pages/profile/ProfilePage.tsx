import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import {
  FiBell,
  FiChevronRight,
  FiUser,
  FiBriefcase,
  FiSliders,
  FiCalendar,
  FiSettings,
  FiX,
  FiCompass,
} from "react-icons/fi";
import {
  PiChatsCircleFill,
  PiGlobeSimpleFill,
  PiBowlFoodFill,
  PiRobotFill,
  PiPiggyBankFill,
  PiScalesFill,
} from "react-icons/pi";
import BottomNavigation from "../../components/layout/BottomNav";
import { getMyProfile, updateNickname } from "../../services/profile.service";
import type { ProfileResponse } from "../../services/profile.service";

const ProfilePage = () => {
  const navigate = useNavigate();

  // 사용자 프로필 데이터
  const [user, setUser] = useState<ProfileResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 모달 상태
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);

  // 닉네임 변경
  const [newNickname, setNewNickname] = useState("");

  // 비밀번호 변경
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 음식 추천 유형
  const [recommendationType, setRecommendationType] = useState<
    "SAVING" | "ADVENTURE" | "BALANCED"
  >("BALANCED");

  // 프로필 조회
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await getMyProfile();
        setUser(response.data);
        setRecommendationType(response.data.recommendationType);
      } catch (error) {
        console.error("프로필 조회 실패:", error);
        alert("프로필을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleNicknameUpdate = async () => {
    if (!newNickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    try {
      const response = await updateNickname(newNickname);
      if (user) {
        setUser({ ...user, nickname: response.data.nickname });
      }
      setShowNicknameModal(false);
      setNewNickname("");
      alert("닉네임이 변경되었습니다.");
    } catch (error) {
      console.error("닉네임 변경 실패:", error);
      alert("닉네임 변경에 실패했습니다.");
    }
  };

  const handlePasswordChange = () => {
    if (currentPassword && newPassword && confirmPassword) {
      if (newPassword === confirmPassword) {
        // TODO: API 호출
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        alert("비밀번호가 변경되었습니다.");
      } else {
        alert("새 비밀번호가 일치하지 않습니다.");
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      navigate("/login-options");
    }
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm("정말로 회원 탈퇴하시겠습니까?\n모든 데이터가 삭제됩니다.")
    ) {
      navigate("/login-options");
    }
  };

  // 로딩 중이거나 데이터가 없으면 로딩 표시
  if (isLoading || !user) {
    return (
      <Container>
        <Header>
          <Title>프로필</Title>
        </Header>
        <Content>
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            로딩 중...
          </div>
        </Content>
        <BottomNavigation activeTab="profile" />
      </Container>
    );
  }

  // 추천 타입 한글 변환
  const getRecommendationTypeKorean = (type: string) => {
    switch (type) {
      case "SAVING":
        return "절약형";
      case "ADVENTURE":
        return "모험형";
      case "BALANCED":
        return "균형형";
      default:
        return "균형형";
    }
  };

  return (
    <Container>
      <Header>
        <Title>프로필</Title>
        <HeaderIcons>
          <NotificationIcon aria-label="알림">
            <FiBell />
          </NotificationIcon>
          <ProfileAvatar $small />
        </HeaderIcons>
      </Header>

      <Content>
        {/* 프로필 헤더 */}
        <ProfileHeader>
          <ProfileAvatar $large>
            <AvatarIcon aria-hidden="true">
              <FiUser />
            </AvatarIcon>
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
            <ActionButton $outline onClick={() => setShowNicknameModal(true)}>
              닉네임 업데이트
            </ActionButton>
            <ActionButton $outline onClick={() => setShowPasswordModal(true)}>
              비밀번호 변경
            </ActionButton>
          </ButtonRow>
        </Section>

        {/* 소셜 로그인 관리 */}
        <Section>
          <SectionTitle>소셜 로그인 관리</SectionTitle>
          {user.socialAccounts.map((account) => (
            <SocialCard key={account.provider}>
              <SocialInfo>
                <SocialIcon aria-hidden="true">
                  {account.provider === "KAKAO" ? (
                    <PiChatsCircleFill />
                  ) : (
                    <PiGlobeSimpleFill />
                  )}
                </SocialIcon>
                <SocialName>
                  {account.provider === "KAKAO" ? "카카오" : "구글"}
                </SocialName>
                <ConnectedBadge>연결됨</ConnectedBadge>
              </SocialInfo>
              <UnlinkButton>해제</UnlinkButton>
            </SocialCard>
          ))}
        </Section>

        {/* 사용자 정보 */}
        <Section>
          <SectionTitle>사용자 정보</SectionTitle>
          <MenuList>
            <MenuItem onClick={() => navigate("/affiliation")}>
              <MenuItemIcon>
                <FiBriefcase />
              </MenuItemIcon>
              <MenuItemContent>
                <MenuItemLabel>소속</MenuItemLabel>
                <MenuItemDescription>{user.group.name}</MenuItemDescription>
              </MenuItemContent>
              <MenuItemArrow>
                <FiChevronRight />
              </MenuItemArrow>
            </MenuItem>

            {/* 주소는 별도 API가 필요하므로 임시 주석 처리 */}
            {/* <MenuItem onClick={() => navigate("/address/management")}>
              <MenuItemIcon>ADDRESS</MenuItemIcon>
              <MenuItemContent>
                <MenuItemLabel>대표 주소</MenuItemLabel>
                <MenuItemDescription>{user.address}</MenuItemDescription>
              </MenuItemContent>
              <MenuItemArrow>
                <FiChevronRight />
              </MenuItemArrow>
            </MenuItem> */}

            <MenuItem onClick={() => navigate("/profile/preference")}>
              <MenuItemIcon>
                <FiSliders />
              </MenuItemIcon>
              <MenuItemContent>
                <MenuItemLabel>음식 선호/불호</MenuItemLabel>
              </MenuItemContent>
              <MenuItemArrow>
                <FiChevronRight />
              </MenuItemArrow>
            </MenuItem>

            <MenuItem onClick={() => navigate("/profile/budget")}>
              <MenuItemIcon>
                <FiCalendar />
              </MenuItemIcon>
              <MenuItemContent>
                <MenuItemLabel>예산 관리</MenuItemLabel>
                <MenuItemDescription>
                  월별 예산 및 지출 확인
                </MenuItemDescription>
              </MenuItemContent>
              <MenuItemArrow>
                <FiChevronRight />
              </MenuItemArrow>
            </MenuItem>

            <MenuItem onClick={() => setShowRecommendationModal(true)}>
              <MenuItemIcon>
                <PiBowlFoodFill />
              </MenuItemIcon>
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
              <MenuItemIcon>
                <FiSettings />
              </MenuItemIcon>
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
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
          <DeleteButton onClick={handleDeleteAccount}>회원 탈퇴</DeleteButton>
        </Section>

        {/* 앱 버전 */}
        <AppVersion>앱 버전 1.0.0</AppVersion>
      </Content>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="profile" />

      {/* 닉네임 변경 모달 */}
      {showNicknameModal && (
        <ModalOverlay onClick={() => setShowNicknameModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>닉네임 관리</ModalTitle>
              <CloseButton
                onClick={() => setShowNicknameModal(false)}
                aria-label="닫기"
              >
                <FiX />
              </CloseButton>
            </ModalHeader>
            <ModalDescription>
              이래의 닉네임을 확인하고 업데이트하세요.
            </ModalDescription>

            <ModalFormGroup>
              <ModalLabel>현재 닉네임</ModalLabel>
              <ModalInputReadonly value={user.nickname} readOnly />
            </ModalFormGroup>

            <ModalFormGroup>
              <ModalLabel>새로운 닉네임</ModalLabel>
              <ModalInput
                type="text"
                placeholder="새로운 닉네임을 입력하세요"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
              />
            </ModalFormGroup>

            <ModalButton onClick={handleNicknameUpdate}>
              닉네임 업데이트
            </ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <ModalOverlay onClick={() => setShowPasswordModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>비밀번호 변경</ModalTitle>
              <CloseButton
                onClick={() => setShowPasswordModal(false)}
                aria-label="닫기"
              >
                <FiX />
              </CloseButton>
            </ModalHeader>
            <ModalDescription>
              새 비밀번호를 설정하려면 아래 필드를 작성하세요.
            </ModalDescription>

            <ModalFormGroup>
              <ModalLabel>현재 비밀번호</ModalLabel>
              <ModalInput
                type="password"
                placeholder="현재 비밀번호를 입력하세요."
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </ModalFormGroup>

            <ModalFormGroup>
              <ModalLabel>새 비밀번호</ModalLabel>
              <ModalInput
                type="password"
                placeholder="새 비밀번호를 입력하세요."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </ModalFormGroup>

            <ModalFormGroup>
              <ModalLabel>새 비밀번호 확인</ModalLabel>
              <ModalInput
                type="password"
                placeholder="새 비밀번호를 다시 입력하세요."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </ModalFormGroup>

            <ModalButton onClick={handlePasswordChange}>
              비밀번호 변경
            </ModalButton>
            <ModalCancelButton onClick={() => setShowPasswordModal(false)}>
              취소
            </ModalCancelButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 음식 추천 시스템 선택 모달 */}
      {showRecommendationModal && (
        <RecommendationModalOverlay
          onClick={() => setShowRecommendationModal(false)}
        >
          <RecommendationModalContent onClick={(e) => e.stopPropagation()}>
            {/* 상단 텍스트 */}
            <TopSection>
              <TopTitle>오늘의 추천</TopTitle>
              <TopSubtitle>
                <RobotIcon aria-hidden="true">
                  <PiRobotFill />
                </RobotIcon>
                새로운 맛을 경험해보세요!
              </TopSubtitle>
            </TopSection>

            {/* 모달 메인 */}
            <MainSection>
              <MainTitle>어떤 유형의 음식을 원하세요?</MainTitle>
              <MainSubtitle>
                가장 적합한 음식 결정을 위해 선택해주세요.
              </MainSubtitle>

              {/* 옵션들 */}
              <OptionsList>
                <OptionCard
                  $selected={recommendationType === "SAVING"}
                  onClick={() => setRecommendationType("SAVING")}
                >
                  <OptionIcon>
                    <PiPiggyBankFill />
                  </OptionIcon>
                  <OptionContent>
                    <OptionTitle>절약형</OptionTitle>
                    <OptionDescription>
                      예산 준수, 경제적 선택 신호
                    </OptionDescription>
                  </OptionContent>
                </OptionCard>

                <OptionCard
                  $selected={recommendationType === "ADVENTURE"}
                  onClick={() => setRecommendationType("ADVENTURE")}
                >
                  <OptionIcon>
                    <FiCompass />
                  </OptionIcon>
                  <OptionContent>
                    <OptionTitle>모험형</OptionTitle>
                    <OptionDescription>
                      새로운 경험, 다양성 추구
                    </OptionDescription>
                  </OptionContent>
                </OptionCard>

                <OptionCard
                  $selected={recommendationType === "BALANCED"}
                  onClick={() => setRecommendationType("BALANCED")}
                >
                  <OptionIcon>
                    <PiScalesFill />
                  </OptionIcon>
                  <OptionContent>
                    <OptionTitle>균형형</OptionTitle>
                    <OptionDescription>
                      안전성과 탐험성의 조화
                    </OptionDescription>
                  </OptionContent>
                </OptionCard>
              </OptionsList>

              <SaveRecommendationButton
                onClick={() => {
                  // TODO: 추천 타입 변경 API 추가 필요
                  setShowRecommendationModal(false);
                  alert(
                    `${getRecommendationTypeKorean(
                      recommendationType
                    )} 유형이 저장되었습니다.`
                  );
                }}
              >
                저장하기
              </SaveRecommendationButton>
            </MainSection>
          </RecommendationModalContent>
        </RecommendationModalOverlay>
      )}
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f5f5f5;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #212121;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ProfileAvatar = styled.div<{ $large?: boolean; $small?: boolean }>`
  width: ${(props) => (props.$large ? "60px" : props.$small ? "40px" : "40px")};
  height: ${(props) =>
    props.$large ? "60px" : props.$small ? "40px" : "40px"};
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${theme.colors.primary} 0%,
    ${theme.colors.secondary} 100%
  );
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AvatarIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 28px;
    height: 28px;
  }
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

const ActionButton = styled.button<{ $outline?: boolean }>`
  padding: ${theme.spacing.md};
  background-color: ${(props) =>
    props.$outline ? "white" : theme.colors.accent};
  color: ${(props) => (props.$outline ? theme.colors.secondary : "white")};
  border: ${(props) =>
    props.$outline ? `1px solid ${theme.colors.secondary}` : "none"};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.$outline ? "#fff8f0" : "#e55a2b")};
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

const SocialIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.secondary};

  svg {
    width: 28px;
    height: 28px;
  }
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
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.md};
  background-color: #fff5f0;
  color: ${theme.colors.accent};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
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

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.lg};
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  max-width: 400px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const ModalTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #757575;
  cursor: pointer;
  padding: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    color: #424242;
    background-color: #f5f5f5;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ModalDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin: 0 0 ${theme.spacing.lg} 0;
  line-height: 1.5;
`;

const ModalFormGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const ModalLabel = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #424242;
  margin-bottom: ${theme.spacing.sm};
`;

const ModalInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  color: #212121;
  background-color: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }

  &::placeholder {
    color: #bdbdbd;
  }
`;

const ModalInputReadonly = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  color: #757575;
  background-color: #f5f5f5;
  cursor: not-allowed;
`;

const ModalButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: ${theme.spacing.sm};

  &:hover {
    background-color: #e55a2b;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ModalCancelButton = styled.button`
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

  &:hover {
    background-color: #f5f5f5;
  }

  &:active {
    transform: scale(0.98);
  }
`;

// Recommendation Modal Styles
const RecommendationModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: ${theme.spacing["3xl"]};
  z-index: 1000;
`;

const RecommendationModalContent = styled.div`
  width: 100%;
  max-width: 430px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: 0 ${theme.spacing.lg};
`;

const TopTitle = styled.h2`
  font-size: ${theme.typography.fontSize["2xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
  color: white;
  margin: 0;
`;

const TopSubtitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.base};
  color: rgba(255, 255, 255, 0.8);
`;

const RobotIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 22px;
    height: 22px;
  }
`;

const MainSection = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0;
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
  min-height: 500px;
`;

const MainTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0 0 ${theme.spacing.sm} 0;
  text-align: center;
`;

const MainSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  text-align: center;
  margin: 0 0 ${theme.spacing["2xl"]} 0;
  line-height: 1.5;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing["2xl"]};
`;

const OptionCard = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border: 2px solid
    ${(props) => (props.$selected ? theme.colors.accent : "#e0e0e0")};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${(props) =>
    props.$selected ? "rgba(255, 107, 53, 0.05)" : "white"};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${(props) =>
      props.$selected ? theme.colors.accent : "#bdbdbd"};
    background-color: ${(props) =>
      props.$selected ? "rgba(255, 107, 53, 0.05)" : "#fafafa"};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const OptionIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #fff5f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.accent};
  flex-shrink: 0;

  svg {
    width: 28px;
    height: 28px;
  }
`;

const OptionContent = styled.div`
  flex: 1;
`;

const OptionTitle = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin-bottom: ${theme.spacing.xs};
`;

const OptionDescription = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  line-height: 1.4;
`;

const SaveRecommendationButton = styled.button`
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

export default ProfilePage;
