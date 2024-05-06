import React from "react";
import {
  MdEdit,
  MdDeleteForever,
  MdModeComment,
  MdCheck
} from "react-icons/md";

import "./myContextMenu.css";


type Props = {
  top: number;
  left: number;
  completeTask: () => void;
  openCommentDiv: () => void;
  openEditDiv: () => void;
  runMigration: () => void;
  setOpenDelete: (value: React.SetStateAction<boolean>) => void
  task: Task;
};

const MyContextMenu: React.FC<Props> = ({
  top,
  left,
  completeTask,
  openCommentDiv,
  openEditDiv,
  setOpenDelete,
  // runMigration,
  task
}) => {
  return (
    <div
      id="menuContainer"
      style={{
        top: top + 120 >= window.innerHeight ? top - 111 : top,
        left: left + 175 >= window.innerWidth ? left - 170 : left
      }}
    >
      <div className="menuItem" onClick={completeTask}>
        <MdCheck />
        {task.completed ? "Unmark" : "Mark"} Completed
      </div>
      <div className="menuItem" onClick={openCommentDiv}>
        <MdModeComment />
        {task.comments === "" ? "Add" : "Edit"} Comment
      </div>
      <div className="menuItem" onClick={() => setOpenDelete(true)}>
        <MdDeleteForever size={16} />
        Delete Task
      </div>
      <div className="menuItem" onClick={openEditDiv}>
        <MdEdit size={16} />
        Edit Task
      </div>
      {/* <div className="menuItem" onClick={runMigration}>
        <MdEdit size={16} />
        Run Migration
      </div> */}
    </div>
  );
};

export default MyContextMenu;
