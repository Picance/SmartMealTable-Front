import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { FiChevronLeft, FiX } from "react-icons/fi";

// 임시 학교 데이터
const SCHOOLS = [
  {
    id: 1,
    address: "서울특별시 공릉동 어쩌구",
    name: "서울과학기술대학교",
    type: "대학교(4년제)",
  },
  {
    id: 2,
    address: "서울특별시 화랑로 어쩌구",
    name: "삼육대학교",
    type: "대학교(4년제)",
  },
  {
    id: 3,
    address: "서울특별시 노원로 어쩌구",
    name: "서울여자대학교",
    type: "대학교(4년제)",
  },
  {
    id: 4,
    address: "서울특별시 화랑미석로 어쩌구",
    name: "광운대학교",
    type: "대학교(4년제)",
  },
  {
    id: 5,
    address: "서울특별시 성북구 어쩌구",
    name: "고려대학교",
    type: "대학교(4년제)",
  },
];

const AffiliationPage = () => {
  const navigate = useNavigate();

  // 소속 집단
  const [affiliationType, setAffiliationType] = useState<
    "학생" | "직장인" | "해당없음"
  >("학생");

  // 학교 검색
  const [schoolSearchQuery, setSchoolSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] =
    useState<string>("서울과학기술대학교");
  const [selectedSchoolAddress, setSelectedSchoolAddress] =
    useState<string>("서울특별시 노원구 공릉동 어쩌구");

  // 모달
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof SCHOOLS>([]);

  // 학교 검색 (페이지 내)
  const handleSchoolSearch = () => {
    if (schoolSearchQuery.trim()) {
      setShowSchoolModal(true);
      setModalSearchQuery(schoolSearchQuery);
      // 검색 수행
      const results = SCHOOLS.filter((school) =>
        school.name.includes(schoolSearchQuery)
      );
      setSearchResults(results);
    }
  };

  // 모달 내 검색
  const handleModalSearch = () => {
    const results = SCHOOLS.filter((school) =>
      school.name.includes(modalSearchQuery)
    );
    setSearchResults(results);
  };

  // 학교 선택
  const handleSelectSchool = (school: (typeof SCHOOLS)[0]) => {
    setSelectedSchool(school.name);
    setSelectedSchoolAddress(school.address);
    setSchoolSearchQuery(school.name);
    setShowSchoolModal(false);
  };

  // 저장
  const handleSave = () => {
    // TODO: API 호출
    alert("소속 정보가 저장되었습니다.");
    navigate(-1);
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
              active={affiliationType === "학생"}
              onClick={() => setAffiliationType("학생")}
            >
              학생
            </TypeButton>
            <TypeButton
              active={affiliationType === "직장인"}
              onClick={() => setAffiliationType("직장인")}
            >
              직장인
            </TypeButton>
            <TypeButton
              active={affiliationType === "해당없음"}
              onClick={() => setAffiliationType("해당없음")}
            >
              해당없음
            </TypeButton>
          </ButtonGroup>
        </Section>

        {/* 소속 학교 검색 */}
        {affiliationType === "학생" && (
          <Section>
            <SectionTitle>소속 학교 검색</SectionTitle>
            <SearchRow>
              <SearchInput
                type="text"
                placeholder="서울과학기술대학교"
                value={schoolSearchQuery}
                onChange={(e) => setSchoolSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSchoolSearch();
                  }
                }}
              />
              <SearchButton onClick={handleSchoolSearch}>검색</SearchButton>
            </SearchRow>
            {selectedSchool && (
              <SelectedSchoolInfo>{selectedSchoolAddress}</SelectedSchoolInfo>
            )}
          </Section>
        )}

        {/* 저장 버튼 */}
        <SaveButton onClick={handleSave}>저장</SaveButton>
      </Content>

      {/* 학교 찾기 모달 */}
      {showSchoolModal && (
        <ModalOverlay onClick={() => setShowSchoolModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <BackButtonModal onClick={() => setShowSchoolModal(false)}>
                <FiChevronLeft />
              </BackButtonModal>
              <ModalTitle>학교 찾기</ModalTitle>
              <CloseButton onClick={() => setShowSchoolModal(false)}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            <ModalSearchRow>
              <ModalSearchInput
                type="text"
                placeholder="서울과학기술대학교"
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleModalSearch();
                  }
                }}
              />
              <ModalSearchButton onClick={handleModalSearch}>
                검색
              </ModalSearchButton>
            </ModalSearchRow>

            <SchoolList>
              {searchResults.map((school) => (
                <SchoolItem key={school.id}>
                  <SchoolInfo>
                    <SchoolAddress>지번 주소 : {school.address}</SchoolAddress>
                    <SchoolName>학교명 : {school.name}</SchoolName>
                    <SchoolType>학교 유형 : {school.type}</SchoolType>
                  </SchoolInfo>
                  <SelectButton onClick={() => handleSelectSchool(school)}>
                    선택
                  </SelectButton>
                </SchoolItem>
              ))}
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

const TypeButton = styled.button<{ active?: boolean }>`
  padding: ${theme.spacing.md};
  background-color: ${(props) =>
    props.active ? theme.colors.accent : "white"};
  color: ${(props) => (props.active ? "white" : "#424242")};
  border: 1px solid
    ${(props) => (props.active ? theme.colors.accent : "#e0e0e0")};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.active ? "#e55a2b" : "#f5f5f5")};
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
