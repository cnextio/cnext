### Manually installed lib
clone [codemirror-languageserver](https://github.com/FurqanSoftware/codemirror-languageserver)
then fix depencies as follows:
```
-    "@codemirror/autocomplete": "^0.18.6",
-    "@codemirror/lint": "^0.18.3",
-    "@codemirror/state": "^0.18.7",
-    "@codemirror/tooltip": "^0.18.4",
-    "@codemirror/view": "^0.18.15",
+    "@codemirror/autocomplete": "0.19.3",
+    "@codemirror/lint": "^0.19.2",
+    "@codemirror/state": "^0.19.2",
+    "@codemirror/tooltip": "^0.19.2",
+    "@codemirror/view": "^0.19.9",
```

### Run web app
`npm run dev`

### Run server
Currently `server.js` is hard coded with some folder name where the library `cycdataframe.py` is stored.

Check for this line:
```
pyshell.send({request_originator: CodeAreaComponent, 
                        command: "import os, sys; os.chdir('../../../cyc-dataframe/'); sys.path.append(os.getcwd()); from cycdataframe.cycdataframe import CycDataFrame"});
```

The folder `../../../cyc-dataframe/` should point to where you cloned the `cyc-dataframe` repos.

```
cd server
npm start
```

