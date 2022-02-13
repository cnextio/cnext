import React from 'react';
import './App.css';

// third-part import
import CodeMirror from "components/CodeMirror/Editor.js";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';

export default function CodeComponent() {
  const [editorValue, setEditorValue] = React.useState(null)
  const [code, setCode]= React.useState(
`
from fastapi import FastAPI

app = FastAPI()
  
    
@app.get("/")
async def root():
    return {"message": "Hell"}
`
  );
  return [
    <div>
      <GridContainer>
        <GridItem xs={3} sm={3} md={3} lg={3}>
          {/* <Button
            color="secondary"
            onClick={()=> {setEditorValue('btt 1');}}>
              populate editorvalue1
          </Button> */}
        </GridItem>
        <GridItem xs={3} sm={3} md={3} lg={3}>
          {/* <Button
            color="secondary"
            onClick={()=> {setEditorValue('2 is for the win');}}>
              populate editorvalue2
          </Button> */}
        </GridItem>
        <GridItem xs={3} sm={3} md={3} lg={3}>
          {/* <Button
            color="primary"
            onClick={()=> {setCode('seriously3 1');}}>
              populate code1
          </Button> */}
        </GridItem>
        <GridItem xs={3} sm={3} md={3} lg={3}>
          {/* <Button
            color="primary"
            onClick={()=> {setCode(`"""add some docstring"""



`);}}>
              populate code2
          </Button> */}
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={6} sm={6} md={6} lg={6}>
          <Card>
            <CardContent>
              <p><strong>&lt;code&gt; state</strong></p>
              {code}
            </CardContent>
          </Card>
        </GridItem>
        <GridItem xs={6} sm={6} md={6} lg={6}>
          <Card>
            <CardContent>
              <p><strong>&lt;editor_state&gt; state</strong></p>
              {editorValue}
            </CardContent>
          </Card>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <Card>
            <CardContent>
              <p> Code Editor Sample </p>
              <CodeMirror
                // value={editorValue}
                value2={code}
                onUpdate={(v) => {
                  if (v.docChanged) {                    
                    setEditorValue(v.state.doc.toString());
                  }
                }}
              />
            </CardContent>
          </Card>
        </GridItem>
      </GridContainer>
    </div>,
  ];
}