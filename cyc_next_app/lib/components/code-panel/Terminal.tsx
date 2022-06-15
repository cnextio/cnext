import React, { useRef, useEffect, useState } from "react";
import { XTerm } from "xterm-for-react";

const Term = ({ openDialog = true, confirm }) => {
  const xtermRef = useRef(null);
  const [input, setInput] = useState("");
  function onTermData(data: any) {
    const code = data.charCodeAt(0);
    // If the user hits empty and there is something typed echo it.
    if (code === 13 && input.length > 0) {
      // xtermRef.current.terminal.write("\r\nYou typed: '" + input + "'\r\n");
      xtermRef.current.terminal.write("\r\n" + "echo> ");
      setInput("");
    } else if (code < 32 || code === 127) {
      // Disable control Keys such as arrow keys
      return;
    } else {
      // Add general key press characters to the terminal
      xtermRef.current.terminal.write(data);
      setInput(input + data);
    }
    console.log(data, code, "data");
  }

  const onTermKey = (data: any) => {
    // const code = data.charCodeAt(0);
    console.log(data, "key");
    // if
  };
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
  return <XTerm onKey={onTermKey} onData={onTermData} ref={xtermRef} />;
};

export default Term;
