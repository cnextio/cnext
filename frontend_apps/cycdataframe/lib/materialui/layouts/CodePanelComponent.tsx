import { Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { CodeArea, CodePanel, CodeToolbar } from "./StyledComponents";
import WorkingPanelDividerComponent from "./WorkingPanelDivider";

const Editor = (props: any) => {
    if (typeof window !== 'undefined') {
      const AceEditor = require('react-ace').default;
      require('ace-builds/src-noconflict/mode-python');
      require('ace-builds/src-noconflict/theme-xcode');
  
      return <AceEditor {...props}/>
    }
  
    return null;
  }
  

const CodePanelComponent = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    });

    return (
        <CodePanel>
            <CodeToolbar>                
            </CodeToolbar>
            <WorkingPanelDividerComponent />
            <CodeArea>
                {mounted ?
                <Editor
                    placeholder="Placeholder Text"
                    mode="python"
                    theme="xcode"
                    name="CodeEditor"
                    // onLoad={this.onLoad}
                    // onChange={this.onChange}
                    fontSize={14}
                    showPrintMargin={true}
                    showGutter={true}
                    highlightActiveLine={true}
                    value={`def hellow_world: \n\tprint("Hello world"); \n\t`}
                    setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true,
                        showLineNumbers: true,
                        tabSize: 2,
                    }}
                    width="100%"
                /> 
                : null}
            </CodeArea>
        </CodePanel>
    );
  };
  
  export default CodePanelComponent;


