import { createTheme } from "@mui/material/styles";

import variants from "./variants";
import typography from "./typography";
import overrides from "./overrides";
import breakpoints from "./breakpoints";
import props from "./props";
import shadows from "./shadows";

const theme = variant => {
  return createTheme(
    {
      spacing: 4,
      breakpoints: breakpoints,
      overrides: overrides,
      props: props,
      typography: typography,
      shadows: shadows,
      body: variant.body,
      header: variant.header,
      palette: variant.palette,
      sidebar: variant.sidebar
    },
    variant.name
  );
};

const themes = variants.map(variant => theme(variant));

export default themes;
