import { useRef, useState, useEffect } from "react";
import "./styles.css";
import rough from "roughjs";
import { socket } from "../socket.ts";
import { Options } from "roughjs/bin/core";
import { LuBrush } from "react-icons/lu";
import { FiDownload, FiMinus, FiMousePointer, FiSquare } from "react-icons/fi";
import { FaRegCircle } from "react-icons/fa6";
import { GrPowerReset } from "react-icons/gr";
import { LuUndo2 } from "react-icons/lu";
import { LuRedo2 } from "react-icons/lu";
import { MdGroups, MdOutlineGroupAdd } from "react-icons/md";
// import { IoColorPaletteOutline } from "react-icons/io5";
import CreateRoomPopup from "../components/createRoomPopup.tsx";
import { useNavigate } from "react-router-dom";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig.ts";
import ColorPicker from "../components/ColorPicker.tsx";

const Secured = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, setMouseUp] = useState<[number, number]>([0, 0]);
  const [mouseDown, setMouseDown] = useState<[number, number]>([0, 0]);
  const [mouseMove, setMouseMove] = useState<[number, number]>([0, 0]);
  const [strokeColor, setcolorHex] = useState<string>("#ffffff");
  const [fillColor, setfillColor] = useState<string>("#fafafa");
  const [strokeWidth, setstrokeWidth] = useState<string>("1");
  const [elementName, setElement] = useState<string>("arrow");
  // const elementRef = useRef<HTMLLabelElement>(null); // Ref to hold the element

  const [pathdata, setpathdata] = useState<number[][]>([]);
  const [, setPathdataHistory] = useState<number[][][]>([]); // brush
  const [brushDown, setbrushDown] = useState(false);
  const [onBoard, setOnBoard] = useState(false);

  const [contextData, setContextData] = useState<string[][]>([]);
  const [latestContext, setLatestContext] = useState<string[][]>([]);
  const [isContextDataUpdated, setIsContextDataUpdated] = useState(false);

  // const [tempcontext, settempcontext] = useState<string[]>([]);
  const [currentCanvasPointer, setCurrentCanvasPointer] = useState<number>(-1);

  // const [rerender, setrerender] = useState<number>(0);
  const [popupStatus, setPopupStatus] = useState<boolean>(false);
  const [joinedRoomName, setJoinedRoomName] = useState("");
  const [inRoom, setInRoom] = useState(false);

  // auth
  const [_, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // useEffect(() => {
  // if (!userlocal) {
  //   return <h1>Loading...</h1>
  // }
  // }, [userlocal]);

  // sending data from client to server
  const sendDataToPeer = (contextData: string[][], canvasPointer: number) => {
    // if (isInitialMount.current) {
    //   isInitialMount.current = false;
    //   setContextData([]);
    //   return; // Skip the first execution
    // }

    {
      joinedRoomName != ""
        ? socket.emit(
            "ultimateSharing",
            contextData,
            canvasPointer ? canvasPointer : -10000,
            joinedRoomName
          )
        : socket.emit(
            "ultimateSharing",
            contextData,
            canvasPointer ? canvasPointer : -10000
          );
    }
  };

  const leaveRoom = (roomName: string) => {
    socket.emit("leaveRoom", roomName);
  };

  useEffect(() => {
    console.log(joinedRoomName);
  }, [joinedRoomName]);

  // recieving data from the server
  useEffect(() => {
    socket.on("ultimateSharing", (ultimateContext, ultimateNumber) => {
      ultimateContext != null ? setContextData(ultimateContext) : null;

      if (ultimateNumber == -10000) {
        resetPeerContext();
      }
      if (ultimateContext[ultimateNumber - 1][0]) {
        // when the reDrawCanvasUpdateContext runs after reDrawCanvasForUndoRedo undo does not work, this timeout is keeping it to execute that function before reDrawCanvasForUndoRedo
        setTimeout(() => {
          reDrawCanvasForUndoRedo(ultimateContext[ultimateNumber - 1][0]);
        }, 10);
      }
    });

    return () => {
      socket.off("ultimateSharing");
    };
  }, []);

  useEffect(() => {
    socket.on("roomCreated", (msg) => {
      alert(msg);
    });

    socket.on("roomJoined", (msg, roomName) => {
      alert(msg);
      setJoinedRoomName(roomName);
      setInRoom(true);
    });

    socket.on("roomError", (msg) => {
      alert("Error: " + msg);
    });

    socket.on("roomLeft", (msg) => {
      alert(msg);
      setInRoom(false);
    });

    return () => {
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("roomError");
      socket.off("roomLeft");
    };
  });

  const resetPeerContext = () => {
    if (backgroundCanvasRef.current) {
      const context = backgroundCanvasRef.current.getContext("2d");
      if (context) {
        context.clearRect(
          0,
          0,
          backgroundCanvasRef.current.width,
          backgroundCanvasRef.current.height
        );
      }
    }
    setContextData([]);
    setCurrentCanvasPointer(0);
    setpathdata([]);
    setPathdataHistory([]);
  };

  useEffect(() => {
    setCurrentCanvasPointer(contextData.length - 1);
    setLatestContext([...contextData]);
    reDrawCanvasUpdateContext();
  }, [contextData]);

  const reDrawCanvasUpdateContext = () => {
    if (backgroundCanvasRef.current) {
      const context = backgroundCanvasRef.current.getContext("2d");
      if (context) {
        const image = new Image();
        image.onload = () => {
          context.clearRect(
            0,
            0,
            backgroundCanvasRef.current!.width,
            backgroundCanvasRef.current!.height
          );
          context.drawImage(image, 0, 0);
        };
        image.src = contextData[contextData.length - 1]
          ? contextData[contextData.length - 1][0]
          : "";
      }
    }
  };

  const reDrawCanvasForUndoRedo = (imageSource: string) => {
    if (backgroundCanvasRef.current) {
      const context = backgroundCanvasRef.current.getContext("2d");
      if (context) {
        const image = new Image();
        image.onload = () => {
          context.clearRect(
            0,
            0,
            backgroundCanvasRef.current!.width,
            backgroundCanvasRef.current!.height
          );
          context.drawImage(image, 0, 0);
        };
        if (imageSource) {
          // image.src = contextData[canvasPointer - 1][0];
          image.src = imageSource;
        }
      }
    }
  };

  useEffect(() => {
    if (!onBoard) {
      savebgCanvasContext();
    }
  }, [onBoard]);

  // useEffect(() => {
  // console.log(currentCanvasPointer)
  // }, [currentCanvasPointer]);

  // const saveCanvasContext = () => {
  //   if (canvasRef.current) {
  //     const context = canvasRef.current.getContext("2d");
  //     if (context) {
  //       setContextData((prevdata) => [
  //         ...prevdata,
  //         [canvasRef.current!.toDataURL()],
  //       ]);
  //     }
  //   }
  // };

  // const savebgCanvasContext = async () => {
  //   if (backgroundCanvasRef.current) {
  //     const context = backgroundCanvasRef.current.getContext("2d");
  //     if (context) {
  //       setContextData((prevdata) => [
  //         ...prevdata,
  //         [backgroundCanvasRef.current!.toDataURL()],
  //       ]);
  //     }
  //   }
  //   sendDataToPeer(contextData, currentCanvasPointer);
  // };

  // fixes drawing last element except current one...
  useEffect(() => {
    if (isContextDataUpdated) {
      sendDataToPeer(contextData, currentCanvasPointer + 1);
      setIsContextDataUpdated(false);
    }
  }, [isContextDataUpdated, contextData, currentCanvasPointer]);

  const savebgCanvasContext = async () => {
    if (backgroundCanvasRef.current) {
      const context = backgroundCanvasRef.current.getContext("2d");
      if (context) {
        await new Promise((resolve) => {
          setContextData((prevdata) => {
            const updatedData = [
              ...prevdata,
              [backgroundCanvasRef.current!.toDataURL()],
            ];
            resolve(updatedData);
            return updatedData;
          });
        });
        setIsContextDataUpdated(true);
      }
    }
  };

  const undoCanvasContext = () => {
    if (backgroundCanvasRef.current && contextData) {
      const context = backgroundCanvasRef.current.getContext("2d");
      if (context) {
        const image = new Image();
        image.onload = () => {
          context.clearRect(
            0,
            0,
            backgroundCanvasRef.current!.width,
            backgroundCanvasRef.current!.height
          );
          context.drawImage(image, 0, 0);
        };
        if (currentCanvasPointer <= 0) {
          // image.src = contextData[0][0];
          return;
        }
        image.src = contextData[currentCanvasPointer - 1][0];
        setCurrentCanvasPointer(currentCanvasPointer - 1);
        sendDataToPeer(latestContext, currentCanvasPointer);
      }
    }
  };

  const redoCanvasContext = () => {
    if (backgroundCanvasRef.current && contextData) {
      const context = backgroundCanvasRef.current.getContext("2d");
      if (context) {
        const image = new Image();
        image.onload = () => {
          context.clearRect(
            0,
            0,
            backgroundCanvasRef.current!.width,
            backgroundCanvasRef.current!.height
          );
          context.drawImage(image, 0, 0);
        };

        if (currentCanvasPointer >= contextData.length - 1) {
          // notify that nothing to redo
          return;
        }

        image.src = contextData[currentCanvasPointer + 1][0];
        setCurrentCanvasPointer(currentCanvasPointer + 1);
        sendDataToPeer(latestContext, currentCanvasPointer + 2);
      }
    }
  };

  useEffect(() => {}, [contextData, currentCanvasPointer]);

  // socket io
  useEffect(() => {
    if (!onBoard) {
      // When not actively drawing, copy the temporary canvas to the background canvas
      const backgroundCanvas = backgroundCanvasRef.current;
      const drawingCanvas = canvasRef.current;
      if (backgroundCanvas && drawingCanvas) {
        const bgCtx = backgroundCanvas.getContext("2d");
        const drawingCtx = drawingCanvas.getContext("2d");
        if (bgCtx && drawingCtx) {
          // Copy the temporary canvas to the background canvas without clearing it
          // send this to peer [drawingCanvas]
          bgCtx.drawImage(drawingCanvas, 0, 0);

          // Clear the temporary canvas
          drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        }
      }
    }
  }, [onBoard]);

  let prevsave1 = 0,
    prevsave2 = 0;

  useEffect(() => {
    if (
      elementName !== "brush" &&
      elementName !== "arrow" &&
      prevsave1 == 0 &&
      onBoard
    ) {
      generateElement(mouseDown[0], mouseDown[1], mouseMove[0], mouseMove[1]);
      (prevsave1 = mouseMove[0]), (prevsave2 = mouseMove[1]);
    }
  }, [mouseMove]);

  useEffect(() => {
    if (elementName === "brush") {
      generateLinearPath(pathdata);
    }
  }, [pathdata]);

  const shapeOptions: Options = {
    stroke: strokeColor,
    strokeWidth: Number(strokeWidth),
    fill: fillColor + "50",
    roughness: 1,
    curveStepCount: 99,
    bowing: 1,
    curveFitting: 0.99,
    curveTightness: 0.8,
    dashGap: -1,
    dashOffset: -1,
    disableMultiStroke: true,
    disableMultiStrokeFill: false,
    fillShapeRoughnessGain: 10,
    fillStyle: "solid",
    fillWeight: -1,
    hachureAngle: -41,
    hachureGap: -1,
    maxRandomnessOffset: 3,
    preserveVertices: false,
    seed: 0,
    zigzagOffset: -1,
  };

  const resetCanvas = () => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }
    }
    // setCurrentCanvasPointer(0);
    setpathdata([]);
    setPathdataHistory([]);
  };

  const resetCanvasWithBtn = () => {
    if (backgroundCanvasRef.current) {
      const context = backgroundCanvasRef.current.getContext("2d");
      if (context) {
        context.clearRect(
          0,
          0,
          backgroundCanvasRef.current.width,
          backgroundCanvasRef.current.height
        );
      }
    }
    setContextData([]);
    setCurrentCanvasPointer(0);
    setpathdata([]);
    setPathdataHistory([]);
    savebgCanvasContext();
    sendDataToPeer(contextData, -10000);
  };

  const generateLinearPath = (maindata: number[][]) => {
    if (!canvasRef.current) return;
    const roughCanvas = rough.canvas(canvasRef.current);
    const generator = roughCanvas.generator;
    let linearPath = generator.linearPath(
      maindata.map((input) => [input[0], input[1]]),
      shapeOptions
    );
    roughCanvas.draw(linearPath);
  };

  const generateElement = (
    downx: number,
    downy: number,
    upx: number,
    upy: number
  ) => {
    if (prevsave1 != upx || prevsave2 != upy) {
      resetCanvas();
    }

    if (!canvasRef.current) return;

    const roughCanvas = rough.canvas(canvasRef.current);
    const generator = roughCanvas.generator;

    let rect1 = generator.rectangle(
      downx,
      downy,
      upx - downx,
      upy - downy,
      shapeOptions
    );

    let line1 = generator.line(downx, downy, upx, upy, shapeOptions);

    let circle1 = generator.circle(
      (downx + upx) / 2,
      (downy + upy) / 2,
      Math.sqrt(Math.pow(upx - downx, 2) + Math.pow(upy - downy, 2)),
      shapeOptions
    );

    let shapeToDraw = rect1;

    switch (elementName) {
      case "line":
        shapeToDraw = line1;
        break;
      case "box":
        shapeToDraw = rect1;
        break;
      case "circle":
        shapeToDraw = circle1;
        break;
    }

    roughCanvas.draw(shapeToDraw);
  };

  const handleDownloadBgCanvas = () => {
    if (canvasRef.current) {
      const canvas = backgroundCanvasRef.current;

      if (canvas) {
        // const ctx = canvas.getContext("2d");

        // Create a new canvas with a black background
        const downloadCanvas = document.createElement("canvas");
        downloadCanvas.width = canvas.width;
        downloadCanvas.height = canvas.height;
        const downloadCtx = downloadCanvas.getContext("2d");

        if (downloadCtx) {
          // Fill the new canvas with black background
          downloadCtx.fillStyle = "#151515";
          downloadCtx.fillRect(
            0,
            0,
            downloadCanvas.width,
            downloadCanvas.height
          );

          // Draw the existing content onto the new canvas with black background
          downloadCtx.drawImage(canvas, 0, 0);

          // Download the new canvas with black background
          const link = document.createElement("a");
          link.download = "whiteboard.png"; // Use PNG for transparent backgrounds (optional)
          link.href = downloadCanvas.toDataURL("image/png"); // Specify PNG format (optional)
          link.click();
        } else {
          console.error("Failed to get downloadCtx");
        }
      } else {
        console.error("Failed to get canvas");
      }
    } else {
      console.error("Failed to get canvasRef.current");
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setOnBoard(true);
    setMouseDown([e.nativeEvent.offsetX, e.nativeEvent.offsetY]);
    if (elementName === "brush") setbrushDown(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (elementName === "brush" && brushDown)
      setpathdata((prevData) => [
        ...prevData,
        [e.nativeEvent.offsetX, e.nativeEvent.offsetY],
      ]);

    setMouseMove([e.nativeEvent.offsetX, e.nativeEvent.offsetY]);

    // if(isDrawing){
    //   drawLine(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    // }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setMouseUp([e.nativeEvent.offsetX, e.nativeEvent.offsetY]);
    setOnBoard(false);
    if (brushDown === true)
      setPathdataHistory((prevHistory) => [...prevHistory, pathdata]);
    setpathdata([]);
    setbrushDown(false);
  };

  return (
    <div className="vw-100 vh-100 overflow-hidden d-flex justify-content-center align-items-center flex-column ">
      <CreateRoomPopup
        status={popupStatus}
        onClose={() => setPopupStatus(!popupStatus)}
        setInRoomFunc={() => setInRoom(false)}
      />

      <div className="toolsContainer vw-100 p-2 mt-3">
        <div className="colorBox">
          <div className="tagContainer">
            <div className="boxcontainer">
              <input
                name="element"
                className="checkTag"
                id="arrow"
                type="radio"
                defaultChecked
                onClick={() => setElement("arrow")}
              />
              <label
                style={{ backgroundColor: "rgb(213, 230, 253)" }}
                className="thisislabel"
                htmlFor="arrow"
              >
                {" "}
                <FiMousePointer />{" "}
              </label>
            </div>

            <div className="boxcontainer">
              <input
                name="element"
                className="checkTag"
                id="line"
                type="radio"
                onClick={() => setElement("line")}
              />
              <label
                style={{ backgroundColor: "rgb(213, 230, 253)" }}
                className="thisislabel"
                htmlFor="line"
              >
                {" "}
                <FiMinus />{" "}
              </label>
            </div>

            <div className="boxcontainer">
              <input
                name="element"
                className="checkTag"
                id="brush"
                type="radio"
                onClick={() => setElement("brush")}
              />
              <label
                style={{ backgroundColor: "rgb(213, 230, 253)" }}
                className="thisislabel"
                htmlFor="brush"
              >
                {" "}
                <LuBrush />{" "}
              </label>
            </div>

            <div className="boxcontainer">
              <input
                name="element"
                className="checkTag"
                id="box"
                type="radio"
                onClick={() => setElement("box")}
              />
              <label
                style={{ backgroundColor: "rgb(213, 230, 253)" }}
                className="thisislabel"
                htmlFor="box"
              >
                {" "}
                <FiSquare />{" "}
              </label>
            </div>

            <div className="boxcontainer">
              <input
                name="element"
                className="checkTag"
                id="circle"
                type="radio"
                onClick={() => setElement("circle")}
              />
              <label
                style={{ backgroundColor: "rgb(213, 230, 253)" }}
                className="thisislabel"
                htmlFor="circle"
              >
                {" "}
                <FaRegCircle />{" "}
              </label>
            </div>
          </div>
        </div>

        <div className="colorBox">
          {/* <label htmlFor="color">Color: </label> */}

          <ColorPicker colorValue={strokeColor} setColorValue={setcolorHex} />
          <ColorPicker colorValue={fillColor} setColorValue={setfillColor} />

          <label htmlFor="range">Size: </label>
          <input
            style={{ width: "7rem" }}
            type="range"
            className="form-range"
            max={25}
            name="strokerange"
            id="strokerange"
            value={strokeWidth}
            onChange={(e) => setstrokeWidth(e.target.value)}
          />
          {/* <p>Email: {userlocal ? userlocal.email : null}</p> */}
        </div>

        <div style={{ scale: ".85" }}>
          {/* create room btn */}
          <button
            className="ms-1 me-1 rounded-5 "
            onClick={() =>
              inRoom ? leaveRoom(joinedRoomName) : setPopupStatus(!popupStatus)
            }
          >
            {!inRoom ? <MdOutlineGroupAdd /> : <MdGroups />}
          </button>

          <button
            className="ms-1 me-1 rounded-5 "
            onClick={() => resetCanvasWithBtn()}
          >
            <GrPowerReset />
          </button>
          <button className="ms-1 me-1 rounded-5" onClick={undoCanvasContext}>
            <LuUndo2 />
          </button>
          <button className="ms-1 me-1 rounded-5" onClick={redoCanvasContext}>
            <LuRedo2 />
          </button>
          <button
            className="ms-1 me-1 rounded-5"
            onClick={handleDownloadBgCanvas}
          >
            <FiDownload />
          </button>
          {/* <button className="btntemp ms-1 me-1 rounded-5">
            <p style={{margin:"0"}}>{joinedRoomName != "" ? joinedRoomName : 0 }</p>
          </button> */}
        </div>
      </div>

      <div className="canvasContainer">
        <canvas
          className="shadow-lg mt-3 mb-5 rounded-3"
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          width={window.innerWidth}
          height={window.innerHeight}
        />

        <canvas // send bg color
          ref={backgroundCanvasRef}
          // className="shadow-lg mt-3 mb-5 rounded-3"
          width={window.innerWidth}
          height={window.innerHeight}
        />
      </div>
    </div>
  );
};

export default Secured;

/*

use this func to write text on canvas
function draw() {
  const ctx = document.getElementById("canvas").getContext("2d");
  ctx.font = "48px serif";
  ctx.fillText("Hello world", 10, 50);
}

draw();

*/
