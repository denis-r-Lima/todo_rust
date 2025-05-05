import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import { MdCancel } from "react-icons/md";

import "./App.css";

import AddTask from "./components/addTask/addTask";
import TaskList from "./components/TaskList/taskList";
import WindowDecoration from "./components/WindowDecoration/windowDecoratio";
import ConfigPage from "./components/ConfigPage/configPage";

type Response = Task & { sub_tasks: string };

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [config, setConfig] = useState(false);

  const getTasks = async () => {
    try {
      const response: Response[] = await invoke("get_tasks", {
        value: Date.now()
      });
      setTasks(
        response
          .sort((a, b) =>
            a.completed === 0 || b.completed == 0
              ? a.completed - b.completed
              : b.completed - a.completed
          )
          .map((r) => ({ ...r, sub_tasks: JSON.parse(r.sub_tasks) }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  const isDev = () => {
    return window.location.host.startsWith("localhost:");
  };

  useEffect(() => {
    if (!isDev())
      addEventListener("contextmenu", (e) => {
        const target = e.target as HTMLInputElement;
        if (target.type === "date") e.preventDefault();
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA")
          e.preventDefault();
      });
    return removeEventListener("contextmenu", (e: MouseEvent) => {
      const target = e.target as HTMLInputElement;
      if (target.type === "date") e.preventDefault();
      if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA")
        e.preventDefault();
    });
  }, []);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value);
  };

  const cleanSearchBar = () => {
    setSearch("");
  };

  return (
    <div className="container">
      <WindowDecoration setConfig={setConfig} />
      <div id="searchBar">
        <input
          type="text"
          name="search"
          onChange={onSearchChange}
          value={search}
        />
        {search !== "" && (
          <span onClick={cleanSearchBar}>
            <MdCancel />
          </span>
        )}
      </div>
      {config && <ConfigPage />}
      <TaskList
        tasks={tasks.filter(
          (value) =>
            value.task.toLowerCase().includes(search.toLowerCase()) ||
            value.comments.toLocaleLowerCase().includes(search.toLowerCase()) ||
            value.sub_tasks.some(e => e.subTask.toLocaleLowerCase().includes(search.toLowerCase()))
        )}
        setTasks={setTasks}
      />
      <AddTask setTasks={setTasks} />
    </div>
  );
}

export default App;
