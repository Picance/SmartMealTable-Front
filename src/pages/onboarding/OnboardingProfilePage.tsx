import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { onboardingService } from "../../services/onboarding.service";
import type { Group } from "../../types/api";

const OnboardingProfilePage = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [groupSearchKeyword, setGroupSearchKeyword] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
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
      return;
    }

    setIsSearchingGroups(true);
    try {
      const response = await onboardingService.searchGroups(keyword);
      if (response.result === "SUCCESS" && response.data) {
        setGroups(response.data.content);
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

  // 소속 진단 정보 타입
  type AffiliationType = "student" | "worker" | "none";
  const [affiliationType, setAffiliationType] =
    useState<AffiliationType | null>(null);
  const [showSchoolModal, setShowSchoolModal] = useState(false);

  return (
    <PageContainer>
      <ContentContainer>
        <Header>
          <Title>신규 회원 프로필 등록</Title>
        </Header>

        <Form onSubmit={(e) => e.preventDefault()}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Section>
            <Label>닉네임</Label>
            <StyledInput
              type="text"
              value={nickname}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setNickname(e.target.value);
                validateNickname(e.target.value);
              }}
              placeholder="대학교 10학년 백수"
              hasError={!!nicknameError}
              maxLength={50}
            />
            {nicknameError && <ErrorText>{nicknameError}</ErrorText>}
          </Section>

          <Section>
            <Label>소속 진단 정보</Label>
            <ButtonGroup>
              <SelectButton
                type="button"
                $selected={affiliationType === "student"}
                onClick={() => setAffiliationType("student")}
              >
                학생
              </SelectButton>
              <SelectButton
                type="button"
                $selected={affiliationType === "worker"}
                onClick={() => setAffiliationType("worker")}
              >
                직장인
              </SelectButton>
              <SelectButton
                type="button"
                $selected={affiliationType === "none"}
                onClick={() => setAffiliationType("none")}
              >
                해당없음
              </SelectButton>
            </ButtonGroup>
          </Section>

          <Section>
            <Label>소속 학교 검색</Label>
            <SearchContainer>
              <SearchInputWrapper>
                <SearchInput
                  type="text"
                  value={groupSearchKeyword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setGroupSearchKeyword(e.target.value)
                  }
                  placeholder="서울과학기술대학교"
                />
                <SearchButton
                  type="button"
                  onClick={() => setShowSchoolModal(true)}
                >
                  검색
                </SearchButton>
              </SearchInputWrapper>
              {selectedGroup && (
                <SelectedSchool>{selectedGroup.groupName}</SelectedSchool>
              )}
            </SearchContainer>
          </Section>

          <SubmitButton
            type="button"
            onClick={handleNext}
            disabled={!nickname.trim() || !!nicknameError || isSubmitting}
          >
            {isSubmitting ? "처리 중..." : "다음"}
          </SubmitButton>
        </Form>
      </ContentContainer>

      {/* 학교 찾기 모달 */}
      {showSchoolModal && (
        <Modal onClick={() => setShowSchoolModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>학교 찾기</ModalTitle>
              <CloseButton onClick={() => setShowSchoolModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <ModalSearchWrapper>
                <ModalSearchInput
                  type="text"
                  value={groupSearchKeyword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setGroupSearchKeyword(e.target.value)
                  }
                  placeholder="서울과학기술대학교"
                  autoFocus
                />
                <ModalSearchButton type="button">검색</ModalSearchButton>
              </ModalSearchWrapper>

              <ResultsList>
                {isSearchingGroups ? (
                  <LoadingText>검색 중...</LoadingText>
                ) : groups.length > 0 ? (
                  groups.map((group) => (
                    <ResultItem key={group.groupId}>
                      <ResultInfo>
                        <ResultAddress>
                          지번 주소 : {group.address}
                        </ResultAddress>
                        <ResultName>학교명 : {group.groupName}</ResultName>
                        <ResultType>학교 유형 : 대학교(4년제)</ResultType>
                      </ResultInfo>
                      <SelectSchoolButton
                        type="button"
                        onClick={() => {
                          handleSelectGroup(group);
                          setShowSchoolModal(false);
                        }}
                      >
                        선택
                      </SelectSchoolButton>
                    </ResultItem>
                  ))
                ) : groupSearchKeyword ? (
                  <EmptyText>검색 결과가 없습니다</EmptyText>
                ) : null}
              </ResultsList>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1.5rem;
  background-color: #ffffff;
  width: 100%;
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 390px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  padding: 1rem 0;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #000000;
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  border: 1px solid ${(props) => (props.hasError ? "#ff4444" : "#e0e0e0")};
  border-radius: 8px;
  font-size: 1rem;
  color: #000000;
  background-color: #ffffff;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: #999999;
  }

  &:focus {
    outline: none;
    border-color: ${(props) => (props.hasError ? "#ff4444" : "#ff6b35")};
  }
`;

const ErrorText = styled.p`
  font-size: 0.75rem;
  color: #ff4444;
  margin: 0;
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: #ffebee;
  border-radius: 8px;
  color: #c62828;
  font-size: 0.875rem;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
`;

const SelectButton = styled.button<{ $selected: boolean }>`
  height: 48px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${(props) => (props.$selected ? "#ff6b35" : "#ffffff")};
  color: ${(props) => (props.$selected ? "#ffffff" : "#000000")};
  border: 1px solid ${(props) => (props.$selected ? "#ff6b35" : "#e0e0e0")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff6b35;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SearchInput = styled.input`
  flex: 1;
  height: 48px;
  padding: 0 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  color: #000000;

  &::placeholder {
    color: #999999;
  }

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
`;

const SearchButton = styled.button`
  width: 80px;
  height: 48px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: #ff6b35;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ff5722;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SelectedSchool = styled.div`
  padding: 0.75rem 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #666666;
`;

const SubmitButton = styled.button`
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
  margin-top: 1rem;

  &:hover:not(:disabled) {
    background-color: #ff5722;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    background-color: #e0e0e0;
    color: #999999;
    cursor: not-allowed;
  }
`;

// Modal Styles
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 390px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  font-size: 1.5rem;
  color: #666666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ModalSearchWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ModalSearchInput = styled.input`
  flex: 1;
  height: 48px;
  padding: 0 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  color: #000000;

  &::placeholder {
    color: #999999;
  }

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
`;

const ModalSearchButton = styled.button`
  width: 80px;
  height: 48px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: #ff6b35;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ff5722;
  }
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ResultItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  gap: 1rem;
`;

const ResultInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ResultAddress = styled.p`
  font-size: 0.75rem;
  color: #666666;
  margin: 0;
`;

const ResultName = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
`;

const ResultType = styled.p`
  font-size: 0.75rem;
  color: #666666;
  margin: 0;
`;

const SelectSchoolButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: #ff6b35;
  color: white;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ff5722;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const LoadingText = styled.p`
  text-align: center;
  color: #666666;
  padding: 2rem;
`;

const EmptyText = styled.p`
  text-align: center;
  color: #666666;
  padding: 2rem;
`;

export default OnboardingProfilePage;
