import { useDispatch, useSelector } from "react-redux";
import * as React from "react";
import { useAutocomplete, AutocompleteGetTagProps } from "@mui/base/AutocompleteUnstyled";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { autocompleteClasses } from "@mui/material/Autocomplete";
import { RootState } from "../../../../redux/store";
import { Box } from "@mui/system";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const Root = styled("div")(
    ({ theme }) => `
  color: ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,.85)"};
  font-size: 14px;
`
);

const Label = styled("label")`
    padding: 0 0 4px;
    line-height: 1.5;
    display: block;
    font-weight: bold;
`;

const InputWrapper = styled("div")(
    ({ theme }) => `
  width: 300px;
  border: 1px solid ${theme.palette.mode === "dark" ? "#434343" : "#d9d9d9"};
  background-color: ${theme.palette.mode === "dark" ? "#141414" : "#fff"};
  border-radius: 4px;
  padding: 1px;
  display: flex;
  flex-wrap: wrap;

//   &:hover {
//     border-color: ${theme.palette.mode === "dark" ? "#177ddc" : "#40a9ff"};
//   }

//   &.focused {
//     border-color: ${theme.palette.mode === "dark" ? "#177ddc" : "#40a9ff"};
//     box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
//   }

  & input {
    background-color: ${theme.palette.mode === "dark" ? "#141414" : "#fff"};
    color: ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,.85)"};
    height: 30px;
    box-sizing: border-box;
    padding: 4px 6px;
    width: 0;
    min-width: 30px;
    flex-grow: 1;
    border: 0;
    margin: 0;
    outline: 0;
  }
`
);

interface TagProps extends ReturnType<AutocompleteGetTagProps> {
    label: string;
}

function Tag(props: TagProps) {
    const { label, onDelete, ...other } = props;
    return (
        <div {...other}>
            <span>{label}</span>
            <CloseIcon onClick={onDelete} />
        </div>
    );
}

const StyledTag = styled(Tag)<TagProps>(
    ({ theme }) => `
  display: flex;
  align-items: center;
  height: 24px;
  margin: 2px;
  line-height: 22px;
  background-color: ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#fafafa"};
  border: 1px solid ${theme.palette.mode === "dark" ? "#303030" : "#e8e8e8"};
  border-radius: 2px;
  box-sizing: content-box;
  padding: 0 4px 0 10px;
  outline: 0;
  overflow: hidden;

  &:focus {
    border-color: ${theme.palette.mode === "dark" ? "#177ddc" : "#40a9ff"};
    background-color: ${theme.palette.mode === "dark" ? "#003b57" : "#e6f7ff"};
  }

  & span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & svg {
    font-size: 12px;
    cursor: pointer;
    padding: 4px;
  }
`
);

const Listbox = styled("ul")(
    ({ theme }) => `
  width: 300px;
  margin: 2px 0 0;
  padding: 0;
  position: absolute;
  list-style: none;
  background-color: ${theme.palette.mode === "dark" ? "#141414" : "#fff"};
  overflow: auto;
  max-height: 250px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;

  & li {
    padding: 5px 12px;
    display: flex;

    & span {
      flex-grow: 1;
    }

    & svg {
      color: transparent;
    }
  }

  & li[aria-selected='true'] {
    background-color: ${theme.palette.mode === "dark" ? "#2b2b2b" : "#fafafa"};
    font-weight: 600;

    & svg {
      color: #1890ff;
    }
  }

  & li.${autocompleteClasses.focused} {
    background-color: ${theme.palette.mode === "dark" ? "#003b57" : "#e6f7ff"};
    cursor: pointer;

    & svg {
      color: currentColor;
    }
  }
`
);

export default function SelectVIZ() {
    const dispatch = useDispatch();
    const activeDataFrame = useSelector((state: RootState) => state.dataFrames.activeDataFrame);
    const metadata = useSelector((state: RootState) => state.dataFrames.metadata);
    const columns = useSelector(
        (state: RootState) => state.dataFrames.metadata[activeDataFrame]?.columns
    );

    const {
        getRootProps,
        getInputLabelProps,
        getInputProps,
        getTagProps,
        getListboxProps,
        getOptionProps,
        groupedOptions,
        value,
        focused,
        setAnchorEl,
    } = useAutocomplete({
        id: "customized-hook-demo",
        defaultValue: [],
        multiple: true,
        options: Object.keys(columns),
        getOptionLabel: (option) => option,
    });
    const [age, setAge] = React.useState("");

    const handleChange = (event: any) => {
        setAge(event.target.value as string);
    };

    return (
        <Root>
            <div {...getRootProps()}>
                <Label {...getInputLabelProps()}>X Axis</Label>
                <InputWrapper ref={setAnchorEl} className={focused ? "focused" : ""}>
                    {value.map((option: any, index: number) => (
                        <StyledTag label={option} {...getTagProps({ index })} />
                    ))}
                    <input {...getInputProps()} />
                </InputWrapper>
            </div>
            {groupedOptions.length > 0 ? (
                <Listbox {...getListboxProps()}>
                    {Object.keys(columns).map((option, index) => (
                        <li {...getOptionProps({ option, index })}>
                            <span>{option}</span>
                            <CheckIcon fontSize="small" />
                        </li>
                    ))}
                </Listbox>
            ) : null}

            <div style={{marginTop:20}}>
                <Label {...getInputLabelProps()}>Y Axis</Label>
                <Box sx={{ minWidth: 120 }}>
                    <FormControl fullWidth>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={age}
                            label="Age"
                            onChange={handleChange}
                        >
                            <MenuItem value={10}>Alley</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </div>
        </Root>
    );
}
