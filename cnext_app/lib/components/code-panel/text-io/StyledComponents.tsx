import styled from "styled-components";
import { XTerm } from "xterm-for-react";

// const XTerm = dynamic<any>(() => import("xterm-for-react").then((mod) => mod.XTerm), {
//     ssr: false,
// });
export const StyleXTerm = styled(XTerm)`
    height: 100%;
`;
