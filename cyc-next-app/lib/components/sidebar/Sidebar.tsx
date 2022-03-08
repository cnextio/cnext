import * as React from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import InboxIcon from '@mui/icons-material/Inbox';
import FolderIcon from '@mui/icons-material/Folder';
// import { Sidebar } from 'react-feather';
import { Sidebar, SidebarList, SidebarListItem, SidebarButton as StyledSidebarButton, SidebarIcon, SideBarDivider } from '../StyledComponents'
import LogoComponent from '../Logo';
import { useDispatch, useSelector } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { setShowProjectExplorer } from '../../../redux/reducers/ProjectManagerRedux';

// const drawerWidth = 240;

// export const DrawerHeader = styled('div')(({ theme }) => ({
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'flex-end',
//   padding: theme.spacing(0, 1),
//   // necessary for content to be below app bar
//   ...theme.mixins.toolbar,
// }));

const SidebarItem = ({ icon, selectedIcon, handleClick }) => {
	return (
		<SidebarListItem button key={icon.name} selected={selectedIcon===icon.name}>
			<StyledSidebarButton onClick={() => handleClick(icon.name)}>
				{icon.component}
			</StyledSidebarButton>
		</SidebarListItem>
	)
}
const MiniSidebar = () => {
	const [selectedIcon, setSelectedIcon] = useState<string|null>(null);
	const dispatch = useDispatch();

	const iconList = [
	{
		name: 'Projects',
		component: <FolderIcon/>
	},
	{
		name: 'Inbox',
		component: <InboxIcon/>
	}
	];

	const handleClick = (name: string) => {
		if(name === selectedIcon){
			setSelectedIcon(null);
		} else {
			setSelectedIcon(name);			
		}
	}

	useEffect(() => {
		if(selectedIcon === 'Projects'){
			dispatch(setShowProjectExplorer(true));
		} else {
			dispatch(setShowProjectExplorer(false));
		}
	}, [selectedIcon])

	return (
	<Fragment>
		<Box>
			<LogoComponent />
			<Sidebar variant="permanent" >        
				<SidebarList>
				{iconList.map((icon, index) => (
					<SidebarItem
						key={index} 
						icon={icon} 
						selectedIcon={selectedIcon} 
						handleClick={handleClick}
					/>
				))}
				</SidebarList>        
			</Sidebar>      
		</Box>
		<SideBarDivider orientation='vertical'/>
	</Fragment>
	);
};

export default MiniSidebar;