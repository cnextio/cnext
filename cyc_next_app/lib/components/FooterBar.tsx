import React from "react";
import { FooterNavigation, FooterItem, FotterItemText } from "./StyledComponents";

const FooterBarComponent = () => {
    return (
        <FooterNavigation>
            <FooterItem>
                <FotterItemText>
                    Code AutoCompletion: <b>ON</b>
                </FotterItemText>
            </FooterItem>
            <FooterItem>
                <FotterItemText>
                    Lint: <b>ON</b>
                </FotterItemText>
            </FooterItem>
        </FooterNavigation>
    );
};

export default FooterBarComponent;
