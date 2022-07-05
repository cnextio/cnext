import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { toast, Slide } from "react-toastify";
import store, { RootState } from "../../../redux/store";
import { StyledDFStatusNotification } from "../StyledComponents";
import "react-toastify/dist/ReactToastify.css";

export const Notifier = () => {
    const notificationCounter = useSelector((state: RootState)=>{return state.notification.notificationCounter});

    useEffect(()=>{
        const notificationText = store.getState().notification.notificationText;
        toast(notificationText);
        console.log("Notifier: ", notificationText);
    }, [notificationCounter]);

    return (
        <StyledDFStatusNotification
            transition={Slide}
            hideProgressBar={true}
            position="bottom-right"
            autoClose={2000}
        />
    );
}