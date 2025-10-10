import { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { onboardingService } from "../../services/onboarding.service";
import "./OnboardingAddressPage.css";

interface AddressSearchResult {
  roadAddress: string;
  jibunAddress: string;
  x: string; // longitude
  y: string; // latitude
}

const OnboardingAddressPage = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [addresses, setAddresses] = useState<AddressSearchResult[]>([]);
  const [selectedAddress, setSelectedAddress] =
    useState<AddressSearchResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [addressType, setAddressType] = useState<"HOME" | "WORK" | "ETC">(
    "HOME"
  );
  const [addressAlias, setAddressAlias] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 주소 검색
  const handleSearchAddress = async () => {
    if (!searchKeyword.trim()) {
      return;
    }

    setIsSearching(true);
    setError("");
    try {
      const response = await onboardingService.searchAddress(searchKeyword);
      if (response.result === "SUCCESS" && response.data) {
        setAddresses(response.data.addresses);
        setShowResults(true);
      } else {
        setAddresses([]);
        setError("주소 검색에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("주소 검색 실패:", err);
      setError(
        err.response?.data?.error?.message ||
          "주소 검색 중 오류가 발생했습니다."
      );
      setAddresses([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 주소 선택
  const handleSelectAddress = (address: AddressSearchResult) => {
    setSelectedAddress(address);
    setShowResults(false);
    setSearchKeyword("");
  };

  // 주소 타입 변경
  const handleAddressTypeChange = (type: "HOME" | "WORK" | "ETC") => {
    setAddressType(type);
    // 타입에 따라 기본 별칭 설정
    if (type === "HOME") {
      setAddressAlias("집");
    } else if (type === "WORK") {
      setAddressAlias("회사");
    } else {
      setAddressAlias("");
    }
  };

  // 다음 단계로
  const handleNext = async () => {
    setError("");

    // 주소 선택 확인
    if (!selectedAddress) {
      setError("주소를 선택해주세요.");
      return;
    }

    // 별칭 확인
    if (!addressAlias.trim()) {
      setError("주소 별칭을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await onboardingService.saveAddress({
        addressAlias: addressAlias.trim(),
        addressType,
        streetNameAddress: selectedAddress.roadAddress,
        lotNumberAddress: selectedAddress.jibunAddress,
        detailedAddress: detailedAddress.trim() || undefined,
        latitude: parseFloat(selectedAddress.y),
        longitude: parseFloat(selectedAddress.x),
        isPrimary: true,
      });

      if (response.result === "SUCCESS") {
        navigate("/onboarding/budget");
      } else {
        setError(response.error?.message || "주소 저장에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("주소 저장 실패:", err);
      setError(
        err.response?.data?.error?.message ||
          "주소 저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="onboarding-address-page">
      <div className="onboarding-address-header">
        <button
          className="onboarding-address-back-button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
        >
          <FiArrowLeft />
        </button>
        <h1>주소 설정</h1>
      </div>

      <div className="onboarding-address-content">
        <div className="onboarding-address-intro">
          <h2>주소를 설정해주세요 📍</h2>
          <p>근처 맛집을 추천받기 위해 주소가 필요합니다.</p>
        </div>

        <form
          className="onboarding-address-form"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* 주소 검색 */}
          <div className="onboarding-address-form-section">
            <label className="onboarding-address-form-label">주소 검색 *</label>
            <div className="onboarding-address-search-container">
              <div className="onboarding-address-search-input-wrapper">
                <Input
                  type="text"
                  value={searchKeyword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearchKeyword(e.target.value)
                  }
                  placeholder="도로명, 지번, 건물명으로 검색"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearchAddress();
                    }
                  }}
                />
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleSearchAddress}
                  loading={isSearching}
                  icon={<FiSearch />}
                >
                  검색
                </Button>
              </div>

              {showResults && (
                <div className="onboarding-address-search-results">
                  {addresses.length > 0 ? (
                    addresses.map((address, index) => (
                      <div
                        key={index}
                        className="onboarding-address-search-result-item"
                        onClick={() => handleSelectAddress(address)}
                      >
                        <div className="onboarding-address-search-result-road">
                          {address.roadAddress}
                        </div>
                        {address.jibunAddress && (
                          <div className="onboarding-address-search-result-jibun">
                            지번: {address.jibunAddress}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="onboarding-address-search-empty">
                      검색 결과가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 선택된 주소 표시 */}
          {selectedAddress && (
            <>
              <div className="onboarding-address-form-section">
                <label className="onboarding-address-form-label">
                  선택한 주소
                </label>
                <div className="onboarding-address-selected-address">
                  <div className="onboarding-address-selected-address-road">
                    {selectedAddress.roadAddress}
                  </div>
                  {selectedAddress.jibunAddress && (
                    <div className="onboarding-address-selected-address-jibun">
                      지번: {selectedAddress.jibunAddress}
                    </div>
                  )}
                </div>

                {/* 지도 영역 (추후 네이버 지도 API 연동) */}
                <div className="onboarding-address-map-container">
                  <span>지도 영역 (네이버 지도 API 연동 예정)</span>
                </div>
              </div>

              {/* 주소 타입 선택 */}
              <div className="onboarding-address-form-section">
                <label className="onboarding-address-form-label">
                  주소 타입 *
                </label>
                <div className="onboarding-address-type-selector">
                  <button
                    type="button"
                    className={`onboarding-address-type-button ${
                      addressType === "HOME" ? "active" : ""
                    }`}
                    onClick={() => handleAddressTypeChange("HOME")}
                  >
                    🏠 집
                  </button>
                  <button
                    type="button"
                    className={`onboarding-address-type-button ${
                      addressType === "WORK" ? "active" : ""
                    }`}
                    onClick={() => handleAddressTypeChange("WORK")}
                  >
                    🏢 회사
                  </button>
                  <button
                    type="button"
                    className={`onboarding-address-type-button ${
                      addressType === "ETC" ? "active" : ""
                    }`}
                    onClick={() => handleAddressTypeChange("ETC")}
                  >
                    📍 기타
                  </button>
                </div>
              </div>

              {/* 주소 별칭 */}
              <div className="onboarding-address-form-section">
                <label className="onboarding-address-form-label">
                  주소 별칭 *
                </label>
                <Input
                  type="text"
                  value={addressAlias}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setAddressAlias(e.target.value)
                  }
                  placeholder="예: 우리집, 회사, 자취방 등"
                  maxLength={20}
                />
              </div>

              {/* 상세 주소 */}
              <div className="onboarding-address-form-section">
                <label className="onboarding-address-form-label">
                  상세 주소 (선택)
                </label>
                <Input
                  type="text"
                  value={detailedAddress}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setDetailedAddress(e.target.value)
                  }
                  placeholder="동, 호수 등 상세 주소를 입력하세요"
                  maxLength={100}
                />
              </div>
            </>
          )}

          {error && <div className="onboarding-address-error">{error}</div>}

          <div className="onboarding-address-actions">
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleNext}
              disabled={
                !selectedAddress || !addressAlias.trim() || isSubmitting
              }
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

export default OnboardingAddressPage;
