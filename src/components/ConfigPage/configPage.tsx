import React, { useState } from "react";
import "./configPage.css";
import AddTemplate from "../AddTemplate/addTemplate";
import EditTemplate from "../EditTemplate/editTemplate";

const ConfigPage: React.FC = () => {
  const [subConfig, setSubConfig] = useState("");

  const backToMainConfig = () => {
    setSubConfig("");
  };
  return (
    <div className="configContainer">
      <div className="configOption" onClick={(_) => setSubConfig("add")}>Add Template</div>
      <div className="configOption"  onClick={(_) => setSubConfig("edit")}>Edit Templates</div>
      {/* <div className="configOption">Store completed tasks for: Days</div> */}
      {subConfig === "add" && <AddTemplate close={backToMainConfig}/>}
      {subConfig === "edit" && <EditTemplate />}
    </div>
  );
};

export default ConfigPage;
