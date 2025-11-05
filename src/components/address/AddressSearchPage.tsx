import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

type AddressType = "home" | "work" | "school" | "etc";

const AddressSearchPage = () => {
  const navigate = useNavigate();
  const [addressAlias, setAddressAlias] = useState("친구집");
  const [addressType, setAddressType] = useState<AddressType>("home");
  const [roadAddress, setRoadAddress] = useState("서울 특별시 공릉로");
  const [jibunAddress] = useState("서울 특별시 노원구 공릉동");
  const [detailAddress, setDetailAddress] = useState("아파트명 000호");

  const handleSave = () => {
    // TODO: 주소 저장 로직
    console.log({
      addressAlias,
      addressType,
      roadAddress,
      jibunAddress,
      detailAddress,
    });
    navigate(-1);
  };

  const handleModifyAddress = () => {
    // TODO: 주소 수정 로직 (주소 검색 모달 열기)
    console.log("Modify address");
  };

  return (
    <PageContainer>
      <ContentContainer>
        <Header>
          <Title>주소 검색</Title>
          <ProfileSection>
            <NotificationIcon>🔔</NotificationIcon>
            <ProfileImage>👤</ProfileImage>
          </ProfileSection>
        </Header>

        <Form>
          <Section>
            <Label>주소 별칭</Label>
            <Input
              type="text"
              value={addressAlias}
              onChange={(e) => setAddressAlias(e.target.value)}
              placeholder="친구집"
            />
          </Section>

          <Section>
            <Label>주소 분류</Label>
            <ButtonGroup>
              <TypeButton
                type="button"
                $selected={addressType === "home"}
                onClick={() => setAddressType("home")}
              >
                집
              </TypeButton>
              <TypeButton
                type="button"
                $selected={addressType === "work"}
                onClick={() => setAddressType("work")}
              >
                직장
              </TypeButton>
              <TypeButton
                type="button"
                $selected={addressType === "school"}
                onClick={() => setAddressType("school")}
              >
                학교
              </TypeButton>
              <TypeButton
                type="button"
                $selected={addressType === "etc"}
                onClick={() => setAddressType("etc")}
              >
                기타
              </TypeButton>
            </ButtonGroup>
          </Section>

          <Section>
            <Label>도로명 주소</Label>
            <AddressInputWrapper>
              <AddressInput
                type="text"
                value={roadAddress}
                onChange={(e) => setRoadAddress(e.target.value)}
                placeholder="서울 특별시 공릉로"
                readOnly
              />
              <ModifyButton type="button" onClick={handleModifyAddress}>
                수정
              </ModifyButton>
            </AddressInputWrapper>
          </Section>

          <Section>
            <Label>지번 주소</Label>
            <Input
              type="text"
              value={jibunAddress}
              placeholder="서울 특별시 노원구 공릉동"
              readOnly
            />
          </Section>

          <Section>
            <Label>상세 주소</Label>
            <TextArea
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="아파트명 000호"
              rows={4}
            />
          </Section>

          <SaveButton type="button" onClick={handleSave}>
            저장하기
          </SaveButton>
        </Form>
      </ContentContainer>
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
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  width: 100%;
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 390px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NotificationIcon = styled.div`
  font-size: 1.25rem;
  cursor: pointer;
`;

const ProfileImage = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #000000;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  color: #000000;
  background-color: #ffffff;

  &::placeholder {
    color: #999999;
  }

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }

  &:read-only {
    background-color: #f5f5f5;
  }
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
`;

const TypeButton = styled.button<{ $selected: boolean }>`
  height: 44px;
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

const AddressInputWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const AddressInput = styled(Input)`
  flex: 1;
`;

const ModifyButton = styled.button`
  height: 48px;
  padding: 0 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: #ffa726;
  color: #ffffff;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background-color: #fb8c00;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  color: #000000;
  background-color: #ffffff;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;

  &::placeholder {
    color: #999999;
  }

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
`;

const SaveButton = styled.button`
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

  &:hover {
    background-color: #ff5722;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default AddressSearchPage;
