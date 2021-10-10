import React, { useState } from "react";
import styled, {withTheme} from "styled-components";
import { rgba } from "polished";
import { darken } from "polished";
import {useRouter, withRouter} from 'next/router'

import PerfectScrollbar from "react-perfect-scrollbar";

import { spacing } from "@material-ui/system";

import {
  Avatar,
  Badge,
  Box as MuiBox,
  Chip,
  Collapse,
  Drawer as MuiDrawer,
  Grid,
  List as MuiList,
  ListItem,
  ListItemText,
  Typography
} from "@material-ui/core";

import { ExpandLess, ExpandMore } from "@material-ui/icons";

import { green } from "@material-ui/core/colors";

import routes, {FOLDERS} from "../../pages/routes";

import { Layers } from "react-feather";
import NavLink from '../NavLink';
// import TreeItem from "@material-ui/lab/TreeItem";
// import {getFolderByUser, getFolderNameFromID, USER_ID} from "../../database";
// import {Alert, AlertTitle} from "@material-ui/lab";
// import CircularProgress from "@material-ui/core/CircularProgress";
// import TreeView from "@material-ui/lab/TreeView";
// import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
// import ChevronRightIcon from "@material-ui/icons/ChevronRight";
// import makeStyles from "@material-ui/core/styles/makeStyles";

const Box = styled(MuiBox)(spacing);

const Drawer = styled(MuiDrawer)`
  border-right: 0;

  > div {
    border-right: 0;
  }
`;

const Scrollbar = styled(PerfectScrollbar)`
  background-color: ${props => props.theme.sidebar.background};
  border-right: 1px solid rgba(0, 0, 0, 0.12);
`;

const List = styled(MuiList)`
  background-color: ${props => props.theme.sidebar.background};
`;

const Items = styled.div`
  padding-top: ${props => props.theme.spacing(2.5)}px;
  padding-bottom: ${props => props.theme.spacing(2.5)}px;
`;

const Brand = styled(ListItem)`
  font-size: ${props => props.theme.typography.h5.fontSize};
  font-weight: ${props => props.theme.typography.fontWeightMedium};
  color: ${props => props.theme.sidebar.header.color};
  background-color: ${props => props.theme.sidebar.header.background};
  font-family: ${props => props.theme.typography.fontFamily};
  min-height: 56px;
  padding-left: ${props => props.theme.spacing(6)}px;
  padding-right: ${props => props.theme.spacing(6)}px;

  ${props => props.theme.breakpoints.up("sm")} {
    min-height: 64px;
  }
`;

const BrandIcon = styled(Layers)`
  margin-right: ${props => props.theme.spacing(2)}px;
  color: ${props => props.theme.sidebar.header.brand.color};
`;

const BrandChip = styled(Chip)`
  background-color: ${green[700]};
  border-radius: 5px;
  color: ${props => props.theme.palette.common.white};
  font-size: 60%;
  height: 20px;
  margin-left: 2px;
  margin-bottom: 1px;
  padding: 4px 0;

  span {
    padding-left: ${props => props.theme.spacing(1.5)}px;
    padding-right: ${props => props.theme.spacing(1.5)}px;
  }
`;

const Category = styled(ListItem)`
  padding-top: ${props => props.theme.spacing(3)}px;
  padding-bottom: ${props => props.theme.spacing(3)}px;
  padding-left: ${props => props.theme.spacing(6)}px;
  padding-right: ${props => props.theme.spacing(5)}px;
  font-weight: ${props => props.theme.typography.fontWeightRegular};

  svg {
    color: ${props => props.theme.sidebar.color};
    font-size: 20px;
    width: 20px;
    height: 20px;
    opacity: 0.5;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  &.${props => props.activeClassName} {
    background-color: ${props => darken(0.05, props.theme.sidebar.background)};

    span {
      color: ${props => props.theme.sidebar.color};
    }
  }
`;

const CategoryText = styled(ListItemText)`
  margin: 0;
  span {
    color: ${props => props.theme.sidebar.color};
    font-size: ${props => props.theme.typography.body1.fontSize}px;
    font-weight: ${props => props.theme.sidebar.category.fontWeight};
    padding: 0 ${props => props.theme.spacing(4)}px;
  }
`;

export const CategoryIconLess = styled(ExpandLess)`
  color: ${props => rgba(props.theme.sidebar.color, 0.5)};
`;

export const CategoryIconMore = styled(ExpandMore)`
  color: ${props => rgba(props.theme.sidebar.color, 0.5)};
`;

