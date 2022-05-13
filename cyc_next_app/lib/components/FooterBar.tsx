import React from "react";
import { FooterNavigation, FooterItem, FotterItemText } from "./StyledComponents";

const FooterBarComponent = () => {
    return (
        <FooterNavigation>
            <FooterItem>
                <FotterItemText>
                    Suggestion: <b>ON</b>
                </FotterItemText>
            </FooterItem>
        </FooterNavigation>
    );
};

export default FooterBarComponent;
