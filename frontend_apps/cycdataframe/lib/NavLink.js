// TODO: current implementation still create some warning.
//  ActiveLink is not the best replacement of react.NavLInk
import React from "react";
import ActiveLink from "./ActiveLink";
import {Link as MuiLink} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    link: {
        'text-decoration': 'none',
        '&:hover': {
            'text-decoration': 'none'
        }
    },
})

const NavLink = React.forwardRef((props, ref) => {
   const classes = makeStyles();
  return (
      <ActiveLink passHref {...props}>
        <a ref={ref} {...props} />
      </ActiveLink>
      // <RouterNavLink innerRef={ref} {...props} />
  )}
);

export default NavLink;