const StyledLink = styled(ListItem)`
  padding-left: ${props => props.theme.spacing(15)}px;
  padding-top: ${props => props.theme.spacing(2)}px;
  padding-bottom: ${props => props.theme.spacing(2)}px;

  span {
    color: ${props => rgba(props.theme.sidebar.color, 0.7)};
  }

  &:hover span {
    color: ${props => rgba(props.theme.sidebar.color, 0.9)};
  }

  &.${props => props.activeClassName} {
    background-color: ${props => darken(0.06, props.theme.sidebar.background)};

    span {
      color: ${props => props.theme.sidebar.color};
    }
  }
`;

const LinkText = styled(ListItemText)`
  color: ${props => props.theme.sidebar.color};
  span {
    font-size: ${props => props.theme.typography.body1.fontSize}px;
  }
  margin-top: 0;
  margin-bottom: 0;
`;

const LinkBadge = styled(Chip)`
  font-size: 11px;
  font-weight: ${props => props.theme.typography.fontWeightBold};
  height: 20px;
  position: absolute;
  right: 12px;
  top: 8px;
  background: ${props => props.theme.sidebar.badge.background};

  span.MuiChip-label,
  span.MuiChip-label:hover {
    cursor: pointer;
    color: ${props => props.theme.sidebar.badge.color};
    padding-left: ${props => props.theme.spacing(2)}px;
    padding-right: ${props => props.theme.spacing(2)}px;
  }
`;

const CategoryBadge = styled(LinkBadge)`
  top: 12px;
`;

const SidebarSection = styled(Typography)`
  color: ${props => props.theme.sidebar.color};
  padding: ${props => props.theme.spacing(4)}px
    ${props => props.theme.spacing(6)}px ${props => props.theme.spacing(1)}px;
  opacity: 0.9;
  display: block;
`;

const SidebarFooter = styled.div`
  background-color: ${props =>
    props.theme.sidebar.footer.background} !important;
  padding: ${props => props.theme.spacing(2.75)}px
    ${props => props.theme.spacing(4)}px;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
`;

const SidebarFooterText = styled(Typography)`
  color: ${props => props.theme.sidebar.footer.color};
`;

const SidebarFooterSubText = styled(Typography)`
  color: ${props => props.theme.sidebar.footer.color};
  font-size: .725rem;
  display: block;
  padding: 1px;
`;

const StyledBadge = styled(Badge)`
  margin-right: ${props => props.theme.spacing(1)}px;

  span {
    background-color: ${props => props.theme.sidebar.footer.online.background};
    border: 1.5px solid ${props => props.theme.palette.common.white};
    height: 12px;
    width: 12px;
    border-radius: 50%;
  }
`

function SidebarCategory({
  name,
  icon,
  classes,
  isOpen,
  isCollapsable,
  badge,
  ...rest
}) {
  return (
    <Category {...rest}>
      {icon}
      <CategoryText>{name}</CategoryText>
      {isCollapsable ? (
        isOpen ? (
          <CategoryIconMore />
        ) : (
          <CategoryIconLess />
        )
      ) : null}
      {badge ? <CategoryBadge label={badge} /> : ""}
    </Category>
  );
}

function SidebarLink({ name, href, badge }) {
  return (
    <StyledLink
      button
      dense
      component={NavLink}
      exact
      href={href}
      activeClassName="active"
    >
      <LinkText>{name}</LinkText>
      {badge ? <LinkBadge label={badge} /> : ""}
    </StyledLink>
  );
}

