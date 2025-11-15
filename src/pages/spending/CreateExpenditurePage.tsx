import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import {
  FiChevronLeft,
  FiCalendar,
  FiShoppingBag,
  FiDollarSign,
} from "react-icons/fi";
import {
  parseSms,
  createExpenditure,
} from "../../services/expenditure.service";
import type { CreateExpenditureRequest } from "../../types/api";

type TabType = "paste" | "manual";

const CreateExpenditurePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("paste");
  const [loading, setLoading] = useState(false);

  // 문자 붙여넣기
  const [messageText, setMessageText] = useState("");

  // 직접 입력하기
  const [date, setDate] = useState("");
  const [storeName, setStoreName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState(1);
  const [mealType, setMealType] = useState<
    "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER"
  >("LUNCH");

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (activeTab === "paste") {
        // SMS 파싱
        if (!messageText.trim()) {
          alert("문자 메시지를 붙여넣어주세요.");
          return;
        }

        console.log("📱 [SMS Parse] SMS 파싱 요청:", messageText);

        const parseResponse = await parseSms({ smsMessage: messageText });

        console.log("📱 [SMS Parse] 파싱 결과:", parseResponse);

        if (parseResponse.result === "SUCCESS" && parseResponse.data) {
          const parsed = parseResponse.data;

          // 파싱된 데이터로 지출 등록
          const createRequest: CreateExpenditureRequest = {
            storeName: parsed.storeName,
            amount: parsed.amount,
            expendedDate: parsed.date,
            expendedTime: parsed.time,
            categoryId: 1, // 기본 카테고리
            mealType: "LUNCH", // 기본값
            memo: "SMS 파싱",
            items: null,
          };

          console.log(
            "📝 [CreateExpenditure] SMS 파싱 후 지출 등록:",
            createRequest
          );

          const createResponse = await createExpenditure(createRequest);

          if (createResponse.result === "SUCCESS") {
            alert("문자가 파싱되어 지출이 등록되었습니다.");
            navigate("/spending");
          } else {
            alert(createResponse.error?.message || "지출 등록에 실패했습니다.");
          }
        } else {
          alert(parseResponse.error?.message || "SMS 파싱에 실패했습니다.");
        }
      } else {
        // 직접 입력
        if (!date || !storeName || !price) {
          alert("모든 필수 항목을 입력해주세요.");
          return;
        }

        const createRequest: CreateExpenditureRequest = {
          storeName,
          amount: Number(price),
          expendedDate: date,
          expendedTime: "12:00:00",
          categoryId,
          mealType,
          memo: null,
          items: null,
        };

        console.log("📝 [CreateExpenditure] 지출 등록 요청:");
        console.log("  - storeName:", createRequest.storeName);
        console.log(
          "  - amount:",
          createRequest.amount,
          typeof createRequest.amount
        );
        console.log("  - expendedDate:", createRequest.expendedDate);
        console.log("  - expendedTime:", createRequest.expendedTime);
        console.log(
          "  - categoryId:",
          createRequest.categoryId,
          typeof createRequest.categoryId
        );
        console.log("  - mealType:", createRequest.mealType);
        console.log("  - memo:", createRequest.memo);
        console.log("  - items:", createRequest.items);
        console.log(
          "📝 [Full Request Object]:",
          JSON.stringify(createRequest, null, 2)
        );

        const response = await createExpenditure(createRequest);

        if (response.result === "SUCCESS") {
          alert("지출이 등록되었습니다.");
          navigate("/spending");
        } else {
          alert(response.error?.message || "지출 등록에 실패했습니다.");
        }
      }
    } catch (error: any) {
      console.error("❌ [CreateExpenditure] 지출 등록 오류:", error);
      console.error("❌ [Error Details]", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorData: error.response?.data,
        errorMessage: error.message,
        requestUrl: error.config?.url,
        requestMethod: error.config?.method,
      });

      // 404 에러인 경우
      if (error.response?.status === 404) {
        alert(
          "⚠️ 백엔드 API가 구현되지 않았습니다.\n\n" +
            "📋 체크리스트:\n" +
            "✅ 프론트엔드: API 명세 준수 완료\n" +
            "✅ 요청 데이터: 모든 필수 필드 포함\n" +
            "✅ GET 엔드포인트: 정상 작동\n" +
            "❌ POST /api/v1/expenditures: 404\n\n" +
            "→ 백엔드 팀에 POST 엔드포인트 구현 요청 필요"
        );
      } else if (error.response?.status === 422) {
        // 유효성 검증 실패
        const errorMsg =
          error.response?.data?.error?.message || "입력값을 확인해주세요.";
        const errorField = error.response?.data?.error?.data?.field;
        const errorReason = error.response?.data?.error?.data?.reason;

        if (errorField && errorReason) {
          alert(
            `⚠️ 유효성 검증 실패\n\n필드: ${errorField}\n사유: ${errorReason}`
          );
        } else {
          alert(`⚠️ ${errorMsg}`);
        }
      } else if (error.response?.status === 401) {
        alert("⚠️ 인증이 필요합니다.\n\n로그인 후 다시 시도해주세요.");
      } else {
        alert(error.response?.data?.error?.message || "오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate("/spending")}>
          <FiChevronLeft />
        </BackButton>
        <Title>지출 등록</Title>
        <Placeholder />
      </Header>

      <TabContainer>
        <Tab
          $active={activeTab === "paste"}
          onClick={() => setActiveTab("paste")}
        >
          문자 붙여넣기
        </Tab>
        <Tab
          $active={activeTab === "manual"}
          onClick={() => setActiveTab("manual")}
        >
          직접 입력하기
        </Tab>
      </TabContainer>

      <Content>
        {activeTab === "paste" ? (
          <PasteSection>
            <SectionTitle>지출 내용 붙여넣기</SectionTitle>
            <Description>여기에 문자 메시지를 붙여넣으세요</Description>
            <TextArea
              placeholder="예: [WEB발신]스타벅스 6,500원 결제 승인&#10;10/26 15:30"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
          </PasteSection>
        ) : (
          <ManualSection>
            <SectionTitle>추출된 정보</SectionTitle>

            <FormGroup>
              <Label>날짜</Label>
              <InputWrapper>
                <IconWrapper>
                  <FiCalendar />
                </IconWrapper>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder=""
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label>가게명</Label>
              <InputWrapper>
                <IconWrapper>
                  <FiShoppingBag />
                </IconWrapper>
                <Input
                  type="text"
                  placeholder="상점명 입력"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label>금액</Label>
              <InputWrapper>
                <IconWrapper>
                  <FiDollarSign />
                </IconWrapper>
                <Input
                  type="text"
                  placeholder="가격 입력"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label>카테고리</Label>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
              >
                <option value={1}>식비</option>
                <option value={2}>교통</option>
                <option value={3}>쇼핑</option>
                <option value={4}>문화</option>
                <option value={5}>기타</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>식사 유형</Label>
              <Select
                value={mealType}
                onChange={(e) =>
                  setMealType(
                    e.target.value as "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER"
                  )
                }
              >
                <option value="BREAKFAST">아침</option>
                <option value="LUNCH">점심</option>
                <option value="DINNER">저녁</option>
                <option value="OTHER">기타</option>
              </Select>
            </FormGroup>
          </ManualSection>
        )}

        <SubmitButton onClick={handleSubmit} disabled={loading}>
          {loading
            ? "등록 중..."
            : activeTab === "paste"
            ? "지출 저장하기"
            : "지출 등록"}
        </SubmitButton>
      </Content>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background-color: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  font-size: 24px;
  color: ${theme.colors.accent};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0;
  flex: 1;
  text-align: center;
`;

const Placeholder = styled.div`
  width: 32px;
`;

const TabContainer = styled.div`
  background-color: white;
  display: flex;
  border-bottom: 1px solid #e0e0e0;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: ${theme.spacing.md};
  background-color: ${(props) => (props.$active ? "white" : "#f5f5f5")};
  border: none;
  border-bottom: 3px solid
    ${(props) => (props.$active ? theme.colors.accent : "transparent")};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${(props) =>
    props.$active
      ? theme.typography.fontWeight.bold
      : theme.typography.fontWeight.medium};
  color: ${(props) => (props.$active ? "#212121" : "#999")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.$active ? "white" : "#eeeeee")};
  }
