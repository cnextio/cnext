import React, { useState } from "react";
import { useAuth0, User } from "@auth0/auth0-react";
import {
    AppToolbarItem as StyledAppToolbarItem,
    SidebarButton as StyledSidebarButton,
} from "../StyledComponents";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { AccountContextMenuItem, IUser } from "../../interfaces/IAccount";
import { IContextMenu, IMenuItem, IMenuPosision } from "../../interfaces/IContextMenu";
import ContextMenu from "../libs/ContextMenu";
import { Tooltip } from "@mui/material";

const AccountIcon = ({
    user,
    isAuthenticated,
}: {
    user: User | undefined;
    isAuthenticated: boolean;
}) => {
    return (
        <>
            {isAuthenticated && user != null ? (
                <img src={user.picture} alt={user.name} style={{ borderRadius: "50%" }} />
            ) : (
                <AccountCircleIcon />
            )}
        </>
    );
};

const AccountButton = ({ icon, selected, handleClick }) => {
    return (
        <StyledAppToolbarItem key={icon.name} selected={selected}>
            <Tooltip title={icon.tooltip} placement="right-end">
                <StyledSidebarButton id={icon.name} onClick={handleClick}>
                    {icon.component}
                </StyledSidebarButton>
            </Tooltip>
        </StyledAppToolbarItem>
    );
};

const Account = () => {
    const [accountMenuOpen, setAccountMenuOpen] = useState<boolean>(false);
    const [accountMenu, setAccountMenu] = useState<IContextMenu | undefined>();
    const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

    const openAccountMenu = (event: React.MouseEvent) => {
        let pos: IMenuPosision = { mouseX: event.clientX, mouseY: event.clientY };
        let menu: IMenuItem[] = [];
        if (!isAuthenticated) {
            menu.push({
                name: AccountContextMenuItem.LOGIN,
                text: "Login",
                disable: false,
            });
        } else {
            menu.push({
                name: AccountContextMenuItem.LOGOUT,
                text: "Logout",
                disable: false,
            });
        }
        let contextMenu: IContextMenu = { menu: menu, pos: pos };
        setAccountMenu(contextMenu);
        setAccountMenuOpen(true);
    };

    const selectAccountMenuItem = (item: IMenuItem) => {
        setAccountMenuOpen(false);
        switch (item.name) {
            case AccountContextMenuItem.LOGIN:
                if (!isAuthenticated) loginWithRedirect();
                break;
            case AccountContextMenuItem.LOGOUT:
                if (isAuthenticated) logout()
                break;
        }
    };

    const closeAccountMenuItem = () => {
        setAccountMenuOpen(false);
    };
    
    return (
        <>
            <AccountButton
                key={'account'}
                icon={{
                    name: "Account",
                    component: <AccountIcon user={user} isAuthenticated={isAuthenticated} />,
                    tooltip: "Account",
                }}
                handleClick={(event: React.MouseEvent) => {
                    openAccountMenu(event);
                }}
                selected={accountMenuOpen}
            ></AccountButton>
            <ContextMenu
                open={accountMenuOpen}
                contextMenu={accountMenu}
                handleClose={closeAccountMenuItem}
                handleSelection={selectAccountMenuItem}
            />
        </>
    );
};

export default Account;
