import styled from "styled-components";

// 모바일 웹뷰 최적화 페이지 컨테이너
export const MobilePageContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh; /* 모바일 동적 뷰포트 높이 */
  width: 100%;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
`;

// 중앙 정렬이 필요한 페이지용 컨테이너
export const CenteredPageContainer = styled(MobilePageContainer)`
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
`;

// 콘텐츠 최대 너비 제한 컨테이너
export const ContentContainer = styled.div`
  width: 100%;
  max-width: 390px; /* 모바일 웹뷰 최적화 */
  margin: 0 auto;
`;

// 스크롤 가능한 콘텐츠 영역
export const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  padding: 1.5rem;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
`;

// 패딩이 있는 콘텐츠 컨테이너
export const PaddedContent = styled(ContentContainer)`
  padding: 0 1.5rem;
`;

// 섹션 구분용 컨테이너
export const Section = styled.section`
  width: 100%;
  padding: 1.5rem 0;
`;

// 플렉스 컬럼 컨테이너
export const FlexColumn = styled.div<{ gap?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.gap || "1rem"};
  width: 100%;
`;

// 플렉스 로우 컨테이너
export const FlexRow = styled.div<{
  gap?: string;
  justify?: string;
  align?: string;
}>`
  display: flex;
  flex-direction: row;
  gap: ${(props) => props.gap || "1rem"};
  justify-content: ${(props) => props.justify || "flex-start"};
  align-items: ${(props) => props.align || "center"};
  width: 100%;
`;
