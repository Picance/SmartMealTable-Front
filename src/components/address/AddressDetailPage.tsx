import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { FiBell, FiChevronLeft } from "react-icons/fi";

const AddressDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    roadAddress?: string;
    jibunAddress?: string;
    lat?: number;
    lng?: number;
  };

  // 주소 정보
  const [nickname, setNickname] = useState("");
  const [addressType, setAddressType] = useState<
    "집" | "직장" | "학교" | "기타"
  >("집");
  const [roadAddress] = useState(state?.roadAddress || "");
  const [jibunAddress] = useState(state?.jibunAddress || "");
  const [detailAddress, setDetailAddress] = useState("");

  const handleSave = () => {
    if (!nickname.trim()) {
      alert("주소 별칭을 입력해주세요.");
      return;
    }
    // TODO: API 호출
    alert("주소가 저장되었습니다.");
    navigate("/address/management");
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </BackButton>
        <Title>주소 검색</Title>
        <HeaderIcons>
          <NotificationButton>
            <FiBell />
          </NotificationButton>
          <ProfileAvatar />
        </HeaderIcons>
      </Header>

      <Content>
        {/* 주소 별칭 */}
        <FormGroup>
          <Label>주소 별칭</Label>
          <Input
            type="text"
            placeholder="친구집"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </FormGroup>

        {/* 주소 분류 */}
        <FormGroup>
          <Label>주소 분류</Label>
          <TypeButtonGroup>
            <TypeButton
              $active={addressType === "집"}
              onClick={() => setAddressType("집")}
            >
              집
            </TypeButton>
            <TypeButton
              $active={addressType === "직장"}
              onClick={() => setAddressType("직장")}
            >
              직장
            </TypeButton>
            <TypeButton
              $active={addressType === "학교"}
              onClick={() => setAddressType("학교")}
            >
              학교
            </TypeButton>
            <TypeButton
              $active={addressType === "기타"}
              onClick={() => setAddressType("기타")}
            >
              기타
            </TypeButton>
          </TypeButtonGroup>
        </FormGroup>

        {/* 도로명 주소 */}
        <FormGroup>
          <Label>도로명 주소</Label>
          <AddressRow>
            <AddressInput value={roadAddress} readOnly />
            <ModifyButton>수정</ModifyButton>
          </AddressRow>
        </FormGroup>

        {/* 지번 주소 */}
        <FormGroup>
          <Label>지번 주소</Label>
          <AddressInput value={jibunAddress} readOnly />
        </FormGroup>

        {/* 상세 주소 */}
        <FormGroup>
          <Label>상세 주소</Label>
          <Textarea
            placeholder="아파트명 000호"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
            rows={3}
          />
        </FormGroup>

        {/* 저장 버튼 */}
        <SaveButton onClick={handleSave}>저장하기</SaveButton>
      </Content>
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

const HeaderIcons = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const NotificationButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const ProfileAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${theme.colors.primary} 0%,
    ${theme.colors.secondary} 100%
  );
  cursor: pointer;
`;

const Content = styled.div`
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Label = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: #212121;
  margin-bottom: ${theme.spacing.sm};
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  color: #212121;
  background-color: white;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }

  &::placeholder {
    color: #bdbdbd;
  }
`;

const TypeButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.sm};
`;

const TypeButton = styled.button<{ $active?: boolean }>`
  padding: ${theme.spacing.md};
  background-color: ${(props) =>
    props.$active ? theme.colors.accent : "white"};
  color: ${(props) => (props.$active ? "white" : "#424242")};
  border: 1px solid
    ${(props) => (props.$active ? theme.colors.accent : "#e0e0e0")};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
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

const AddressRow = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  align-items: center;
`;

const AddressInput = styled.input`
  flex: 1;
  padding: ${theme.spacing.md};
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  color: #757575;
  background-color: #f5f5f5;
  cursor: not-allowed;
`;

const ModifyButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background-color: ${theme.colors.secondary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: #ff9f3a;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  color: #212121;
  background-color: white;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }

  &::placeholder {
    color: #bdbdbd;
  }
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

export default AddressDetailPage;
