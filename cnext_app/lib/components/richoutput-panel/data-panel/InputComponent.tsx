import { SyntheticEvent, useContext } from "react";
import { useDispatch } from "react-redux";
import { setTableDataCellValue } from "../../../../redux/reducers/DataFramesRedux";
import { CommandName, SpecialMimeType } from "../../../interfaces/IApp";
import {
    ICellDataCheckboxInput,
    ICellDataSelectionInput,
    ICellDataTextInput,
} from "../../../interfaces/IDataFrameManager";
import { createMessage, sendMessage } from "../../dataframe-manager/libDataFrameManager";
import { SocketContext } from "../../Socket";
import InputCheckbox from "./InputCheckbox";
import InputSelection from "./InputSelection";
import InputText from "./InputText";

const InputComponent = ({ df_id, rowNumber, colName, index, item, type }) => {
    const socket = useContext(SocketContext);
    const dispatch = useDispatch();

    const handleChange = (input: any) => {
        const value = { ...item, input: input };
        dispatch(
            setTableDataCellValue({
                df_id: df_id,
                col_name: colName,
                rowNumber: rowNumber,
                value: value,
            })
        );
        const message = createMessage(
            CommandName.set_dataframe_cell_value,
            { df_id: df_id, index: index, col_name: colName, value: value },
            { df_id: df_id, col_name: colName }
        );
        sendMessage(socket, message);
    };

    return (
        <>
            {[SpecialMimeType.INPUT_SELECTION].includes(type) && (
                <InputSelection
                    {...(item as ICellDataSelectionInput)}
                    handleChange={handleChange}
                />
            )}
            {[SpecialMimeType.INPUT_CHECKBOX].includes(type) && (
                <InputCheckbox {...(item as ICellDataCheckboxInput)} handleChange={handleChange} />
            )}
            {[SpecialMimeType.INPUT_TEXT].includes(type) && (
                <InputText {...(item as ICellDataTextInput)} handleChange={handleChange} />
            )}
        </>
    );
};

export default InputComponent;
