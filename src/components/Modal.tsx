import React, { useState, useEffect } from "react";
import "./modal.css";
import { IoTime } from "react-icons/io5";

interface HistoryPanelProps {
  isOpen: boolean;
  sessionData: String[][];
  datesData: String[];
  isLoading: boolean;
  onSelectSession: (sessionData: String[]) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  sessionData,
  datesData,
  isLoading,
  onSelectSession,
}) => {
  // console.log(datesData)
  // console.log(sessionData)
  return (
    <div
      style={{ background: "black" }}
      className={`history-panel ${isOpen ? "open" : "close"}`}
    >
      <p>Drawing history</p>
      {datesData.length > 0 && sessionData.length > 0 && !isLoading ? (
        datesData.map((Date, key) => {
          return (
            <div key={key} className="historyContainer">
              <p>{Date}</p>
              {sessionData[key].map((sessionName, index) => {
                return (
                  <a
                    style={{
                      animation: `${index + 1}00ms fadeandmore ease-in-out`,
                    }}
                    key={index}
                    className="historyList"
                    onClick={() => onSelectSession([Date, sessionName])}
                  >
                    <IoTime
                      className="timeicon"
                      style={{
                        // animation: `${
                        //   index + 2
                        // }00ms fadeandmoreandmore ease-in-out !important`,
                        fontSize: "22.5px",
                      }}
                    />
                    <p>{sessionName}</p>
                  </a>
                );
              })}
            </div>
          );
        })
      ) : (
        <div className="loading"></div>
      )}

    </div>
  );
};

export default HistoryPanel;
