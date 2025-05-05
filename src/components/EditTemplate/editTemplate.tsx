import React, { useEffect, useState } from "react";
import "../AddTemplate/addTemplate.css";
import "../ConfigPage/configPage.css";
import "./editTemplate.css"
import { invoke } from "@tauri-apps/api";

const EditTemplate: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);

  const getTemplates = async () => {
    try {
      const response: Template[] = await invoke("get_all_templates");
      setTemplates(response);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getTemplates();
  }, []);

  return (
    <div className="configContainer secondLayer">
      <div className="itemButtonContainer">
        {templates.map((t) => (
          <button>{t.name}</button>
        ))}
      </div>
    </div>
  );
};

export default EditTemplate;
