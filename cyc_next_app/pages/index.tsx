import { createTheme, StyledEngineProvider, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import type { NextPage } from 'next';
import React from "react";
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import store from '../redux/store/index';
import Main from '../lib/components/Main';
import ErrorBoundary from "../lib/components/error-boundary/ErrorBoundary";
import { createGlobalStyle, ThemeProvider as StyledThemeProvider } from "styled-components";
const GlobalStyle = createGlobalStyle`
  body {
    height: 100vh;
    margin:0;
  }`;

const theme = createTheme({});

const Home: NextPage = () => {
    return (
        <Provider store={store}>
            <React.Fragment>
                <GlobalStyle />
                <Helmet
                    titleTemplate='%s | CNext'
                    defaultTitle='CNext - A Data-Centric Platform for DS and AI Workflows'
                />
                <StyledEngineProvider injectFirst>
                    <StyledThemeProvider theme={theme}>
                        <MuiThemeProvider theme={theme}>
                            <ErrorBoundary>
                                <Main />
                            </ErrorBoundary>
                        </MuiThemeProvider>
                    </StyledThemeProvider>
                </StyledEngineProvider>
            </React.Fragment>
        </Provider>
    );
};

// export default App
export default Home;
