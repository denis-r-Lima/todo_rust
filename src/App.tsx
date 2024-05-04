import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import "./App.css";

import AddTask from "./components/addTask/addTask";
import TaskList from "./components/TaskList/taskList";
import WindowDecoration from "./components/WindowDecoration/windowDecoratio";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

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

  // useEffect(() => {
  //   addEventListener("contextmenu", (e) => e.preventDefault());
  //   return removeEventListener("contextmenu", (e) => e.preventDefault());
  // }, []);

  return (
    <div className="container">
      <WindowDecoration />
      <TaskList tasks={tasks} setTasks={setTasks} />
      <AddTask setTasks={setTasks} />
    </div>
  );
}

export default App;
