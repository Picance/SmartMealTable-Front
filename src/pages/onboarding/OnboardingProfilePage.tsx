import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiX } from "react-icons/fi";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { onboardingService } from "../../services/onboarding.service";
import type { Group } from "../../types/api";
import "./OnboardingProfilePage.css";

const OnboardingProfilePage = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [groupSearchKeyword, setGroupSearchKeyword] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showGroupResults, setShowGroupResults] = useState(false);
  const [isSearchingGroups, setIsSearchingGroups] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 닉네임 유효성 검사
  const validateNickname = (value: string): boolean => {
    if (!value.trim()) {
      setNicknameError("닉네임을 입력해주세요.");
      return false;
    }
    if (value.length < 2) {
      setNicknameError("닉네임은 최소 2자 이상이어야 합니다.");
      return false;
    }
    if (value.length > 50) {
      setNicknameError("닉네임은 최대 50자까지 입력 가능합니다.");
      return false;
    }
    setNicknameError("");
    return true;
  };

  // 그룹 검색
  const searchGroups = async (keyword: string) => {
    if (!keyword.trim()) {
      setGroups([]);
      setShowGroupResults(false);
      return;
    }

    setIsSearchingGroups(true);
    try {
      const response = await onboardingService.searchGroups(keyword);
      if (response.result === "SUCCESS" && response.data) {
        setGroups(response.data.content);
        setShowGroupResults(true);
      } else {
        setGroups([]);
      }
    } catch (err) {
      console.error("그룹 검색 실패:", err);
      setGroups([]);
    } finally {
      setIsSearchingGroups(false);
    }
  };

  // 그룹 검색어 변경 (디바운싱)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchGroups(groupSearchKeyword);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [groupSearchKeyword]);

  // 그룹 선택
  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    setGroupSearchKeyword("");
    setShowGroupResults(false);
  };

  // 그룹 선택 해제
  const handleRemoveGroup = () => {
    setSelectedGroup(null);
  };

  // 다음 단계로
  const handleNext = async () => {
    setError("");

    // 닉네임 검증
    if (!validateNickname(nickname)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await onboardingService.saveProfile({
        nickname,
        groupId: selectedGroup?.groupId,
      });

      if (response.result === "SUCCESS") {
        navigate("/onboarding/address");
      } else {
        setError(response.error?.message || "프로필 저장에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("프로필 저장 실패:", err);
      setError(
        err.response?.data?.error?.message ||
          "프로필 저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="onboarding-profile-page">
      <div className="onboarding-profile-header">
        <button
          className="onboarding-profile-back-button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
        >
          <FiArrowLeft />
        </button>
        <h1>프로필 설정</h1>
      </div>

      <div className="onboarding-profile-content">
        <div className="onboarding-profile-intro">
          <h2>환영합니다! 👋</h2>
          <p>알뜰식탁에서 사용할 닉네임과 소속을 설정해주세요.</p>
        </div>

        <form
          className="onboarding-profile-form"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="onboarding-profile-form-section">
            <label className="onboarding-profile-form-label">닉네임 *</label>
            <Input
              type="text"
              value={nickname}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setNickname(e.target.value);
                validateNickname(e.target.value);
              }}
              placeholder="닉네임을 입력하세요 (2-50자)"
              error={nicknameError}
              maxLength={50}
            />
          </div>

          <div className="onboarding-profile-form-section">
            <label className="onboarding-profile-form-label">
              소속 그룹 (선택)
            </label>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#666",
                marginBottom: "0.5rem",
              }}
            >
              학교나 직장 등의 소속을 검색하여 선택할 수 있습니다.
            </p>

            {!selectedGroup ? (
              <div className="onboarding-profile-search-container">
                <Input
                  type="text"
                  value={groupSearchKeyword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setGroupSearchKeyword(e.target.value)
                  }
                  placeholder="소속 그룹을 검색하세요"
                  onFocus={() => {
                    if (groups.length > 0) {
                      setShowGroupResults(true);
                    }
                  }}
                />

                {showGroupResults && (
                  <div className="onboarding-profile-search-results">
                    {isSearchingGroups ? (
                      <div className="onboarding-profile-loading">
                        <div className="onboarding-profile-loading-spinner" />
                      </div>
                    ) : groups.length > 0 ? (
                      groups.map((group) => (
                        <div
                          key={group.groupId}
                          className="onboarding-profile-search-result-item"
                          onClick={() => handleSelectGroup(group)}
                        >
                          <div className="onboarding-profile-search-result-name">
                            {group.groupName}
                          </div>
                          <div className="onboarding-profile-search-result-description">
                            {group.address}
                          </div>
                          <div className="onboarding-profile-search-result-members">
                            멤버 {group.memberCount}명
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="onboarding-profile-search-empty">
                        검색 결과가 없습니다.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="onboarding-profile-selected-group">
                <div className="onboarding-profile-selected-group-info">
                  <div className="onboarding-profile-selected-group-name">
                    {selectedGroup.groupName}
                  </div>
                  <div className="onboarding-profile-selected-group-description">
                    {selectedGroup.address}
                  </div>
                </div>
                <button
                  type="button"
                  className="onboarding-profile-selected-group-remove"
                  onClick={handleRemoveGroup}
                  aria-label="그룹 선택 해제"
                >
                  <FiX />
                </button>
              </div>
            )}
          </div>

          {error && <div className="onboarding-profile-error">{error}</div>}

          <div className="onboarding-profile-actions">
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleNext}
              disabled={!nickname.trim() || !!nicknameError || isSubmitting}
              loading={isSubmitting}
            >
              다음
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingProfilePage;
