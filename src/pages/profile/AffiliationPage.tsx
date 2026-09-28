import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { FiChevronLeft, FiX } from "react-icons/fi";
import { onboardingService } from "../../services/onboarding.service";
import { getMyProfile, updateProfile } from "../../services/profile.service";
import type { Group } from "../../types/api";

// 소속 변경 API는 groupId가 필수라서 '해당없음'은 선택지에 두지 않는다
type AffiliationType = "학생" | "직장인";

const GROUP_TYPE: Record<AffiliationType, Group["type"]> = {
  학생: "UNIVERSITY",
  직장인: "COMPANY",
};

const GROUP_TYPE_LABEL: Record<Group["type"], string> = {
  UNIVERSITY: "대학교",
  COMPANY: "회사",
  OTHER: "기타",
};

const AffiliationPage = () => {
  const navigate = useNavigate();

  // 소속 집단
  const [affiliationType, setAffiliationType] =
    useState<AffiliationType>("학생");
  const targetLabel = affiliationType === "학생" ? "학교" : "회사";

  // 선택한 소속
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 모달
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Group[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 현재 소속 불러오기
  useEffect(() => {
    const fetchCurrentGroup = async () => {
      try {
        const response = await getMyProfile();
        const group = response.data.group;
        if (!group) return;

        const type = group.type as Group["type"];
        setSelectedGroup({ ...group, type, address: "" });
        setSearchQuery(group.name);
        if (type === "COMPANY") {
          setAffiliationType("직장인");
        }
      } catch (error) {
        alert("소속 정보를 불러오지 못했습니다.");
      }
    };

    fetchCurrentGroup();
  }, []);

  const searchGroups = async (keyword: string) => {
    if (!keyword.trim()) return;

    setIsSearching(true);
    try {
      const response = await onboardingService.searchGroups(
        keyword.trim(),
        GROUP_TYPE[affiliationType]
      );
      setSearchResults(response.data?.content ?? []);
    } catch (error) {
      setSearchResults([]);
      alert(`${targetLabel} 검색에 실패했습니다.`);
    } finally {
      setIsSearching(false);
    }
  };

  // 페이지 내 검색
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setModalSearchQuery(searchQuery);
    setShowSearchModal(true);
    searchGroups(searchQuery);
  };

  // 유형을 바꾸면 이전 선택은 비운다
  const handleTypeChange = (type: AffiliationType) => {
    if (type === affiliationType) return;

    setAffiliationType(type);
    setSelectedGroup(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  // 소속 선택
  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    setSearchQuery(group.name);
    setShowSearchModal(false);
  };

  // 저장
  const handleSave = async () => {
    if (!selectedGroup) {
      alert(`소속 ${targetLabel}를 검색해서 선택해주세요.`);
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(selectedGroup.groupId);
      alert("소속 정보가 저장되었습니다.");
      navigate(-1);
    } catch (error: any) {
      alert(
        error.response?.data?.error?.message ||
          "소속 정보를 저장하지 못했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </BackButton>
        <Title>소속 정보 조회/수정</Title>
        <Spacer />
      </Header>

      <Content>
        {/* 소속 집단 정보 */}
        <Section>
          <SectionTitle>소속 집단 정보</SectionTitle>
          <ButtonGroup>
            <TypeButton
              $active={affiliationType === "학생"}
              onClick={() => handleTypeChange("학생")}
            >
              학생
            </TypeButton>
            <TypeButton
              $active={affiliationType === "직장인"}
              onClick={() => handleTypeChange("직장인")}
            >
              직장인
            </TypeButton>
          </ButtonGroup>
        </Section>

        {/* 소속 학교/회사 검색 */}
        <Section>
          <SectionTitle>소속 {targetLabel} 검색</SectionTitle>
          <SearchRow>
            <SearchInput
              type="text"
              placeholder={
                affiliationType === "학생" ? "서울과학기술대학교" : "회사명"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <SearchButton onClick={handleSearch}>검색</SearchButton>
          </SearchRow>
          {selectedGroup && (
            <SelectedSchoolInfo>
              선택한 소속: {selectedGroup.name}
              {selectedGroup.address && ` (${selectedGroup.address})`}
            </SelectedSchoolInfo>
          )}
        </Section>

        {/* 저장 버튼 */}
        <SaveButton onClick={handleSave} disabled={isSaving}>
          {isSaving ? "저장 중..." : "저장"}
        </SaveButton>
      </Content>

      {/* 학교/회사 찾기 모달 */}
      {showSearchModal && (
        <ModalOverlay onClick={() => setShowSearchModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <BackButtonModal onClick={() => setShowSearchModal(false)}>
                <FiChevronLeft />
              </BackButtonModal>
              <ModalTitle>{targetLabel} 찾기</ModalTitle>
              <CloseButton onClick={() => setShowSearchModal(false)}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            <ModalSearchRow>
              <ModalSearchInput
                type="text"
                placeholder={
                  affiliationType === "학생" ? "서울과학기술대학교" : "회사명"
                }
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    searchGroups(modalSearchQuery);
                  }
                }}
              />
              <ModalSearchButton
                onClick={() => searchGroups(modalSearchQuery)}
              >
                검색
              </ModalSearchButton>
            </ModalSearchRow>

            <SchoolList>
              {isSearching ? (
                <EmptyResult>검색 중...</EmptyResult>
              ) : searchResults.length === 0 ? (
                <EmptyResult>검색 결과가 없습니다.</EmptyResult>
              ) : (
                searchResults.map((group) => (
                  <SchoolItem key={group.groupId}>
                    <SchoolInfo>
                      {group.address && (
                        <SchoolAddress>주소 : {group.address}</SchoolAddress>
                      )}
                      <SchoolName>이름 : {group.name}</SchoolName>
                      <SchoolType>
                        유형 : {GROUP_TYPE_LABEL[group.type] ?? group.type}
                      </SchoolType>
                    </SchoolInfo>
                    <SelectButton onClick={() => handleSelectGroup(group)}>
                      선택
                    </SelectButton>
                  </SchoolItem>
                ))
              )}
            </SchoolList>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: #fafafa;
`;

const Header = styled.header`
  background-color: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e0e0e0;
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

const Content = styled.div`
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
`;

const Section = styled.section`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
  margin: 0 0 ${theme.spacing.md} 0;
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
`;

const TypeButton = styled.button<{ $active?: boolean }>`
  padding: ${theme.spacing.md};
  background-color: ${(props) =>
    props.$active ? theme.colors.accent : "white"};
  color: ${(props) => (props.$active ? "white" : "#424242")};
  border: 1px solid
    ${(props) => (props.$active ? theme.colors.accent : "#e0e0e0")};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.$active ? "#e55a2b" : "#f5f5f5")};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SearchRow = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${theme.spacing.md};
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  color: #212121;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }

  &::placeholder {
    color: #bdbdbd;
  }
`;

const SearchButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background-color: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: #e55a2b;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SelectedSchoolInfo = styled.div`
  background-color: white;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  border: 1px solid #e0e0e0;
`;

const SaveButton = styled.button`
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
  margin-top: ${theme.spacing["3xl"]};

  &:hover {
    background-color: #e55a2b;
  }

  &:active {
    transform: scale(0.98);
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
`;

const ModalContent = styled.div`
  background-color: white;
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  background-color: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e0e0e0;
`;

const BackButtonModal = styled.button`
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

const ModalTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
  flex: 1;
  text-align: center;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: ${theme.typography.fontSize["2xl"]};
  color: #757575;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xs};

  &:hover {
    color: #424242;
  }
`;

const ModalSearchRow = styled.div`
  padding: ${theme.spacing.lg};
  display: flex;
  gap: ${theme.spacing.sm};
  background-color: white;
  border-bottom: 1px solid #f5f5f5;
`;

const ModalSearchInput = styled.input`
  flex: 1;
  padding: ${theme.spacing.md};
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  color: #212121;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }

  &::placeholder {
    color: #bdbdbd;
  }
`;

const ModalSearchButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background-color: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: #e55a2b;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SchoolList = styled.div`
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const EmptyResult = styled.p`
  margin: 0;
  padding: ${theme.spacing.xl} 0;
  text-align: center;
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
`;

const SchoolItem = styled.div`
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${theme.spacing.md};
`;

const SchoolInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const SchoolAddress = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
`;

const SchoolName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
`;

const SchoolType = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
`;

const SelectButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background-color: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: #e55a2b;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default AffiliationPage;
