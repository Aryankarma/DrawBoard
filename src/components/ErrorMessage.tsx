import React, { useState, useEffect } from "react";
import "./componentStyles.css";
import { HiOutlineXCircle } from "react-icons/hi";


interface ErrorMessageProps {
  message: string;
  count: number;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, count }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);  
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [message, count]);

  return (
    visible && (
      <div className="ErrorDiaouge">
        <HiOutlineXCircle className="emojiIcon" />
        <h5 style={{marginBottom:"0"}}>{message}</h5>
      </div>
    )
  );
};

export default ErrorMessage;