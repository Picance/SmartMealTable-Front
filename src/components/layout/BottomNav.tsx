import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { FiCompass, FiFileText, FiHeart, FiHome, FiUser } from "react-icons/fi";
import { theme } from "../../styles/theme";

interface BottomNavProps {
  activeTab?: "home" | "spending" | "recommendation" | "favorites" | "profile";
}

const BottomNav = ({ activeTab }: BottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로를 기반으로 활성 탭 결정
  const getActiveTab = () => {
    if (activeTab) return activeTab;

    const path = location.pathname;
    if (path.startsWith("/home")) return "home";
    if (path.startsWith("/spending")) return "spending";
    if (path.startsWith("/recommendation")) return "recommendation";
    if (path.startsWith("/favorites")) return "favorites";
    if (
      path.startsWith("/profile") ||
      path.startsWith("/settings") ||
      path.startsWith("/affiliation") ||
      path.startsWith("/address")
    )
      return "profile";

    return "home";
  };

  const currentTab = getActiveTab();

  return (
    <Nav>
      <NavItem
        onClick={() => navigate("/home")}
        $active={currentTab === "home"}
      >
        <NavIcon>
          <FiHome />
        </NavIcon>
        <NavLabel $active={currentTab === "home"}>홈</NavLabel>
      </NavItem>
      <NavItem
        onClick={() => navigate("/spending")}
        $active={currentTab === "spending"}
      >
        <NavIcon>
          <FiFileText />
        </NavIcon>
        <NavLabel $active={currentTab === "spending"}>지출 내역</NavLabel>
      </NavItem>
      <NavItem
        onClick={() => navigate("/recommendation")}
        $active={currentTab === "recommendation"}
      >
        <NavIcon>
          <FiCompass />
        </NavIcon>
        <NavLabel $active={currentTab === "recommendation"}>음식 추천</NavLabel>
      </NavItem>
      <NavItem
        onClick={() => navigate("/favorites")}
        $active={currentTab === "favorites"}
      >
        <NavIcon>
          <FiHeart />
        </NavIcon>
        <NavLabel $active={currentTab === "favorites"}>즐겨 찾는 가게</NavLabel>
      </NavItem>
      <NavItem
        onClick={() => navigate("/profile")}
        $active={currentTab === "profile"}
      >
        <NavIcon>
          <FiUser />
        </NavIcon>
        <NavLabel $active={currentTab === "profile"}>프로필</NavLabel>
      </NavItem>
    </Nav>
  );
};

// Styled Components
const Nav = styled.nav`
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

  /* 데스크톱에서 max-width 제약 */
  @media (min-width: 431px) {
    max-width: 430px;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const NavItem = styled.div<{ $active?: boolean }>`
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

  svg {
    width: 1.4rem;
    height: 1.4rem;
  }
`;

const NavLabel = styled.span<{ $active?: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  color: ${(props) => (props.$active ? theme.colors.accent : "#757575")};
  font-weight: ${(props) =>
    props.$active
      ? theme.typography.fontWeight.semibold
      : theme.typography.fontWeight.normal};
`;

export default BottomNav;
