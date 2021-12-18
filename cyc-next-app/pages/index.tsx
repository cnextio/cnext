import { createTheme, StyledEngineProvider, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
// import { ThemeProvider as MuiThemeProvider } from '@mui/styles';
import type { NextPage } from 'next'
import React, { useEffect } from "react";
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import store from '../redux/store/index';
import Main from '../lib/components/Main';
// import themes from '../theme';
// global style
import { createGlobalStyle, ThemeProvider as StyledThemeProvider } from 'styled-components'
import { CssBaseline } from '@mui/material';
import props from '../theme/props';
const GlobalStyle = createGlobalStyle`
  body {
    height: 100vh;
    margin:0;
  }`

const theme =  createTheme({});

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
                    titleTemplate="%s | CycAI"
                    defaultTitle="CycAI - Inteligent Platform for Data Scientists"
                />
                <StyledEngineProvider injectFirst>
                    <StyledThemeProvider theme={theme}>
                        <MuiThemeProvider theme={theme}>    
                            {/* <CssBaseline/>     */}
                            <Main/>
                        </MuiThemeProvider>
                    </StyledThemeProvider>
                </StyledEngineProvider>
            </React.Fragment>
        </Provider>
    );
}

// export default App
export default Home;
