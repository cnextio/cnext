import React from "react";
import { Typography } from "@mui/material";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.log(error);
        console.log(errorInfo);
    }

    render() {
        if (this.state.hasError) {
            //render any fallback UI
            return (
                <div style={{ textAlign: "center" }}>
                    <Typography>We're sorry, something went wrong!</Typography>
                    <a href='/'>Back to page</a>
                </div>
            );
        }

        // No errors were thrown
        return this.props.children;
    }
}

export default ErrorBoundary;
