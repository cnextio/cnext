import React, { useEffect, useRef, useState } from "react";
import { DiffEditor, useMonaco } from "@monaco-editor/react";
import { useDispatch, useSelector } from "react-redux";
import store, { RootState } from "../../../../redux/store";
import {
    execLines,
    foldAll,
    unfoldAll,
    getMainEditorModel,
    setCodeTextAndStates,
    setHTMLEventHandler,
    setLineStatus,
    getCodeText,
} from "./libCodeEditor";
import { setCellWidgets } from "./libCellWidget";
import { setCellDeco } from "./libCellDeco";
import { MonacoEditor as StyledMonacoEditor } from "../styles";
import {
    CellCommand,
    CodeInsertMode,
    ICodeLineGroupStatus,
    ICodeResultMessage,
    ICodeToInsertInfo,
    ILineUpdate,
    LineStatus,
    RunQueueStatus,
    SetLineGroupCommand,
} from "../../../interfaces/ICodeEditor";
import {
    addResult,
    clearAllOutputs,
    clearRunQueue,
    removeFirstItemFromRunQueue,
    setCellCommand,
    setRunQueueStatus,
    updateLines,
    setActiveLine as setActiveLineRedux,
    setLineGroupStatus,
} from "../../../../redux/reducers/CodeEditorRedux";
import { IMessage, WebAppEndpoint } from "../../../interfaces/IApp";
import socket from "../../Socket";
import { addToRunQueueHoverCell, addToRunQueueHoverLine } from "./libRunQueue";
import { getCellFoldRange } from "./libCellFold";
import { CodeInsertStatus } from "../../../interfaces/ICAssist";

