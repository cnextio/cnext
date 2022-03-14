export const process_plotly_figure_result = (figData: string) => {
    return JSON.parse(figData)["application/json"];
};

export const ifElseDict = (object: {}, key: string) => {
    return ifElse(object, key, {});
};

export const ifElse = (object: {}, key: string, empty: any) => {
    return key in object ? object[key] : empty;
};

export const isJsonString = (data: string) => {
    try {
        JSON.parse(data);
    } catch (error) {
        return false;
    }
    return true;
};

/** Add string to list
 * If item is already exists in list, not push item to list
 */
export const addItemToList = (newItem: string, listItem: Array<string>) => {
    if (!listItem.includes(newItem)) {
        listItem.push(newItem);
    }
    return listItem;
};

export const emptyString = "";
