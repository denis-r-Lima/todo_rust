import React, { useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import "./addTask.css";

type Props = {
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

type Response = Task & {sub_tasks: string} 

const AddTask: React.FC<Props> = ({ setTasks }) => {
  const [isOpened, setIsOpened] = useState(false);
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null);

  const manageExpansion = () => {
    if (!containerRef.current) return;
    setIsOpened((prevState) => !prevState);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (task === "") return manageExpansion();
      try {
        const result: Response[] = await invoke("add_task", { task: task, dueDate });
        if (result.length > 0) {
          setTasks((prevState) =>
            [...prevState, {...result[0], sub_tasks: JSON.parse(result[0].sub_tasks)}]
              .sort((a, b) => a.due_date - b.due_date)
              .sort((a, b) =>
                a.completed === 0 || b.completed == 0
                  ? a.completed - b.completed
                  : b.completed - a.completed
              )
          );
        }
      } catch (error) {
        console.log(error);
      } finally {
        manageExpansion();
      }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;

    setTask(value);
  };

  const onChangeDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;

    setDueDate(new Date(value).valueOf())
  };

  return (
    <div
      className={`addContainer ${isOpened ? "expanded" : ""}`}
      ref={containerRef}
    >
      {isOpened ? (
        <form id="addForm" onSubmit={submit}>
          <input type="text" placeholder="Task" onChange={onChange} />
          <input type="date" name="Due date" id="due" onChange={onChangeDate} />
          <div>
            <button type="submit">Add</button>
            <button onClick={manageExpansion}>Cancel</button>
          </div>
        </form>
      ) : (
        <div id="plusDiv" onClick={manageExpansion}>
          +
        </div>
      )}
    </div>
  );
};

export default AddTask;