function Sidebar({ classes, staticContext, router, handleSideBarSelection, ...rest }) {
  const initOpenRoutes = () => {
    /* Open collapse element that matches current url */
    const pathName = router.pathname;
    let _routes = {};

    routes.forEach((route, index) => {
      const isActive = pathName.indexOf(route.path) === 0;
      const isOpen = route.open;
      const isHome = route.containsHome && pathName === "/" ? true : false;

      _routes = Object.assign({}, _routes, {[index]: isActive || isOpen || isHome})
    });
    // console.log(_routes)
    return _routes;
  };

  const [openRoutes, setOpenRoutes] = useState(() => initOpenRoutes());

  const toggle = index => {
    // Collapse all elements
    Object.keys(openRoutes).forEach(
      item => openRoutes[index] || setOpenRoutes(openRoutes => Object.assign({}, openRoutes, {[item]: false}))
    )
    
    // Toggle selected element
    setOpenRoutes(openRoutes => Object.assign({}, openRoutes, {[index]: !openRoutes[index]}));
  }

  // console.log(routes)
  return (
    <Drawer variant="permanent" {...rest}>
      <Brand>
        <BrandIcon />
        <Box ml={1}>
          Magic Pen
          {/*<BrandChip label="PRO" />*/}
        </Box>
      </Brand>
      <Scrollbar>
        <List disablePadding>
          <Items>
            {routes.map((category, index) => (
              <React.Fragment key={index}>
                {category.header ? (
                  <SidebarSection>{category.header}</SidebarSection>
                ) : null}
                <SidebarCategory
                  isCollapsable={false}
                  name={category.id}
                  // href={category.path}
                  // activeClassName="active"
                  // component={span}
                  button={true}
                  icon={category.icon}
                  // exact
                  badge={category.badge}
                  onClick={handleSideBarSelection.bind(this, category.id)}
                />
                )
              </React.Fragment>
            ))}
          </Items>
        </List>
      </Scrollbar>
      <SidebarFooter>
        <Grid container spacing={2}>
          <Grid item>
            <StyledBadge
              overlap="circle"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              variant="dot"
            >
              <Avatar alt="Leah Bui" src="/images/profile.jpg" />
            </StyledBadge>
          </Grid>
          <Grid item>
            <SidebarFooterText variant="body2">
              Bach Bui
            </SidebarFooterText>
            <SidebarFooterSubText variant="caption">
              Engineering Manager
            </SidebarFooterSubText>
          </Grid>
        </Grid>
      </SidebarFooter>
    </Drawer>
  );
}

//TODO: consolidate style with StyledTreeItem below
// const useStyles = makeStyles((theme) => ({
//   root: {
//     height: 216,
//     flexGrow: 1,
//     maxWidth: 400,
//     paddingLeft: theme.spacing(4)
//   }
// }));

// const StyledTreeItem = styled(TreeItem)`
//   padding-left: ${props => props.theme.spacing(2)}px;
//   padding-top: ${props => props.theme.spacing(2)}px;
//   padding-bottom: ${props => props.theme.spacing(2)}px;

//   span {
//     color: ${props => rgba(props.theme.sidebar.color, 0.7)};
//   }

//   &:hover span {
//     color: ${props => rgba(props.theme.sidebar.color, 0.9)};
//   }

//   &.${props => props.activeClassName} {
//     background-color: ${props => darken(0.06, props.theme.sidebar.background)};

//     span {
//       color: ${props => props.theme.sidebar.color};
//     }
//   }
//   color: ${props => props.theme.sidebar.color};
// `;

// export const FolderTree = ({ menuID, handleOnClick }) => {
//   const classes = useStyles();
//   let {data, loading, error} = getFolderByUser(USER_ID);

//   if (error) {
//       return (
//           <Alert severity="error">
//               <AlertTitle>Error</AlertTitle>
//               Fail to acquire folder list
//           </Alert>
//       )
//   }
//   if (loading) {
//       return (<CircularProgress/>);
//   }

//   //the following algorithm works because the data is already sorted by alphabet order
//   function addChildren(curIndex){
//     const router = useRouter();

//     // function handleOnClick(folder){
//     //   router.push('/materialui/pages/tasks');
//     // }
//     //invariant assumption: cur_index will always be a valid index
//     let children = [];
//     let nextIndex = curIndex+1;

//     while (nextIndex < data.length){
//       if (data[nextIndex].parent_id == data[curIndex].id) {
//         const res = addChildren(nextIndex);
//         nextIndex = res.nextIndex;
//         // console.log(nextIndex, getFolderName(data[curIndex].id), res.child);
//         children.push(res.child);
//       }
//       else {
//         break;
//       }
//     }
//     // console.log(curIndex, data[curIndex]);
//     return {
//       child: <StyledTreeItem key={curIndex}
//                              nodeId={curIndex.toString()}
//                              label={getFolderNameFromID(data[curIndex].id)}
//                              folder={data[curIndex].id}
//                              onClick={handleOnClick.bind(this, menuID, data[curIndex].id)}
//                              children={children}/>,
//       nextIndex: nextIndex
//     }
//   }

//   let curIndex=0;
//   let folderTree = [];
//   while(curIndex<data.length) {
//     const res = addChildren(curIndex);
//     curIndex = res.nextIndex;
//     folderTree.push(res.child);
//   }

//   return (
//       <TreeView
//           className={classes.root}
//           defaultCollapseIcon={<ExpandMoreIcon/>}
//           defaultExpandIcon={<ChevronRightIcon/>}
//           multiSelect
//       >
//         {folderTree}
//       </TreeView>
//   )
// }

export default withTheme(withRouter(Sidebar));
// export default Sidebar;
