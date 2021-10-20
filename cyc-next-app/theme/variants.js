import { blue, green, grey, indigo, red, teal } from "@mui/material/colors";

const blueVariant = {
  name: "Blue",
  palette: {
    primary: {
      main: blue[800],
      contrastText: "#FFF"
    },
    secondary: {
      main: blue[600],
      contrastText: "#FFF"
    }
  },
  header: {
    color: grey[500],
    background: "#FFF",
    search: {
      color: grey[800]
    },
    indicator: {
      background: blue[600]
    }
  },
  sidebar: {
    color: "#FFF",
    background: blue[700],
    header: {
      color: "#FFF",
      background: blue[800],
      brand: {
        color: "#FFFFFF"
      }
    },
    footer: {
      color: "#FFF",
      background: blue[800],
      online: {
        background: "#FFF"
      }
    },
    category: {
      fontWeight: 400
    },
    badge: {
      color: "#000",
      background: "#FFF"
    }
  },
  body: {
    background: "#F7F9FC"
  }
};

const greenVariant = {
  name: "Green",
  palette: {
    primary: {
      main: green[800],
      contrastText: "#FFF"
    },
    secondary: {
      main: green[500],
      contrastText: "#FFF"
    }
  },
  header: {
    color: grey[500],
    background: "#FFF",
    search: {
      color: grey[800]
    },
    indicator: {
      background: green[500]
    }
  },
  sidebar: {
    color: "#FFF",
    background: green[700],
    header: {
      color: "#FFF",
      background: green[800],
      brand: {
        color: "#FFFFFF"
      }
    },
    footer: {
      color: "#FFF",
      background: green[800],
      online: {
        background: "#FFF"
      }
    },
    category: {
      fontWeight: 400
    },
    badge: {
      color: "#000",
      background: "#FFF"
    }
  },
  body: {
    background: "#F9F9FC"
  }
};

const indigoVariant = {
  name: "Indigo",
  palette: {
    primary: {
      main: indigo[600],
      contrastText: "#FFF"
    },
    secondary: {
      main: indigo[400],
      contrastText: "#FFF"
    }
  },
  header: {
    color: grey[500],
    background: "#FFF",
    search: {
      color: grey[800]
    },
    indicator: {
      background: indigo[500]
    }
  },
  sidebar: {
    color: "#FFF",
    background: indigo[600],
    header: {
      color: "#FFF",
      background: indigo[700],
      brand: {
        color: "#FFFFFF"
      }
    },
    footer: {
      color: "#FFF",
      background: indigo[700],
      online: {
        background: "#FFF"
      }
    },
    category: {
      fontWeight: 400
    },
    badge: {
      color: "#000",
      background: "#FFF"
    }
  },
  body: {
    background: "#F9F9FC"
  }
};

const tealVariant = {
  name: "Teal",
  palette: {
    primary: {
      main: teal[800],
      contrastText: "#FFF"
    },
    secondary: {
      main: teal[600],
      contrastText: "#FFF"
    }
  },
  header: {
    color: grey[500],
    background: "#FFF",
    search: {
      color: grey[800]
    },
    indicator: {
      background: teal[600]
    }
  },
  sidebar: {
    color: "#FFF",
    background: teal[700],
    header: {
      color: "#FFF",
      background: teal[800],
      brand: {
        color: "#FFFFFF"
      }
    },
    footer: {
      color: "#FFF",
      background: teal[800],
      online: {
        background: "#FFF"
      }
    },
    category: {
      fontWeight: 400
    },
    badge: {
      color: "#000",
      background: "#FFF"
    }
  },
  body: {
    background: "#F7F9FC"
  }
};

const lightVariant = {
  name: "Light",
  palette: {
    primary: {
      main: blue[800],
      contrastText: "#FFF"
    },
    secondary: {
      main: blue[600],
      contrastText: "#FFF"
    }
  },
  header: {
    color: grey[200],
    background: blue[800],
    search: {
      color: grey[100]
    },
    indicator: {
      background: red[700]
    }
  },
  sidebar: {
    color: grey[900],
    background: "#FFF",
    header: {
      color: "#FFF",
      background: blue[800],
      brand: {
        color: "#FFFFFF"
      }
    },
    footer: {
      color: grey[900],
      background: grey[100],
      online: {
        background: green[500]
      }
    },
    category: {
      fontWeight: 600
    },
    badge: {
      color: "#FFF",
      background: green[600]
    }
  },
  body: {
    background: "#F7F9FC"
  }
};

const darkVariant = {
  name: "Dark",
  palette: {
    primary: {
      main: blue[700],
      contrastText: "#FFF"
    },
    secondary: {
      main: blue[500],
      contrastText: "#FFF"
    }
  },
  header: {
    color: grey[500],
    background: "#FFFFFF",
    search: {
      color: grey[800]
    },
    indicator: {
      background: blue[600]
    }
  },
  sidebar: {
    color: grey[200],
    background: "#1B2430",
    header: {
      color: grey[200],
      background: "#232f3e",
      brand: {
        color: blue[500]
      }
    },
    footer: {
      color: grey[200],
      background: "#232f3e",
      online: {
        background: green[500]
      }
    },
    category: {
      fontWeight: 400
    },
    badge: {
      color: "#FFF",
      background: blue[500]
    }
  },
  body: {
    background: "#F7F9FC"
  }
};

const variants = [
  darkVariant,
  lightVariant,
  blueVariant,
  greenVariant,
  indigoVariant,
  tealVariant
];

export default variants;
