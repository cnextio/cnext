export const process_plotly_figure_result = (fig_data) => {
    return JSON.parse(fig_data)["application/json"];
}

export const ifElseDict = (object: {}, key: string) => {
    return ((key in object) ? object[key] : {});
}