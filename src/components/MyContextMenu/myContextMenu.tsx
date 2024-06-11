import React from "react";
import {
  MdEdit,
  MdDeleteForever,
  MdModeComment,
  MdCheck,
  MdFormatListBulleted
} from "react-icons/md";

import "./myContextMenu.css";

type Props = {
  top: number;
  left: number;
  completeTask: () => void;
  runMigration: () => void;
  // setOpenDelete: (value: React.SetStateAction<boolean>) => void;
  task: Task;
  openModal: (type: string) => void
};

const MyContextMenu: React.FC<Props> = ({
  top,
  left,
  completeTask,
  // setOpenDelete,
  // runMigration,
  task,
  openModal
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
      <div className="menuItem" onClick={() => openModal("addSubTask")}>
        <MdFormatListBulleted size={16} />
        Add Sub-Task
      </div>
      <div className="menuItem" onClick={() =>  openModal("openComment")}>
        <MdModeComment />
        {task.comments === "" ? "Add" : "Edit"} Comment
      </div>
      <div className="menuItem" onClick={() => openModal("editTask")}>
        <MdEdit size={16} />
        Edit Task
      </div>
      <div className="menuItem" onClick={() => openModal("editSubTask")}>
        <MdEdit size={16} />
        Edit Sub-Task
      </div>
      <div className="menuItem" onClick={() => openModal("delete")}>
        <MdDeleteForever size={16} />
        Delete Task
      </div>
      {/* <div className="menuItem" onClick={runMigration}>
        <MdEdit size={16} />
        Run Migration
      </div> */}
    </div>
  );
};

export default MyContextMenu;
