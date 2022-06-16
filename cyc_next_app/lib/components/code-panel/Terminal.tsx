import React, { useRef, useEffect, useState } from "react";
import { XTerm } from "xterm-for-react";
import { IMessage, ContentType, WebAppEndpoint } from "../../interfaces/IApp";
import { FitAddon } from "xterm-addon-fit";

import socket from "../Socket";

const Term = () => {
  const xtermRef = useRef(null);
  const [input, setInput] = useState<string>("");
  const [isMountTerm, setIsMountTerm] = useState<boolean>(false);
  const fitAddon = new FitAddon();
  const socketInit = () => {
    socket.emit("ping", "Terminal");
    socket.on(WebAppEndpoint.Terminal, (result: string) => {
      try {
        let message: IMessage = JSON.parse(result);
        console.log("Load Terminal ", message);
        if (!message.error) {
          if (message.type === ContentType.STRING || message.error === true) {
          }
        } else {
        }
      } catch {}
    });
  };

  useEffect(() => {
    socketInit();
    return () => {
      socket.off(WebAppEndpoint.Terminal);
    };
  }, []); //TODO: run this only once - not on rerender

  function onTermData(data: any) {
    setIsMountTerm(true);
    console.log("data", data);

    const code = data.charCodeAt(0);
    const term = xtermRef.current.terminal;
    if (code === 13 && input.length > 0) {
      if (input === "cls" || input === "clear") {
        term.clear();
        console.log(code, "data=>>>", input, "enter");
        term.write("\r\n" + "~$ ");
      } else {
        term.write("\r\n" + "~$ ");
      }
      setInput("");
    } else if (code < 32 || code === 127) {
      // Disable control Keys such as arrow keys

      return;
    } else {
      // Add general key press characters to the terminal
      term.write(data);
      setInput(input + data);
    }
  }

  const onTermKey = (data: any) => {
    if (data.domEvent.keyCode === 8) {
      xtermRef.current.terminal.write("\b \b");
      setInput(input.slice(0, -1));
    }
    console.log(data.domEvent.keyCode, "key");
  };
  useEffect(() => {
    var init_width = 9;
    var init_height = 17;
    var windows_width = window.innerWidth;
    var windows_height = window.innerHeight;
    const cols = Math.floor(windows_width / init_width);
    const rows = Math.floor(windows_height / init_height) - 2;

    if (xtermRef?.current?.terminal && !isMountTerm) {
      xtermRef.current.terminal.write("~$ ");
    }
  }, [xtermRef.current]);
  return (
    <XTerm
      onResize={() => {
        console.log("ádfdsf", xtermRef.current.terminal),
          xtermRef.current.terminal.fit();
      }}
      onKey={onTermKey}
      onData={onTermData}
      ref={xtermRef}
      addons={[fitAddon]}
    />
  );
};

export default Term;
