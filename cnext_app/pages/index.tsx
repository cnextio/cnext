import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import type { NextPage } from "next";
import React, { Fragment, useEffect } from "react";
import Helmet from "react-helmet";
import { Provider } from "react-redux";
import { Auth0Provider } from "@auth0/auth0-react";
import store from "../redux/store/index";
import Main from "../lib/components/Main";
import ErrorBoundary from "../lib/components/error-boundary/ErrorBoundary";
import { createGlobalStyle, ThemeProvider as StyledThemeProvider } from "styled-components";
const GlobalStyle = createGlobalStyle`
  body {
    height: 100vh;
    margin:0;
  }`;

const theme = createTheme({});

const Home: NextPage = () => {
    useEffect(() => {
        if (typeof window !== "undefined") {
            window.logs = [];
            console.oldLog = console.log;
            console.log = function (value, ...optionalParams) {
                console.oldLog(value, ...optionalParams);
                window.logs.push(value);
                // window.logs.push(...optionalParams);
            };
        }
    }, []);

    return (
        <Fragment>
            <Auth0Provider
                domain="dev-r6dezw30.us.auth0.com"
                clientId="MoyhDEIlW3YI87mLieDmgodcFOl0htLQ"
                redirectUri={"http://localhost:3000"}
            >
                <Provider store={store}>
                    <React.Fragment>
                        <GlobalStyle />
                        <Helmet
                            titleTemplate="%s | CNext"
                            defaultTitle="CNext - The Data-Centric Workspace for DS and AI Workflows"
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
            </Auth0Provider>
        </Fragment>
    );
};

// export default App
export default Home;
