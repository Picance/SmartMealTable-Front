import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaMapMarkerAlt,
  FaWallet,
  FaHeart,
  FaBell,
  FaPalette,
  FaSignOutAlt,
  FaTrash,
  FaChevronRight,
} from "react-icons/fa";
import { useAuthStore } from "../../store/authStore";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import "./ProfilePage.css";

interface MenuItem {
  icon: React.ReactElement;
  label: string;
  description?: string;
  onClick?: () => void;
  toggle?: boolean;
  value?: boolean;
  onChange?: (value: boolean) => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { member, clearAuth } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      clearAuth();
      navigate("/");
    }
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "정말로 계정을 삭제하시겠습니까?\n삭제된 계정은 복구할 수 없습니다."
      )
    ) {
      if (
        window.confirm(
          "모든 데이터가 영구적으로 삭제됩니다.\n계속하시겠습니까?"
        )
      ) {
        // TODO: 계정 삭제 API 호출
        clearAuth();
        navigate("/");
      }
    }
  };

  const menuSections: MenuSection[] = [
    {
      title: "계정 정보",
      items: [
        {
          icon: <FaUser />,
          label: "프로필 수정",
          description: member
            ? `${member.nickname || member.name}`
            : "닉네임 없음",
          onClick: () => navigate("/profile/edit"),
        },
        {
          icon: <FaMapMarkerAlt />,
          label: "주소 관리",
          description: "배달 주소를 관리하세요",
          onClick: () => navigate("/profile/address"),
        },
        {
          icon: <FaWallet />,
          label: "예산 설정",
          description: "월 예산을 조정하세요",
          onClick: () => navigate("/profile/budget"),
        },
        {
          icon: <FaHeart />,
          label: "식사 취향",
          description: "선호하는 음식 종류 설정",
          onClick: () => navigate("/profile/preference"),
        },
      ],
    },
    {
      title: "앱 설정",
      items: [
        {
          icon: <FaBell />,
          label: "알림 설정",
          toggle: true,
          value: notificationsEnabled,
          onChange: (value: boolean) => setNotificationsEnabled(value),
        },
        {
          icon: <FaPalette />,
          label: "다크 모드",
          toggle: true,
          value: darkMode,
          onChange: (value: boolean) => setDarkMode(value),
        },
      ],
    },
  ];

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1>프로필</h1>
      </header>

      <div className="profile-content">
        {/* 사용자 정보 카드 */}
        <Card className="user-info-card">
          <div className="user-avatar">
            <FaUser />
          </div>
          <div className="user-details">
            <h2 className="user-name">
              {member?.nickname || member?.name || "사용자"}
            </h2>
            <p className="user-email">{member?.email || ""}</p>
          </div>
        </Card>

        {/* 메뉴 섹션 */}
        {menuSections.map((section) => (
          <div key={section.title} className="menu-section">
            <h3 className="section-title">{section.title}</h3>
            <Card className="menu-card">
              {section.items.map((item, index) => (
                <React.Fragment key={item.label}>
                  {item.toggle ? (
                    <div className="menu-item">
                      <div className="menu-item-left">
                        <span className="menu-icon">{item.icon}</span>
                        <span className="menu-label">{item.label}</span>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={item.value}
                          onChange={(e) => item.onChange?.(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  ) : (
                    <div className="menu-item" onClick={item.onClick}>
                      <div className="menu-item-left">
                        <span className="menu-icon">{item.icon}</span>
                        <div className="menu-item-text">
                          <span className="menu-label">{item.label}</span>
                          {item.description && (
                            <span className="menu-description">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <FaChevronRight className="menu-arrow" />
                    </div>
                  )}
                  {index < section.items.length - 1 && (
                    <div className="menu-divider" />
                  )}
                </React.Fragment>
              ))}
            </Card>
          </div>
        ))}

        {/* 액션 버튼 */}
        <div className="action-buttons">
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="logout-button"
          >
            <FaSignOutAlt /> 로그아웃
          </Button>
          <Button
            variant="secondary"
            onClick={handleDeleteAccount}
            className="delete-button"
          >
            <FaTrash /> 계정 삭제
          </Button>
        </div>

        {/* 앱 정보 */}
        <div className="app-info">
          <p>알뜰식탁 v1.0.0</p>
          <p>© 2024 SmartMealTable. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