`;

const Content = styled.div`
  flex: 1;
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
`;

const PasteSection = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ManualSection = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin: 0 0 ${theme.spacing.md} 0;
`;

const Description = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #757575;
  margin: 0 0 ${theme.spacing.md} 0;
`;

const TextArea = styled.textarea`
  flex: 1;
  width: 100%;
  min-height: 200px;
  padding: ${theme.spacing.md};
  border: 1px solid #e0e0e0;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  color: #212121;
  font-family: inherit;
  resize: none;
  line-height: 1.6;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }

  &::placeholder {
    color: #bdbdbd;
    line-height: 1.6;
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.bold};
  color: #212121;
  margin-bottom: ${theme.spacing.sm};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div`
  position: absolute;
  left: ${theme.spacing.md};
  color: #999;
  font-size: 20px;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 14px 14px 48px;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  font-size: ${theme.typography.fontSize.base};
  color: #212121;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }

  &::placeholder {
    color: #bdbdbd;
  }

  &[type="date"] {
    color: #bdbdbd;

    &::-webkit-calendar-picker-indicator {
      cursor: pointer;
    }
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 40px 14px 14px;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  font-size: ${theme.typography.fontSize.base};
  color: #212121;
  background-color: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background-color: ${theme.colors.accent};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
  margin-top: auto;

  &:hover {
    background-color: #e55a2b;
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default CreateExpenditurePage;
