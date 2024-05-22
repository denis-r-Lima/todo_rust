import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import { MdCancel } from "react-icons/md";

import "./App.css";

import AddTask from "./components/addTask/addTask";
import TaskList from "./components/TaskList/taskList";
import WindowDecoration from "./components/WindowDecoration/windowDecoratio";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");

  const getTasks = async () => {
    try {
      const response: Task[] = await invoke("get_tasks", { value: Date.now() });
      setTasks(
        response.sort((a, b) =>
          a.completed === 0 || b.completed == 0
            ? a.completed - b.completed
            : b.completed - a.completed
        )
      );
    } catch (error) {}
  };

  useEffect(() => {
    getTasks();
  }, []);

  const isDev = () => {
    return window.location.host.startsWith("localhost:");
  };

  useEffect(() => {
    if (!isDev()) addEventListener("contextmenu", (e) => e.preventDefault());
    return removeEventListener("contextmenu", (e) => e.preventDefault());
  }, []);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value);
  };

  const cleanSearchBar = () => {
    setSearch("")
  }

  return (
    <div className="container">
      <WindowDecoration />
      <div id="searchBar">
        <input type="text" name="search" onChange={onSearchChange} value={search}/>
        {search !== "" && <span onClick={cleanSearchBar}><MdCancel/></span>}
      </div>
      <TaskList
        tasks={tasks.filter((value) =>
          value.task.toLowerCase().includes(search.toLowerCase())
        )}
        setTasks={setTasks}
      />
      <AddTask setTasks={setTasks} />
    </div>
  );
}

export default App;
