import { createSlice } from "@reduxjs/toolkit";

type NotificationState = {
    notificationCounter: number;
    notificationText: string|null;
};

const initialState: NotificationState = {
    notificationCounter: 0,
    notificationText: null,
};

export const NotificationRedux = createSlice({
    name: "notification",
    initialState: initialState,

    reducers: {
        setNotification: (state, action) => {
            state.notificationText = action.payload;
            state.notificationCounter++;
        }
    }
});

export const { setNotification } = NotificationRedux.actions;

export default NotificationRedux.reducer;