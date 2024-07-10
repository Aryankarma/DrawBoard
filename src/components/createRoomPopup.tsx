import React, { useState } from "react";
import "./componentStyles.css";
import { socket } from "../socket.ts";

interface PopupProps {
  status: boolean;
  onClose: () => void;
  setInRoomFunc: () => void;
}

const CreateRoomPopup: React.FC<PopupProps> = ({
  status,
  onClose,
  setInRoomFunc,
}) => {
  const CreateJoinRoom = () => {
    if (!room || !password || !userName) {
      alert("all fields are required!");
      return;
    }

    if (isJoining) {
      socket.emit("joinRoom", room, userName, password);
    } else {
      socket.emit("createRoom", room, userName, password);
    }

    setInRoomFunc();
    onClose();
  };

  // join create room functionality
  const [isJoining, setIsJoining] = useState(false);
  const [room, setRoom] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");

  // useEffect(() => {
  //   document.addEventListener("keydown", (input) => {
  //     if (input.key == "Enter") {
  //       CreateJoinRoom()
  //       return;
  //     } else if (input.key == "Escape") {
  //       onClose()
  //     }
  //   });
  // },[]);

  if (!status) {
    return null;
  }

  return (
    <div className="popupContainer">
      <div className="popup-content">
        <div className="options">
          <div className="boxcontainer">
            <input
              name="roomOptions"
              className="roomInput"
              id="Create"
              type="radio"
              onClick={() => setIsJoining(false)}
              defaultChecked
            />
            <label htmlFor="Create" className="roomLabel roomLabel1">
              Create
            </label>
          </div>

          <div className="boxcontainer">
            <input
              name="roomOptions"
              className="roomInput"
              id="Join"
              type="radio"
              onClick={() => setIsJoining(true)}
            />
            <label className="roomLabel roomLabel2" htmlFor="Join">
              Join
            </label>
          </div>
        </div>
        {isJoining ? (
          <div className="inputContainer">
            <input
              type="text"
              name="name"
              id="userName"
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter Your Name"
              required
            />
            <input
              type="text"
              name="password"
              id="roomName"
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter Room Name"
              required
            />
            <input
              type="password"
              name="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
        ) : (
          <div className="inputContainer">
            <input
              type="text"
              name="name"
              id="userName"
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter Your Name"
              required
            />
            <input
              type="text"
              name="password"
              id="roomName"
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Set Room Name"
              required
            />
            <input
              type="password"
              name="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Set password"
              required
            />
          </div>
        )}
        <div className="buttons">
          <button
            style={{ width: "100%" }}
            className="btn-primary"
            onClick={CreateJoinRoom}
          >
            {isJoining ? <p>Join </p> : <p>Create </p>}
          </button>
          <button className="btn-danger cancelBTn" onClick={onClose}>
            X
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPopup;
