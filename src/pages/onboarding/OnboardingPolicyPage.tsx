import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { Button } from "../../components/common/Button";
import { onboardingService } from "../../services/onboarding.service";
import { useAuthStore } from "../../store/authStore";
import "./OnboardingPolicyPage.css";

interface Policy {
  policyId: number;
  title: string;
  description: string;
  required: boolean;
  content: string;
}

const POLICIES: Policy[] = [
  {
    policyId: 1,
    title: "서비스 이용약관",
    description: "알뜰식탁 서비스 이용을 위한 기본 약관입니다.",
    required: true,
    content: "서비스 이용약관 전문...",
  },
  {
    policyId: 2,
    title: "개인정보 처리방침",
    description: "회원님의 개인정보 수집 및 이용에 관한 약관입니다.",
    required: true,
    content: "개인정보 처리방침 전문...",
  },
  {
    policyId: 3,
    title: "위치정보 이용약관",
    description: "근처 맛집 추천을 위한 위치정보 이용 약관입니다.",
    required: true,
    content: "위치정보 이용약관 전문...",
  },
  {
    policyId: 4,
    title: "마케팅 정보 수신 동의",
    description: "이벤트, 프로모션 등 마케팅 정보 수신 동의입니다.",
    required: false,
    content: "마케팅 정보 수신 동의 전문...",
  },
];

const OnboardingPolicyPage = () => {
  const navigate = useNavigate();
  const updateMember = useAuthStore((state) => state.updateMember);
  const [agreements, setAgreements] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 전체 동의
  const handleAllAgree = () => {
    if (agreements.size === POLICIES.length) {
      // 전체 해제
      setAgreements(new Set());
    } else {
      // 전체 선택
      setAgreements(new Set(POLICIES.map((p) => p.policyId)));
    }
  };

  // 개별 동의
  const handlePolicyAgree = (policyId: number) => {
    const newAgreements = new Set(agreements);
    if (newAgreements.has(policyId)) {
      newAgreements.delete(policyId);
    } else {
      newAgreements.add(policyId);
    }
    setAgreements(newAgreements);
  };

  // 필수 약관 모두 동의했는지 확인
  const isRequiredAgreed = () => {
    const requiredPolicyIds = POLICIES.filter((p) => p.required).map(
      (p) => p.policyId
    );
    return requiredPolicyIds.every((id) => agreements.has(id));
  };

  // 완료
  const handleComplete = async () => {
    setError("");

    // 필수 약관 확인
    if (!isRequiredAgreed()) {
      setError("필수 약관에 모두 동의해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const agreementList = Array.from(agreements).map((policyId) => ({
        policyId,
        agreed: true,
        agreedAt: new Date().toISOString(),
      }));

      const response = await onboardingService.savePolicyAgreements({
        agreements: agreementList,
      });

      if (response.result === "SUCCESS") {
        // 온보딩 완료 상태 업데이트
        updateMember({ isOnboardingComplete: true });

        // 홈으로 이동
        navigate("/home", { replace: true });
      } else {
        setError(response.error?.message || "약관 동의 저장에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("약관 동의 저장 실패:", err);
      setError(
        err.response?.data?.error?.message ||
          "약관 동의 저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="onboarding-policy-page">
      <div className="onboarding-policy-header">
        <button
          className="onboarding-policy-back-button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
        >
          <FiArrowLeft />
        </button>
        <h1>약관 동의</h1>
      </div>

      <div className="onboarding-policy-content">
        <div className="onboarding-policy-intro">
          <h2>거의 다 왔어요! 📝</h2>
          <p>서비스 이용을 위해 약관에 동의해주세요.</p>
        </div>

        <form
          className="onboarding-policy-form"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* 전체 동의 */}
          <div
            className={`onboarding-policy-all-agree ${
              agreements.size === POLICIES.length ? "checked" : ""
            }`}
            onClick={handleAllAgree}
          >
            <div className="onboarding-policy-checkbox">
              {agreements.size === POLICIES.length && <FiCheck />}
            </div>
            <div className="onboarding-policy-all-agree-text">
              전체 동의하기
            </div>
          </div>

          <div className="onboarding-policy-divider" />

          {/* 개별 약관 */}
          <div className="onboarding-policy-list">
            {POLICIES.map((policy) => (
              <div
                key={policy.policyId}
                className={`onboarding-policy-item ${
                  agreements.has(policy.policyId) ? "checked" : ""
                }`}
                onClick={() => handlePolicyAgree(policy.policyId)}
              >
                <div className="onboarding-policy-item-checkbox">
                  {agreements.has(policy.policyId) && <FiCheck />}
                </div>
                <div className="onboarding-policy-item-content">
                  <div className="onboarding-policy-item-header">
                    <span className="onboarding-policy-item-title">
                      {policy.title}
                    </span>
                    {policy.required && (
                      <span className="onboarding-policy-item-required">
                        (필수)
                      </span>
                    )}
                  </div>
                  <div className="onboarding-policy-item-description">
                    {policy.description}
                  </div>
                  <span
                    className="onboarding-policy-item-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: 약관 상세 보기 모달
                      alert(`${policy.title} 전문을 보여줍니다.`);
                    }}
                  >
                    전문 보기
                  </span>
                </div>
              </div>
            ))}
          </div>

          {error && <div className="onboarding-policy-error">{error}</div>}

          <div className="onboarding-policy-actions">
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleComplete}
              disabled={!isRequiredAgreed() || isSubmitting}
              loading={isSubmitting}
            >
              완료
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPolicyPage;
