import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import "./taskList.css";
import MyContextMenu from "../MyContextMenu/myContextMenu";
import Modal from "../Modal/modal";
import EditSubTasks from "../EditSubTasks/editSubTasks";

type Props = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

const TaskList: React.FC<Props> = ({ tasks, setTasks }) => {
  useEffect(() => {
    addEventListener("click", () => {
      if (!!!menuCoord.x) {
        setMenuCoord({ x: 0, y: 0 });
      }
    });

    return removeEventListener("click", () => {
      if (!!!menuCoord.x) {
        setMenuCoord({ x: 0, y: 0 });
      }
    });
  }, []);

  useEffect(() => {
    const container = document.getElementsByClassName("container");
    if (container.length === 0) return;
    container[0].addEventListener("scroll", () => {
      if (!!!menuCoord.x) {
        setMenuCoord({ x: 0, y: 0 });
      }
    });
    return container[0].removeEventListener("scroll", () => {
      if (!!menuCoord.x) {
        setMenuCoord({ x: 0, y: 0 });
      }
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
  const [whatModal, setWhatModal] = useState("");
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
        value: value.map((v) => `${v}`),
        taskId: tasks[taskIndex].id
      });
      setTasks((prevState) =>
        prevState
          .map((v) => {
            if (v.id === tasks[taskIndex].id) {
              const temp = { ...v };

              for (let i = 0; i < column.length; i++) {
                if (column[i] === "sub_tasks") {
                  temp[column[i]] = JSON.parse(value[i] as string);
                } else {
                  temp[column[i]] = value[i];
                }
              }
              return temp;
            } else {
              return v;
            }
          })
          .sort((a, b) => {
            if (!!!a.completed && !!!b.completed) {
              return a.due_date - b.due_date;
            }
            if (!!!a.completed || !!!b.completed) {
              return a.completed - b.completed;
            }
            return b.completed - a.completed;
          })
      );
    } catch (error) {
      console.log(error);
    } finally {
      setWhatModal("");
    }
  };

  const deleteTask = async () => {
    try {
      await invoke("delete_task", { taskId: tasks[taskIndex].id });
      setTasks((prevState) =>
        prevState.filter((value) => value.id != tasks[taskIndex].id)
      );
      setWhatModal("");
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
    setInputText(value.replace('"', "\u02BA").replace("&OK", "\u2714"));
  };

  const opneModal = (type: string) => {
    const types: { [key: string]: any } = {
      editTask: () => {
        setInputText(tasks[taskIndex].task);
        setDueDate(tasks[taskIndex].due_date);
      },
      openComment: () => {
        setInputText(tasks[taskIndex].comments);
      },
      addSubTask: () => {
        setInputText("");
      },
      editSubTask: () => {},
      delete: () => {}
    };
    setWhatModal(type);
    types[type]();
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
      await invoke("migration");
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

  const closePopUps = (
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>
  ) => {
    if (e.target !== e.currentTarget) return;
    setWhatModal("");
  };

  const checkSubTask = async (index: number, subIndex: number) => {
    try {
      await invoke("edit_task", {
        column: ["sub_tasks"],
        value: [
          JSON.stringify(
            tasks[index].sub_tasks.map((s, i) =>
              i !== subIndex
                ? s
                : {
                    subTask: s.subTask,
                    completed: !s.completed
                  }
            )
          )
        ],
        taskId: tasks[index].id
      });
      setTasks((prevState) =>
        prevState.map((v) => {
          if (v.id === tasks[index].id) {
            const temp = { ...v };

            temp["sub_tasks"] = v.sub_tasks.map((s, i) =>
              i !== subIndex
                ? s
                : {
                    subTask: s.subTask,
                    completed: !!!s.completed
                  }
            );
            return temp;
          } else {
            return v;
          }
        })
      );
    } catch (error) {
      console.log(error);
    }
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
            {!!task.sub_tasks?.length && (
              <ul>
                {task.sub_tasks.map((sub, index) => (
                  <li key={index}>
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => checkSubTask(idx, index)}
                      id={`${idx} - ${index}`}
                      disabled={!!task.completed}
                    />
                    <label htmlFor={`${idx} - ${index}`}>{sub.subTask}</label>
                  </li>
                ))}
              </ul>
            )}
            {task.comments !== "" && !!!task.completed && (
              <>
                <p className="comments">{task.comments}</p>
              </>
            )}
          </div>
        ))}
      </div>
      {whatModal === "openComment" && (
        <Modal
          closePopUps={closePopUps}
          onChange={onChange}
          value={inputText}
          confirm={() => edit(["comments"], [inputText])}
        />
      )}
      {whatModal === "addSubTask" && (
        <Modal
          closePopUps={closePopUps}
          onChange={onChange}
          value={inputText}
          confirm={() =>
            edit(
              ["sub_tasks"],
              [
                JSON.stringify([
                  ...tasks[taskIndex].sub_tasks,
                  { subTask: inputText, completed: false }
                ])
              ]
            )
          }
        />
      )}
      {whatModal === "editTask" && (
        <div className="popUpContainer" onClick={closePopUps}>
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
        </div>
      )}
      {whatModal === "editSubTask" && (
        <EditSubTasks
          closePopUps={closePopUps}
          value={tasks[taskIndex].sub_tasks}
          confirm={edit}
        />
      )}
      {whatModal === "delete" && (
        <div className="popUpContainer" onClick={closePopUps}>
          <div id="commentForm">
            <p>Are sure you wnat to delete this task?</p>
            <button onClick={closePopUps}>Cancel</button>
            <button onClick={deleteTask}>Confirm</button>
          </div>
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
          task={tasks[taskIndex]}
          runMigration={runMigration}
          openModal={opneModal}
        />
      )}
    </>
  );
};

export default TaskList;