const CodeEditor = ({ stopMouseEvent }) => {
    const monaco = useMonaco();
    const showGitManager = useSelector((state: RootState) => state.projectManager.showGitManager);
    const [original, setOriginal] = useState(`import pandas as pd
    from math import log, sqrt
    import numpy as np
    from bokeh.plotting import figure, show
    from bokeh.io import output_notebook
    output_notebook() 
    df = pd.read_csv('~/.bokeh/data/antibiotics.csv')
    drug_color = dict([
        ("Penicillin",   "#0d3362"),
        ("Streptomycin", "#c64737"), 
        ("Neomycin",     "black"  ),
    ])
    
    gram_color = dict([
        ("negative", "#e69584"),
        ("positive", "#aeaeb8"),
    ])
    
    width = 500
    height = 500
    inner_radius = 90
    outer_radius = 300 - 10
    
    minr = sqrt(log(.001 * 1E4))
    maxr = sqrt(log(1000 * 1E4))
    a = (outer_radius - inner_radius) / (minr - maxr)
    b = inner_radius - a * maxr
    
    def rad(mic):
        return a * np.sqrt(np.log(mic * 1E4)) + b
    
    big_angle = 2.0 * np.pi / (len(df) + 1)
    small_angle = big_angle / 7
    
    p = figure(width=width, height=height, title="",
        x_axis_type=None, y_axis_type=None,
        x_range=(-420, 420), y_range=(-420, 420),
        min_border=0, outline_line_color="blue",
        background_fill_color="#f0e1d2")
    
    p.xgrid.grid_line_color = None
    p.ygrid.grid_line_color = None
    
    # annular wedges
    angles = np.pi/2 - big_angle/2 - df.index.to_series()*big_angle
    colors = [gram_color[gram] for gram in df[' Gram']]
    p.annular_wedge(
        0, 0, inner_radius, outer_radius, -big_angle+angles, angles, color=colors,
    )
    
    # small wedges
    p.annular_wedge(0, 0, inner_radius, rad(df[' Penicillin']),
                    -big_angle+angles+5*small_angle, -big_angle+angles+6*small_angle,
                    color=drug_color['Penicillin'])
    p.annular_wedge(0, 0, inner_radius, rad(df[' Streptomycin']),
                    -big_angle+angles+3*small_angle, -big_angle+angles+4*small_angle,
                    color=drug_color['Streptomycin'])
    p.annular_wedge(0, 0, inner_radius, rad(df[' Neomycin']),
                    -big_angle+angles+1*small_angle, -big_angle+angles+2*small_angle,
                    color=drug_color['Neomycin'])
    
    # circular axes and lables
    labels = np.power(10.0, np.arange(-3, 4))
    radii = a * np.sqrt(np.log(labels * 1E4)) + b
    p.circle(0, 0, radius=radii, fill_color=None, line_color="white")
    p.text(0, radii[:-1], [str(r) for r in labels[:-1]],
           text_font_size="11px", text_align="center", text_baseline="middle")
    
    # radial axes
    p.annular_wedge(0, 0, inner_radius-10, outer_radius+10,
                    -big_angle+angles, -big_angle+angles, color="black")
    
    # bacteria labels
    xr = radii[0]*np.cos(np.array(-big_angle/2 + angles))
    yr = radii[0]*np.sin(np.array(-big_angle/2 + angles))
    label_angle=np.array(-big_angle/2+angles)
    label_angle[label_angle < -np.pi/2] += np.pi # easier to read labels on the left side
    p.text(xr, yr, df['Bacteria'], angle=label_angle,
           text_font_size="12px", text_align="center", text_baseline="middle")
    
    # OK, these hand drawn legends are pretty clunky, will be improved in future release
    p.circle([-40, -40], [-370, -390], color=list(gram_color.values()), radius=5)
    p.text([-30, -30], [-370, -390], text=["Gram-" + gr for gr in gram_color.keys()],
           text_font_size="9px", text_align="left", text_baseline="middle")
    
    p.rect([-40, -40, -40], [18, 0, -18], width=30, height=13,
           color=list(drug_color.values()))
    p.text([-15, -15, -15], [18, 0, -18], text=list(drug_color),
           text_font_size="12px", text_align="left", text_baseline="middle")
    
    show(p)
    # ## This is  a demo of Matplotlib
    # ### this is the narative mode
    import numpy as np
    import matplotlib.pyplot as plt
    plt.plot([1,2,1,2])
    plt.title("GRID REPRESENTATION")
    plt.xlabel("X-axis")
    plt.ylabel("Y-axis")
    import matplotlib.pyplot as plt
    x = [1,2,3,4,5]
    y = [50,40,70,80,20]
    y2 = [80,20,20,50,60]
    y3 = [70,20,60,40,60]
    y4 = [80,20,20,50,60]
    plt.plot(x,y,"g",label="Enfield", linewidth=5)
    plt.plot(x,y2,"c",label="Honda",linewidth=5)
    plt.plot(x,y3,"k",label="Yahama",linewidth=5)
    plt.plot(x,y4,"y",label="KTM",linewidth=5)
    plt.title("bike details in line plot")
    plt.ylabel(" Distance in kms")
    plt.xlabel("Days")
    plt.legend()
    
    `);
    const [modified, setModified] = useState(`import os
    import pandas as pd
    from math import log, sqrt
    import numpy as np
    from bokeh.plotting import figure, show
    // from bokeh.io import output_notebook
    output_notebook() 
    df = pd.read_csv('~/.bokeh/data/antibiotics.csv')
    drug_color = dict([
        ("Penicillin",   "#0d3362"),
        ("Streptomycin", "#c64737"), 
        ("Neomycin",     "black"  ),
    ])
    
    gram_color = dict([
        ("negative", "#e69584"),
    ])
    
    width = 500
    height = 500
    inner_radius = 90
    outer_radius = 300 - 10
    other_radius = 500
    
    minr = sqrt(log(.001 * 1E4))
    maxr = sqrt(log(1000 * 1E4))
    a = (outer_radius - inner_radius) / (minr - maxr)
    b = inner_radius - a * maxr
    c = inner_radius - b * maxr
    c = inner_radius - c * maxr

    def rad(mic):
        return a * np.sqrt(np.log(mic * 1E4)) + b
    
    big_angle = 2.0 * np.pi / (len(df) + 1)
    small_angle = big_angle / 7
    
    p = figure(width=width, height=height, title="",
        x_axis_type=None, y_axis_type=None,
        x_range=(-420, 420), y_range=(-420, 420),
        min_border=0, outline_line_color="blue",
        background_fill_color="#f0e1d2")
    
    p.xgrid.grid_line_color = None
    p.ygrid.grid_line_color = None
    
    # annular wedges
    angles = np.pi/2 - big_angle/2 - df.index.to_series()*big_angle
    colors = [gram_color[gram] for gram in df[' Gram']]
    p.annular_wedge(
        0, 0, inner_radius, outer_radius, -big_angle+angles, angles, color=colors,
    )
    
    # small wedges
    p.annular_wedge(0, 0, inner_radius, rad(df[' Penicillin']),
                    -big_angle+angles+5*small_angle, -big_angle+angles+6*small_angle,
                    color=drug_color['Penicillin'])
    p.annular_wedge(0, 0, inner_radius, rad(df[' Streptomycin']),
                    -big_angle+angles+3*small_angle, -big_angle+angles+4*small_angle,
                    color=drug_color['Streptomycin'])
    p.annular_wedge(0, 0, inner_radius, rad(df[' Neomycin']),
                    -big_angle+angles+1*small_angle, -big_angle+angles+2*small_angle,
                    color=drug_color['Neomycin'])
    
    # circular axes and lables
    labels = np.power(10.0, np.arange(-3, 4))
    radii = a * np.sqrt(np.log(labels * 1E4)) + b
    p.circle(0, 0, radius=radii, fill_color=None, line_color="white")
    p.text(0, radii[:-1], [str(r) for r in labels[:-1]],
           text_font_size="11px", text_align="center", text_baseline="middle")
    
    # radial axes
    p.annular_wedge(0, 0, inner_radius-10, outer_radius+10,
                    -big_angle+angles, -big_angle+angles, color="black")
    
    # bacteria labels
    xr = radii[0]*np.cos(np.array(-big_angle/2 + angles))
    yr = radii[0]*np.sin(np.array(-big_angle/2 + angles))
    label_angle=np.array(-big_angle/2+angles)
    label_angle[label_angle < -np.pi/2] += np.pi # easier to read labels on the left side
    p.text(xr, yr, df['Bacteria'], angle=label_angle,
           text_font_size="12px", text_align="center", text_baseline="middle")
    
    # OK, these hand drawn legends are pretty clunky, will be improved in future release
    p.circle([-40, -40], [-370, -390], color=list(gram_color.values()), radius=5)
    p.text([-30, -30], [-370, -390], text=["Gram-" + gr for gr in gram_color.keys()],
           text_font_size="9px", text_align="left", text_baseline="middle")
    
    p.rect([-40, -40, -40], [18, 0, -18], width=30, height=13,
           color=list(drug_color.values()))
    p.text([-15, -15, -15], [18, 0, -18], text=list(drug_color),
           text_font_size="12px", text_align="left", text_baseline="middle")
    
    show(p)
    # ## This is  a demo of Matplotlib
    # ### this is the narative mode
    import numpy as np
    import matplotlib.pyplot as plt
    plt.plot([1,2,1,2])
    plt.title("GRID REPRESENTATION")
    plt.xlabel("X-axis")
    plt.ylabel("Y-axis")
    import matplotlib.pyplot as plt
    x = [1,2,3,4,5]
    y = [50,40,70,80,20]
    y2 = [80,20,20,50,60]
    y3 = [70,20,60,40,60]
    y4 = [80,20,20,50,60]
    plt.plot(x,y,"g",label="Enfield", linewidth=5)
    plt.plot(x,y2,"c",label="Honda",linewidth=5)
    plt.plot(x,y3,"k",label="Yahama",linewidth=5)
    plt.plot(x,y4,"y",label="KTM",linewidth=5)
    plt.title("bike details in line plot")
    plt.ylabel(" Distance in kms")
    plt.xlabel("Days")
    plt.legend()
    
    `);
    const serverSynced = useSelector((state: RootState) => state.projectManager.serverSynced);
    const executorRestartCounter = useSelector(
        (state: RootState) => state.executorManager.executorRestartCounter
    );
    const inViewID = useSelector((state: RootState) => state.projectManager.inViewID);
    /** this is used to save the state such as scroll pos and folding status */
    const [curInViewID, setCurInViewID] = useState<string | null>(null);
    const activeProjectID = useSelector(
        (state: RootState) => state.projectManager.activeProject?.id
    );
    /** using this to trigger refresh in gutter */
    const codeText = useSelector((state: RootState) => getCodeText(state));

    const cellAssocUpdateCount = useSelector(
        (state: RootState) => state.codeEditor.cellAssocUpdateCount
    );
    const runQueue = useSelector((state: RootState) => state.codeEditor.runQueue);
    // const cAssistInfo = useSelector((state: RootState) => state.codeEditor.cAssistInfo);
    // const codeToInsert = useSelector((state: RootState) => state.codeEditor.codeToInsert);
    const [codeToInsert, setCodeToInsert] = useState<ICodeToInsertInfo | null>(null);

    /** using this to trigger refresh in group highlight */
    const activeGroup = useSelector((state: RootState) => state.codeEditor.activeGroup);

    const shortcutKeysConfig = useSelector(
        (state: RootState) => state.projectManager.settings.code_editor_shortcut
    );

    const lineStatusUpdate = useSelector(
        (state: RootState) => state.codeEditor.lineStatusUpdateCount
    );
    // const mouseOverGroupID = useSelector((state: RootState) => state.codeEditor.mouseOverGroupID);
    const cellCommand = useSelector((state: RootState) => state.codeEditor.cellCommand);

    // const [cmUpdatedCounter, setCMUpdatedCounter] = useState(0);

    // const [cAssistInfo, setCAssistInfo] = useState<ICAssistInfo|undefined>();
    const dispatch = useDispatch();

    /** this state is used to indicate when the codemirror view needs to be loaded from internal source
     * i.e. from codeText */
    const [codeReloading, setCodeReloading] = useState<boolean>(true);

    const [editor, setEditor] = useState(null);

    const insertCellBelow = (mode: CodeInsertMode, ln0based: number | null): boolean => {
        let model = getMainEditorModel(monaco);
        let lnToInsertAfter;
        let state = store.getState();
        const inViewID = state.projectManager.inViewID;
        let posToInsertAfter;

        if (ln0based) {
            lnToInsertAfter = ln0based + 1;
        } else {
            lnToInsertAfter = editor.getPosition().lineNumber;
        }

        if (model && inViewID) {
            const codeLines = state.codeEditor.codeLines[inViewID];
            let curGroupID = codeLines[lnToInsertAfter - 1].groupID;

            while (
                curGroupID != null &&
                lnToInsertAfter <
                    codeLines.length + 1 /** note that lnToInsertAfter is 1-based */ &&
                codeLines[lnToInsertAfter - 1].groupID === curGroupID
            ) {
                lnToInsertAfter += 1;
            }

            if (lnToInsertAfter === 1 || curGroupID == null) {
                /** insert from the end of the current line */
                posToInsertAfter = model?.getLineLength(lnToInsertAfter) + 1;
            } else {
                /** insert from the end of the prev line */
                lnToInsertAfter -= 1;
                posToInsertAfter = model?.getLineLength(lnToInsertAfter) + 1;
            }
            // console.log(
            //     "Monaco lnToInsertAfter posToInsertAfter",
            //     lnToInsertAfter,
            //     posToInsertAfter
            // );
            let range = new monaco.Range(
                lnToInsertAfter,
                posToInsertAfter,
                lnToInsertAfter,
                posToInsertAfter
            );
            let id = { major: 1, minor: 1 };
            let text = "\n";
            var op = { identifier: id, range: range, text: text, forceMoveMarkers: true };
            editor.executeEdits("insertCellBelow", [op]);

            setCodeToInsert({
                code: "",
                /** fromLine is 0-based while lnToInsertAfter is 1-based
                 * so setting fromLine to lnToInsertAfter means fromLine will
                 * point to the next line */
                fromLine: lnToInsertAfter,
                status: CodeInsertStatus.INSERTING,
                mode: mode,
            });
        }
        return true;
    };

    /** this is called after the code has been inserted to monaco */
    useEffect(() => {
        if (codeToInsert?.status === CodeInsertStatus.INSERTING && codeToInsert.fromLine) {
            let lineStatus: ICodeLineGroupStatus = {
                inViewID: inViewID,
                fromLine: codeToInsert.fromLine,
                toLine: codeToInsert.fromLine,
                status: LineStatus.EDITED,
                setGroup:
                    codeToInsert.mode === CodeInsertMode.GROUP
                        ? SetLineGroupCommand.NEW
                        : SetLineGroupCommand.UNDEF,
            };
            dispatch(setLineGroupStatus(lineStatus));
            setCodeToInsert(null);
        }
    }, [cellAssocUpdateCount]);

    const handleResultData = (message: IMessage) => {
        // console.log(`${WebAppEndpoint.CodeEditor} got result data`);
        let inViewID = store.getState().projectManager.inViewID;
        if (inViewID) {
            let result: ICodeResultMessage = {
                inViewID: inViewID,
                content: message.content,
                type: message.type,
                subType: message.sub_type,
                metadata: message.metadata,
            };

            // content['plot'] = JSON.parse(content['plot']);
            console.log("CodeEditor dispatch result data: ", result);
            dispatch(addResult(result));
        }
    };

    /**
     * Init CodeEditor socket connection. This should be run only once on the first mount.
     */
    const socketInit = () => {
        socket.emit("ping", WebAppEndpoint.CodeEditor);
        socket.on(WebAppEndpoint.CodeEditor, (result: string) => {
            console.log("CodeEditor got result ", result);
            // console.log("CodeEditor: got results...");
            try {
                let codeOutput: IMessage = JSON.parse(result);
                let inViewID = store.getState().projectManager.inViewID;
                if (inViewID) {
                    handleResultData(codeOutput);
                    if (
                        codeOutput.metadata?.msg_type === "execute_reply" &&
                        codeOutput.content?.status != null
                    ) {
                        // let lineStatus: ICodeLineStatus;
                        dispatch(removeFirstItemFromRunQueue());
                        if (
                            codeOutput.content?.status === "ok" &&
                            "line_range" in codeOutput.metadata
                        ) {
                            setLineStatus(
                                inViewID,
                                codeOutput.metadata?.line_range,
                                LineStatus.EXECUTED_SUCCESS
                            );
                            dispatch(setRunQueueStatus(RunQueueStatus.STOP));
                        } else {
                            if ("line_range" in codeOutput.metadata) {
                                setLineStatus(
                                    inViewID,
                                    codeOutput.metadata?.line_range,
                                    LineStatus.EXECUTED_FAILED
                                );
                            }
                            dispatch(clearRunQueue());
                        }
                        // TODO: check the status output
                        // console.log('CodeEditor socket ', lineStatus);
                        // dispatch(setLineStatusRedux(lineStatus));
                        /** set active code line to be the current line after it is excuted so the result will be show accordlingly
                         * not sure if this is a good design but will live with it for now */
                        // let activeLine: ICodeActiveLine = {
                        //     inViewID: inViewID,
                        //     lineNumber: codeOutput.metadata.line_range?.fromLine,
                        // };
                        // dispatch(setActiveLine(activeLine));
                    }
                }
            } catch (error) {
                console.error(error);
            }
        });
    };

    useEffect(() => {
        console.log("CodeEditor mount");
        socketInit();
        // resetEditorState(inViewID, view);
        return () => {
            console.log("CodeEditor unmount");
            socket.off(WebAppEndpoint.CodeEditor);
        };
    }, []);

    useEffect(() => {
        // console.log("CodeEditor useEffect container view", container, view);
        if (monaco) {
            monaco.languages.register({ id: "python" });
            monaco.languages.registerFoldingRangeProvider("python", {
                provideFoldingRanges: (model, context, token) => getCellFoldRange(),
            });
        }
    });

    // add action
    useEffect(() => {
        // console.log("CodeEditor useEffect container view", container, view);
        if (monaco && editor) {
            let keymap: any[] = [
                {
                    id: shortcutKeysConfig.insert_group_below,
                    keybindings: [
                        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyG,
                    ],
                    run: () => insertCellBelow(CodeInsertMode.GROUP, null),
                },
                {
                    id: shortcutKeysConfig.insert_line_below,
                    keybindings: [
                        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyL,
                    ],
                    run: () => insertCellBelow(CodeInsertMode.LINE, null),
                },
                {
                    id: shortcutKeysConfig.run_queue,
                    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
                    run: () => addToRunQueueHoverCell(),
                },
                {
                    id: `foldAll`,
                    keybindings: [
                        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
                    ],
                    run: () => foldAll(editor),
                },
                {
                    id: `unfoldAll`,
                    keybindings: [
                        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyU,
                    ],
                    run: () => unfoldAll(editor),
                },
            ];
            keymap.forEach(function (element) {
                (editor as any).addAction({ ...element, label: element.id });
            });
        }
    });
    useEffect(() => {
        console.log("CodeEditor runQueue");
        if (runQueue.status === RunQueueStatus.STOP) {
            if (runQueue.queue.length > 0) {
                let runQueueItem = runQueue.queue[0];
                dispatch(setRunQueueStatus(RunQueueStatus.RUNNING));
                execLines(runQueueItem);
            }
        }
    }, [runQueue]);

    /** clear the run queue when the executor restarted */
    useEffect(() => {
        const runQueueItem = runQueue.queue[0];
        let inViewID = store.getState().projectManager.inViewID;
        if (inViewID != null && runQueueItem != null) {
            dispatch(removeFirstItemFromRunQueue());
            setLineStatus(inViewID, runQueueItem.lineRange, LineStatus.EXECUTED_FAILED);
            dispatch(clearRunQueue());
        }
    }, [executorRestartCounter]);

    /**
     * Reset the code editor state when the doc is selected to be in view
     * */
    useEffect(() => {
        if (curInViewID != inViewID) {
            if (curInViewID && monaco) {
                // fileClosingHandler(view.state, curInViewID);
            }
            setCurInViewID(inViewID);
        }
        // resetEditorState(inViewID, view);
        setCodeReloading(true);
    }, [inViewID]);

    useEffect(() => {
        if (serverSynced && codeReloading && monaco && editor) {
            // Note: I wasn't able to get editor directly out of monaco so have to use editorRef
            // TODO: improve this by rely only on monaco
            setCodeTextAndStates(store.getState(), monaco);
            setCellDeco(monaco, editor);
            getCellFoldRange(monaco, editor);
            setCellWidgets(editor);
            setCodeReloading(false);
        }
    }, [serverSynced, codeReloading, monaco, editor]);

    useEffect(() => {
        const state = store.getState();
        const mouseOverGroupID = state.codeEditor.mouseOverGroupID;
        // console.log("CodeEditor useEffect cellCommand: ", cellCommand);
        if (cellCommand) {
            let ln0based = null;
            if (state.codeEditor.mouseOverLine) {
                // const inViewID = state.projectManager.inViewID;
                ln0based = state.codeEditor.mouseOverLine;
                // let activeLine: ICodeActiveLine = {
                //     inViewID: inViewID || "",
                //     lineNumber: ln0based,
                // };
                // store.dispatch(setActiveLineRedux(activeLine));
            }
            switch (cellCommand) {
                case CellCommand.RUN_CELL:
                    addToRunQueueHoverCell();
                    break;
                case CellCommand.CLEAR:
                    dispatch(clearAllOutputs({ inViewID, mouseOverGroupID }));
                    break;
                case CellCommand.ADD_CELL:
                    /** TODO: fix the type issue with ln0based */
                    insertCellBelow(CodeInsertMode.GROUP, ln0based);
                    break;
            }
            dispatch(setCellCommand(undefined));
        }
    }, [cellCommand]);

    useEffect(() => {
        if (editor) {
            setCellDeco(monaco, editor);
            setCellWidgets(editor);
        }
    }, [cellAssocUpdateCount, activeGroup, lineStatusUpdate]);

    const handleEditorDidMount = (mountedEditor, monaco) => {
        // Note: I wasn't able to get editor directly out of monaco so have to use editorRef
        setEditor(mountedEditor);
        setHTMLEventHandler(mountedEditor, stopMouseEvent);
    };
    const handleEditorDidMountDiff = () => {};
    const handleEditorChange = (value, event) => {
        try {
            const state = store.getState();
            let inViewID = state.projectManager.inViewID;
            /** do nothing if the update is due to code reloading from external source */
            if (event.isFlush) return;
            console.log("Monaco here is the current model value:", event);
            let serverSynced = store.getState().projectManager.serverSynced;
            if (monaco) {
                let model = getMainEditorModel(monaco);

                if (serverSynced && inViewID && model) {
                    const inViewCodeText = state.codeEditor.codeText[inViewID];
                    let updatedLineCount = model.getLineCount() - inViewCodeText.length;
                    // console.log(
                    //     "Monaco updates ",
                    //     updatedLineCount,
                    //     event.changes,
                    //     model?.getLineCount(),
                    //     inViewCodeText.length
                    // );
                    for (const change of event.changes) {
                        // convert the line number 0-based index, which is what we use internally
                        let changeStartLine1Based = change.range.startLineNumber;
                        let changeStartLineNumber0Based = changeStartLine1Based - 1;
                        // console.log(
                        //     "Monaco updates ",
                        //     model?.getLineContent(changeStartLine1Based),
                        //     inViewCodeText[changeStartLineNumber0Based]
                        // );
                        if (updatedLineCount > 0) {
                            let updatedLineInfo: ILineUpdate = {
                                inViewID: inViewID,
                                text: model.getLinesContent(),
                                updatedStartLineNumber: changeStartLineNumber0Based,
                                updatedLineCount: updatedLineCount,
                                startLineChanged:
                                    model.getLineContent(changeStartLine1Based) !=
                                    inViewCodeText[changeStartLineNumber0Based],
                            };
                            dispatch(updateLines(updatedLineInfo));
                        } else if (updatedLineCount < 0) {
                            let updatedLineInfo: ILineUpdate = {
                                inViewID: inViewID,
                                text: model.getLinesContent(),
                                updatedStartLineNumber: changeStartLineNumber0Based,
                                updatedLineCount: updatedLineCount,
                                startLineChanged:
                                    model.getLineContent(changeStartLine1Based) !=
                                    inViewCodeText[changeStartLineNumber0Based],
                            };
                            dispatch(updateLines(updatedLineInfo));
                        } else {
                            let updatedLineInfo: ILineUpdate = {
                                inViewID: inViewID,
                                text: model.getLinesContent(),
                                updatedStartLineNumber: changeStartLineNumber0Based,
                                updatedLineCount: updatedLineCount,
                                startLineChanged: true,
                            };
                            dispatch(updateLines(updatedLineInfo));
                        }
                        // handleCAsisstTextUpdate();
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        // setModified(getCodeText(store.getState()));
    });
    return !showGitManager ? (
        <StyledMonacoEditor
            height="90vh"
            defaultValue=""
            defaultLanguage="python"
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
            options={{
                minimap: { enabled: true, autohide: true },
                fontSize: 11,
                renderLineHighlight: "none",
                scrollbar: { verticalScrollbarSize: 10 },
                // foldingStrategy: "indentation",
            }}
        />
    ) : (
        <DiffEditor
            height="90vh"
            language="python"
            original={original}
            modified={modified}
            onMount={handleEditorDidMountDiff}
        />
    );
};

export default CodeEditor;
