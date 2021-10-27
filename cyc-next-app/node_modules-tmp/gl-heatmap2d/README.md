gl-heatmap2d
============
2D heatmaps

This version of gl-heatmap2d modifies Mikola Lysenko's original code to optionally produce a discretised heatmap instead of an interpolated one. The discretised heatmap modifications were made by Louise Ord (@ordiology).

An option, zsmooth, is introduced that defaults to the smoothed heatmap. If zsmooth: false is passed to createHeatmap2D, the discretised heatmap will be rendered.

Scientific data is often discretised and this option allows the data to be represented as measured rather than smoothing between observations.

# License
(c) 2015 Mikola Lysenko. MIT License
