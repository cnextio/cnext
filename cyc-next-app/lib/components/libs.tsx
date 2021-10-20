export const process_plotly_figure_result = (fig_data) => {
    return JSON.parse(fig_data)["application/json"];
}