import React from "react";
import { appWindow } from "@tauri-apps/api/window";
import { FaRegWindowMaximize, FaRegWindowMinimize} from "react-icons/fa";
import { IoIosClose } from "react-icons/io";

import "./windowDecoration.css";

const WindowDecoration: React.FC = () => {

    const minimize = () => {
        appWindow.minimize()
    }

    const  maximize = () => {
        appWindow.toggleMaximize()
    }

    const close = () => {
        appWindow.close()
    }
    
  return (
    <div data-tauri-drag-region className="titlebar">
      <div className="titlebar-button" onClick={minimize}>
        <FaRegWindowMinimize  />
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
