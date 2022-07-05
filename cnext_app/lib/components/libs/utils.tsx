import { setNotification } from "../../../redux/reducers/NotificationRedux";
import { OPERATION_DISABLED_MSG } from "../../interfaces/IApp";
import store from "../../../redux/store";
import { isRunQueueBusy } from "../code-panel/libCodeEditor";

/** */
export const runQueueSafe = (event: React.MouseEvent, func) => {
    const runQueueBusy = isRunQueueBusy(store.getState().codeEditor.runQueue);
    if (runQueueBusy){
        store.dispatch(setNotification(OPERATION_DISABLED_MSG));
        event.preventDefault();
        event.stopPropagation();
    } else {
        func();
    }
}