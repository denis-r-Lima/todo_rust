import React from "react";
import { appWindow } from "@tauri-apps/api/window";
import { FaRegWindowMaximize, FaRegWindowMinimize } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";

import "./windowDecoration.css";
import { invoke } from "@tauri-apps/api";

type Props = {
  setConfig: React.Dispatch<React.SetStateAction<boolean>>
}

const WindowDecoration: React.FC<Props> = ({setConfig}) => {
  const minimize = () => {
    appWindow.minimize();
  };

  const maximize = () => {
    appWindow.toggleMaximize();
  };

  const close = () => {
    // appWindow.close();
    invoke("close_window")
  };

  return (
    <div data-tauri-drag-region className="titlebar">
        <div className="titlebar-button left">
          <FaGear onClick={()=> setConfig(prevState => !prevState)}/>
        </div>

      <div className="titlebar-button" onClick={minimize}>
        <FaRegWindowMinimize />
      </div>
      <div className="titlebar-button" onClick={maximize}>
        <FaRegWindowMaximize />
      </div>
      <div className="titlebar-button" onClick={close}>
        <IoIosClose size={100} />
      </div>
    </div>
  );
};

export default WindowDecoration;
