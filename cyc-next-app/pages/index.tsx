import { createTheme, StyledEngineProvider } from '@mui/material/styles';
import { ThemeProvider } from '@mui/styles';
// import { StylesProvider } from '@mui/styles';
import type { NextPage } from 'next'

import React from "react";
// import { connect } from "react-redux";
import Helmet from 'react-helmet';

import Routes from "./routes/Routes";

const theme =  createTheme({});

// redux
import { Provider } from 'react-redux';
import store from '../redux/store/index';

// global style
import { createGlobalStyle } from 'styled-components'
const GlobalStyle = createGlobalStyle`
  body {
    height: 100vh;
    margin:0;
  }`

const Home: NextPage = () => {
    return (
        <Provider store={store}>    
            <React.Fragment>
            <GlobalStyle />
            <Helmet
                titleTemplate="%s | CycAI"
                defaultTitle="CycAI - Inteligent Platform for Data Scientists"
            />
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <ThemeProvider theme={theme}>                        
                    <Routes store={store}/>
                    </ThemeProvider>
                </ThemeProvider>
            </StyledEngineProvider>
            </React.Fragment>
        </Provider>
    );
}

// export default App
export default Home;
