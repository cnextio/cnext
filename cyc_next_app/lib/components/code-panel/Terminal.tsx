import React, { useRef, useEffect, useState } from "react";
import { XTerm } from "xterm-for-react";

const Term = () => {
  const xtermRef = useRef(null);
  const [input, setInput] = useState<string>("");
  function onTermData(data: any) {
    const code = data.charCodeAt(0);
    // If the user hits empty and there is something typed echo it.
    console.log(data, code, "input data =>");
    if (code === 13 && input.length > 0) {
      // xtermRef.current.terminal.write("\r\nYou typed: '" + input + "'\r\n");
      xtermRef.current.terminal.write("\r\n" + "echo> ");
      console.log(code, "enter send data");
      setInput("");
    } else if (code < 32 || code === 127) {
      // Disable control Keys such as arrow keys
      return;
    } else {
      // Add general key press characters to the terminal
      xtermRef.current.terminal.write(data);
      setInput(input + data);
    }
  }

  const onTermKey = (data: any) => {
    console.log(data, "key");
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
