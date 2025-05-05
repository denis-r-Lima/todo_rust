import React, { useState } from "react";
import { invoke } from "@tauri-apps/api";
import { IoClose } from "react-icons/io5";

import "../ConfigPage/configPage.css";
import "./addTemplate.css";

type Props = {
  close: () => void;
};

const AddTemplate: React.FC<Props> = ({close}) => {
  const [list, setList] = useState<string[]>([]);
  const [name, setName] = useState<string>("");
  const [subTask, setSubTask] = useState<string>("");

  const onConfirm = async () => {
    try {
      await invoke("add_sub_task_template", {
        subTasks: JSON.stringify(list),
        name
      });
    } catch (error) {
      console.log(error);
    } finally {
      close();
    }
  };

  return (
    <div className="configContainer secondLayer">
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Template Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <input
          type="text"
          placeholder="Subtask"
          value={subTask}
          onChange={(e) => setSubTask(e.currentTarget.value)}
        />
        <button
          className="addButton"
          onClick={(_e) => {
            setList((prevState) => [...prevState, subTask]);
            setSubTask("");
          }}
        >
          Add Subtask to Template
        </button>
        {list.map((item, index) => (
          <div key={item} className="subList">
            - {item}{" "}
            <IoClose
              onClick={(_e) =>
                setList((prevState) =>
                  prevState.filter((_, idx) => idx !== index)
                )
              }
            />
          </div>
        ))}
        <div>
          <button onClick={onConfirm}>Confirm</button>
          <button onClick={close}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddTemplate;
