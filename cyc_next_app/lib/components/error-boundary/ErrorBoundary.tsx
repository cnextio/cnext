import React from "react";
import Snackbar from "@mui/material/Snackbar";

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
                <Snackbar
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    autoHideDuration={6000}
                    open={true}
                    message="We're sorry, something went wrong!"
                    key={"Error_Boundary"}
                />
            );
        }

        // No errors were thrown
        return this.props.children;
    }
}

export default ErrorBoundary;
