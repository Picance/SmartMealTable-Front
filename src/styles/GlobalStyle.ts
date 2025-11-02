import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #ffffff;
  }

  /* 모바일 웹뷰 최적화 */
  @media (min-width: 431px) {
    body {
      display: flex;
      justify-content: center;
      background-color: #f0f0f0;
    }

    #root {
      max-width: 430px;
      width: 100%;
      background-color: #ffffff;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      position: relative;
    }
  }

  /* 터치 디바이스 최적화 */
  button, a {
    -webkit-tap-highlight-color: transparent;
  }

  /* 스크롤바 스타일 */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;
