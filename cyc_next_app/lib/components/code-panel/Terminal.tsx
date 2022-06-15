import React, { useRef, useEffect } from "react";
import { XTerm } from "xterm-for-react";

const Term = ({ openDialog = true, confirm }) => {
  const xtermRef = useRef(null);
  function onTermData(data: any) {
    const code = data.charCodeAt(0);
    console.log("code", code);
    console.log("data", data);
  }
  useEffect(() => {
    var init_width = 9;
    var init_height = 17;
    var windows_width = window.innerWidth;
    var windows_height = window.innerHeight;
    const cols = Math.floor(windows_width / init_width);
    const rows = Math.floor(windows_height / init_height) - 2;

    if (xtermRef?.current?.terminal) {
      xtermRef.current.terminal.writeln(
        "Please enter any string then press enter:"
      );
      xtermRef.current.terminal.write("echo> ");
      console.log("xtermRef.current", xtermRef.current);
      console.log("xtermRef.terminal", xtermRef.current.terminal);
    }
  }, [xtermRef.current]);
  return <XTerm onData={onTermData} ref={xtermRef} />;
};

export default Term;
