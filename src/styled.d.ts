import "styled-components";
import type { Theme } from "./styles/theme";

// ThemeProvider로 넘기는 theme 객체의 타입을 styled-components의 DefaultTheme에 연결
declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
