import React, {FC} from "react";
import MainLayout from "../materialui/pages/main";
// import AuthLayout from "../layouts/Auth";
// import Page404 from "../pages/auth/Page404";

// This will be useful when we have to move between login, main and error page
// only have main page for now
function childRoutes(Layout: FC) {
    return (
        <Layout/>            
    );
}

function Routes(props: any) {
    return childRoutes(MainLayout)
};

export default Routes;
