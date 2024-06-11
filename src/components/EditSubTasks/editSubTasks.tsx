import React, { useState } from "react";
import { MdDeleteForever } from "react-icons/md";

type Props = {
  closePopUps: (
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>
  ) => void;
  value: { subTask: string }[];
  confirm: (column: string[], value: (string | number)[]) => Promise<void>;
};

const EditSubTasks: React.FC<Props> = ({ closePopUps, value, confirm }) => {
  const [subTasks, setSubTasks] = useState(value.map((v) => ({ ...v })));
  const deleteSubTask = (index: number) => {
    setSubTasks((prevState) => prevState.filter((_, idx) => idx !== index));
  };
  return (
    <div className="popUpContainer" onClick={closePopUps}>
      <div id="commentForm">
        <ul>
          {subTasks.map((s, idx) => (
            <li key={idx}><MdDeleteForever onClick={() => deleteSubTask(idx)} size={18}/> {s.subTask} </li>
          ))}
        </ul>
        <button onClick={() => confirm(["sub_tasks"], [JSON.stringify(subTasks)])}>Confirm</button>
      </div>
    </div>
  );
};

export default EditSubTasks;
