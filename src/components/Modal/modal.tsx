import React from 'react';


type Props = {
    closePopUps: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    confirm: () => void
}

const Modal: React.FC<Props> = ({closePopUps, value, onChange, confirm}) => {
  return (
    <div className="popUpContainer" onClick={closePopUps}>
    <div id="commentForm">
      <textarea
        id="commentArea"
        rows={10}
        placeholder="Comment"
        value={value}
        onChange={onChange}
      />
      <button onClick={confirm}>
        Confirm
      </button>
    </div>
  </div>
  )
}

export default Modal;