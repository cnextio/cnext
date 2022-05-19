import React from "react";
import { FooterNavigation, FooterItem, FotterItemText } from "./StyledComponents";

const FooterBarComponent = () => {
    return (
        <FooterNavigation>
            <FooterItem>
                <FotterItemText>
                    Code AutoCompletion: ON
                </FotterItemText>
            </FooterItem>
            <FooterItem>
                <FotterItemText>
                    Lint: ON
                </FotterItemText>
            </FooterItem>
        </FooterNavigation>
    );
};

export default FooterBarComponent;
