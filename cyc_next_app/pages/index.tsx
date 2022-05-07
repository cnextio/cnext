// import '../node_modules/react-grid-layout/css/styles.css';
// import '../node_modules/react-resizable/css/styles.css';
// import "font-awesome/css/font-awesome.css";
// import "@lumino/widgets/style/index.css";
// import "../lib/@jupyter-widgets/controls/css/widgets-base.css";
// import "@jupyter-widgets/controls/css/labvariables.css";
// import "@jupyter-widgets/html-manager/css/output.css";

import { createTheme, StyledEngineProvider, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import type { NextPage } from 'next';
import React from "react";
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import store from '../redux/store/index';
import Main from '../lib/components/Main';
import ErrorBoundary from "../lib/components/error-boundary/ErrorBoundary";
// import themes from '../theme';
// global style
import { createGlobalStyle, ThemeProvider as StyledThemeProvider } from "styled-components";
const GlobalStyle = createGlobalStyle`
  body {
    height: 100vh;
    margin:0;
  }`;

const theme = createTheme({});

const Home: NextPage = () => {
    // useEffect(() => {
    //     // Remove the server-side injected CSS.
    //     const jssStyles = document.querySelector('#jss-server-side');
    //     if (jssStyles)
    //       if(jssStyles.parentElement)
    //         jssStyles.parentElement.removeChild(jssStyles);
    // }, []);

    return (
        <Provider store={store}>
            <React.Fragment>
                <GlobalStyle />
                <Helmet
                    titleTemplate='%s | CNext'
                    defaultTitle='CNext - A Data-Centric Platform for DS and AI'
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
