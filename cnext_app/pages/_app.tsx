import type { AppProps } from 'next/app'

import '../styles/global.css'
import "../styles/styles.css";
import Helmet from 'react-helmet';
import React, {useEffect} from 'react';
import PropTypes from 'prop-types';

import {
    createTheme,
    StyledEngineProvider,
    ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";

import {ThemeProvider} from "styled-components";

const theme =  createTheme();

import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  body {
    height: 100vh;
    margin:0;
  }`

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
      // Remove the server-side injected CSS.
      const jssStyles = document.querySelector('#jss-server-side');
      if (jssStyles)
        if(jssStyles.parentElement)
          jssStyles.parentElement.removeChild(jssStyles);
  }, []); 

  return (
      <React.Fragment>
          <GlobalStyle />
          <Helmet
              titleTemplate="%s | CycAI"
              defaultTitle="CycAI"
          />
          <StyledEngineProvider injectFirst>
              {/* <MuiPickersUtilsProvider utils={DateFnsUtils}> */}
                  <MuiThemeProvider theme={theme}>
                      <ThemeProvider theme={theme}>                            
                          <Component {...pageProps}/>
                      </ThemeProvider>
                  </MuiThemeProvider>
              {/* </MuiPickersUtilsProvider> */}
          </StyledEngineProvider>
      </React.Fragment>
  );
}

MyApp.propTypes = {
    Component: PropTypes.elementType.isRequired,
    pageProps: PropTypes.object.isRequired,
};
export default MyApp
