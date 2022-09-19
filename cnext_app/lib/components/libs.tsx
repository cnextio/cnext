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
export const isUrlValid = (url: string) => {
    var res = url.match(
        /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
    );
    if (res == null) return false;
    else return true;
};
export const emptyString = "";
