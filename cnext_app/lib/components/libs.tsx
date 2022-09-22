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
export const isUrlFileDiff = (url: string) => {
    let parse = parseUrl(url);
    if (parse.path && parse.params?.diff_view) return true;
    return false;
};
export const parseUrl = (url: string) => {
    const splitUrl = url.split("?"); //get path
    const path = splitUrl[0];
    let params = {};
    if (splitUrl.length > 1) {
        params = Object.fromEntries(new URLSearchParams(splitUrl[1])); // ?search=&
    }
    return { path, params };
};
export const emptyString = "";
