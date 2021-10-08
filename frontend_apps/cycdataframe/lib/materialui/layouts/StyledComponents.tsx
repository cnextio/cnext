import SplitPane, { Pane } from 'react-split-pane';
import styled from 'styled-components';

export const TopPanel = styled.div`
    display: flex;
`;

export const Logo = styled.div`
    background-color: ${props =>
    props.theme.palette.background.paper};
    padding: 9.5px 8.45px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 57px;
    width: 57px
`;

export const LogoIcon = styled.img`
    width: 40.1px;
    height: 38px;
`;

export const AppBar = styled.div`
    background-color: ${props => props.theme.palette.primary.main};
    padding: 4.5px 12px;
    display: flex;
    align-items: center;
    width: 100%;`;
  

export const LeftSide = styled.div`
  display: flex;
  align-items: center;
  flex: 1;`;

export const AppBarIcon = styled.div`
    color: ${props =>
    props.theme.palette.background.paper};
    padding: 12px;
    width: 48px;
    height: 48px;
`;
// export const StyledSkeleton = styled(Skeleton)`
//   width: 120px;
//   height: 24px;`;
  
// export const StyledUnstyledIconButton = styled(UnstyledIconButton)``;
// export const StyledUnstyledIconButton = styled(UnstyledIconButton)``;

export const MainPanel = styled.div`
    display: flex;
`;

export const Sidebar = styled.div`
    background-color: ${props =>
    props.theme.palette.background.paper};
    padding: 10px 0 759px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 57px;
    height: 100%;
`;

export const SidebarList = styled.div`
    background-color: ${props =>
    props.theme.palette.background.paper};
    padding: 8px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 181px;
    width: 57px;
`;
export const SidebarListItem = styled.div`
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50x;
    width: 40px;
    &:not(:last-of-type) {
    margin-bottom: 10px;
    }
`;
export const SidebarButton = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
`;
export const SidebarIcon = styled.div`
    color: ${props =>
    props.theme.palette.action};
    width: 75%;
    height: 75%;
`;
// export const VectorTwo = styled.img`
//   width: 87.5%;
//   height: 75%;
// `;
// export const Container = styled.div`
//   width: 24px;
//   height: 19px;
//   position: relative;
// `;
// export const StyledDrafts = styled(Drafts)`
//   position: absolute;
//   left: 0;
//   top: -2.5px;
// `;

export const SideBarDivider = styled.div`
    display: flex;
    align-items: center;
`;

// export const StyledDividerVertical = styled(
//   DividerVertical
// )``;

export const WorkingPanel = styled.div`
    // display: flex;
    padding: 12px; 
    flex-grow: 1;   
    position: relative;
`;

export const CodePanel = styled.div`
    background-color: ${props => props.theme.palette.background.paper};
    overflow: hidden;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid ${props => props.theme.palette.divider};
    // width: 30%;
    height: 100%;    
`;


export const CodeToolbar = styled.div`
    display: flex;
    height: 40px;
    padding: 10px;
    align-self: stretch;
`;

export const CodeArea = styled.div`    
    background-color: ${props => props.theme.palette.background.paper};
    padding: 10px;
    align-self: stretch;      
`;

export const WorkingPanelDivider = styled.div`
    // adding display flex here does not work because the divider width becomes 0, no sure why        
    align-self: stretch;    
`;

export const TablePanel = styled.div`
    background-color: ${props => props.theme.palette.background.paper};
    overflow: hidden;
    border-radius: 4px;
    display: flex;
    flex-grow: 1;   
    flex-direction: column;
    align-items: center;
    border: 1px solid ${props => props.theme.palette.divider};
    //width: 70%;     
    height: 100%;
`;

export const TableToolbar = styled.div`
    display: flex;
    height: 40px;
    padding: 10px;
    align-self: stretch;
`;

export const TableArea = styled.div`
    background-color: ${props => props.theme.palette.background.paper};
    padding: 10px;
    display: flex;
    align-self: stretch;                  
`;

export const SplitPanel = styled(SplitPane)`
    // background-color: ${props => props.theme.palette.background.paper};
    // overflow: hidden;
    // border-radius: 4px;
    // display: flex;
    // flex-direction: column;
    // align-items: center;
    // border: 1px solid ${props => props.theme.palette.divider};
    // width: 50%;    
    // align-self: stretch;
`;