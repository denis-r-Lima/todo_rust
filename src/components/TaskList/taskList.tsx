import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import "./taskList.css";
import MyContextMenu from "../MyContextMenu/myContextMenu";

type Props = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

const TaskList: React.FC<Props> = ({ tasks, setTasks }) => {
  useEffect(() => {
    addEventListener("click", () => {
      setMenuCoord({ x: 0, y: 0 });
    });
    return removeEventListener("click", () => {
      setMenuCoord({ x: 0, y: 0 });
    });
  }, []);

  useEffect(() => {
    const container = document.getElementsByClassName("container");
    if (!container.length) return;
    container[0].addEventListener("contextmenu", () => {
      setMenuCoord({ x: 0, y: 0 });
    });
    return container[0].removeEventListener("contextmenu", () => {
      setMenuCoord({ x: 0, y: 0 });
    });
  }, []);

  const [inputText, setInputText] = useState("");
  const [openComment, setOpenComment] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [taskIndex, setTaskIndex] = useState(0);
  const [menuCoord, setMenuCoord] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0
  });
  const [dueDate, setDueDate] = useState(0);

  const edit = async (column: string[], value: (string | number)[]) => {
    try {
      await invoke("edit_task", {
        column,
        value: value.map((v) => `${v}`.replace("\"", "&#02BA;")),
        taskId: tasks[taskIndex].id
      });
      setTasks((prevState) =>
        prevState
          .map((v) => {
            if (v.id === tasks[taskIndex].id) {
              const temp = { ...v };

              for (let i = 0; i < column.length; i++) {
                temp[column[i]] = value[i];
              }
              return temp;
            } else {
              return v;
            }
          })
          .sort((a,b) => {
            if (!!!a.completed && !!!b.completed){
              return  a.due_date - b.due_date
            }           
            if (!!!a.completed || !!!b.completed){
              return  a.completed - b.completed
            }
            return b.completed - a.completed
          })
      );
    } catch (error) {
      console.log(error);
    } finally {
      setOpenComment(false);
      setOpenEdit(false);
    }
  };

  const deleteTask = async () => {
    try {
      await invoke("delete_task", { taskId: tasks[taskIndex].id });
      setTasks((prevState) =>
        prevState.filter((value) => value.id != tasks[taskIndex].id)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const onChange = (
    e:
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.currentTarget;
    setInputText(value);
  };

  const openCommentDiv = () => {
    setInputText(tasks[taskIndex].comments);
    setOpenComment(true);
  };

  const openEditDiv = () => {
    setInputText(tasks[taskIndex].task);
    setDueDate(tasks[taskIndex].due_date);
    setOpenEdit(true);
  };

  const openMyContextMenu = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number
  ) => {
    e.preventDefault();
    setMenuCoord({ x: e.clientX, y: e.clientY });
    setTaskIndex(index);
  };

  const onChangeDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;

    setDueDate(new Date(value).valueOf());
  };

  const runMigration = async () => {
    try {
      await invoke("migration", { value: Date.now() });
    } catch (err) {
      console.log(err);
    }
  };

  const correctDate = (date: number) => {
    const [year, month, day] = new Date(date)
      .toISOString()
      .split("T")[0]
      .split("-");

    return [month, day, year].join("-");
  };

  return (
    <>
      <div id="listContainer">
        {tasks.map((task, idx) => (
          <div
            key={task.id}
            className="listItems"
            onContextMenu={(e) => openMyContextMenu(e, idx)}
          >
            <p className={`task ${!!task.completed ? "completed" : ""}`}>
              {task.task}
            </p>
            {!!!task.completed && (
              <p
                className={`date ${
                  task.due_date - Date.now() < 86400000 ? "late" : ""
                }`}
              >
                Due Date: {correctDate(task.due_date)}
              </p>
            )}
            {task.comments !== "" && (
              <p className="comments">{task.comments}</p>
            )}
          </div>
        ))}
      </div>
      {openComment && (
        <div id="commentForm">
          <textarea
            id="commentArea"
            rows={10}
            placeholder="Comment"
            value={inputText}
            onChange={onChange}
          />
          <button onClick={() => edit(["comments"], [inputText])}>
            Confirm
          </button>
        </div>
      )}
      {openEdit && (
        <div id="commentForm">
          <input placeholder="Task" value={inputText} onChange={onChange} />
          <input
            type="date"
            name="Due date"
            id="due"
            onChange={onChangeDate}
            value={new Date(dueDate).toISOString().split("T")[0]}
          />
          <button
            onClick={() => edit(["task", "due_date"], [inputText, dueDate])}
          >
            Confirm
          </button>
        </div>
      )}
      {!!menuCoord.x && (
        <MyContextMenu
          top={menuCoord.y}
          left={menuCoord.x}
          completeTask={() =>
            edit(
              ["completed"],
              !!tasks[taskIndex].completed ? [0] : [Date.now()]
            )
          }
          deleteTask={deleteTask}
          openCommentDiv={openCommentDiv}
          openEditDiv={openEditDiv}
          task={tasks[taskIndex]}
          runMigration={runMigration}
        />
      )}
    </>
  );
};

export default TaskList;
