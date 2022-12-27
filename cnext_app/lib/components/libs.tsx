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
export const isDiffFile= (url: string) => {
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

export const isImageMime = (mimeType: string) => {
    const imgMimeRegex = new RegExp("image/", "i");
    return imgMimeRegex.test(mimeType);
};

export const setPlotlyLayout = (
    data: object | string | any,
    width: number | null = null,
    height: number | null = null,
    defaultMargin: boolean = true
) => {
    try {
        /* have to do JSON stringify and parse again to recover the original json string. It won't work without this */
        let inResultData = JSON.parse(JSON.stringify(data));
        inResultData["data"][0]["hovertemplate"] = "%{x}: %{y}";
        inResultData.layout.width = width ? width : inResultData.layout.width;
        inResultData.layout.height = height ? height : inResultData.layout.height;
        if (defaultMargin) {
            inResultData.layout.margin = { b: 10, l: 80, r: 30, t: 30 };
        } 
        inResultData["config"] = { displayModeBar: false };
        return inResultData;
    } catch {
        return null;
    }
};