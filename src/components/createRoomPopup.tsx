import React, { useEffect, useState } from "react";
import "./componentStyles.css";
import { MdCancel } from "react-icons/md";


interface PopupProps {
  status: boolean;
  onClose: () => void;
}

const CreateRoomPopup: React.FC<PopupProps> = ({ status, onClose }) => {
  if (!status) {
    return null;
  }

  const [room, setRoom] = useState("");
  // const [name, setName] = useState(""); // get user name or send email id instead

  return (
    <div className="popupContainer">
      <div className="popup-content">
        <h4 style={{color:"black"}}>Join a room</h4>
        <input className="roominput" type="text" name="room" id="" placeholder="Enter room name" />
        <div className="buttons">
          <button
            className="btn-primary"
            onClick={() => console.log("joining room temp")}
          >
            Join Room
          </button>
          <button className="btn-danger" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPopup;
