// import RoughCanvas, {ref} from "../components/RoughCanvas";
import { useRef, useState, useEffect, createElement } from "react";
import rough from "roughjs";
import { socket } from "../socket.ts";
import { Options } from "roughjs/bin/core";
import { LuBrush, LuPencil } from "react-icons/lu";
import { FiDownload, FiMinus, FiMousePointer, FiSquare } from "react-icons/fi";
import { FaRegCircle } from "react-icons/fa6";
import { GrPowerReset } from "react-icons/gr";
import { LuUndo2 } from "react-icons/lu";
import { LuRedo2 } from "react-icons/lu";
import { MdDownload } from "react-icons/md";
import "./styles.css";
import { FaPaintBrush } from "react-icons/fa";
import { IoColorPaletteOutline } from "react-icons/io5";

const Secured = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mouseUp, setMouseUp] = useState<[number, number]>([0, 0]);
  const [mouseDown, setMouseDown] = useState<[number, number]>([0, 0]);
  const [mouseMove, setMouseMove] = useState<[number, number]>([0, 0]);
  const [strokeColor, setcolorHex] = useState<string>("#ffffff");
  const [fillColor, setfillColor] = useState<string>("#0000ff");
  const [strokeWidth, setstrokeWidth] = useState<string>("1");
  const [elementName, setElement] = useState<string>("arrow");
  // const elementRef = useRef<HTMLLabelElement>(null); // Ref to hold the element

  const [pathdata, setpathdata] = useState<number[][]>([]);
  const [pathdataHistory, setPathdataHistory] = useState<number[][][]>([]); // brush
  const [brushDown, setbrushDown] = useState(false);
  const [onBoard, setOnBoard] = useState(false);

  const [contextData, setContextData] = useState<string[][]>([]);
  const [latestContext, setLatestContext] = useState<string>();
  const [tempcontext, settempcontext] = useState<string[]>([]);
  const [currentCanvasPointer, setCurrentCanvasPointer] = useState<number>(0);

  const [rerender, setrerender] = useState<number>(0)

  const drawingCanvasRef = useRef(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // sending data from client to server 
  const sendDataToPeer = (contextData: string[][], canvasPointer: number, backgroundCanvasData: HTMLCanvasElement) => {
    socket.emit("ultimateSharing", contextData, canvasPointer ? canvasPointer : -100)
  };   
  
  // recieving data from the server
  useEffect(() => {
    socket.on("ultimateSharing", (ultimateContext, ultimateNumber) => {
      // console.log("ultimate input <<< ", ultimateContext);
      // console.log("ultimate input number <<< ", ultimateNumber);
      ultimateContext != null ? setContextData(ultimateContext) : null;
      // console.log(ultimateContext)
      // console.log("not so ultimatcanvasPointer ? canvasPointer : -100 context : ", ultimateContext);
      // console.log(ultimateContext[ultimateNumber - 1][0]);
      
      if (ultimateNumber == -10000) {
        resetPeerContext();
      }

      if (ultimateContext[ultimateNumber - 1][0]) {
        console.log("image source is available");

        // when the reDrawCanvasUpdateContext runs after reDrawCanvasForUndoRedo undo does not work, this timeout is keeping it to execute that function before reDrawCanvasForUndoRedo
        setTimeout(() => {
          reDrawCanvasForUndoRedo(ultimateContext[ultimateNumber - 1][0]);
        }, 10);
      }
    });

    return () => {
      // socket.off("contextSharing");
      // socket.off("canvasPointer")
      socket.off("ultimateSharing")
    };

  }, []);

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
    }

  useEffect(() => {
    setCurrentCanvasPointer(contextData.length - 1);
    setLatestContext(contextData);
    // console.log(contextData)
    // console.log("current canvas pointer from useEffect:", currentCanvasPointer);
    reDrawCanvasUpdateContext();
    // console.log("both context and currentCanvasPointer");
  }, [contextData]);

  const reDrawCanvasUpdateContext = () => {
    console.log("reDrawCanvasUpdateContext is running");
    if (backgroundCanvasRef.current) {
      const context = backgroundCanvasRef.current.getContext("2d");
      if (context) {
        const image = new Image();
        image.onload = () => {
          // console.log("undo from peer")
          context.clearRect(
            0,
            0,
            backgroundCanvasRef.current!.width,
            backgroundCanvasRef.current!.height
          );
          context.drawImage(image, 0, 0);
        };
        // console.log(contextData[contextData.length - 1]);
        // console.log("before: ", image.src)
          image.src = contextData[contextData.length - 1]
            ? contextData[contextData.length - 1][0]
            : null;
      }
    }
  };

  const reDrawCanvasForUndoRedo = (imageSource: string) => {
    console.log("actual image source : ", imageSource);
    if (backgroundCanvasRef.current) {
      const context = backgroundCanvasRef.current.getContext("2d");
      if (context) {
        const image = new Image();
        image.onload = () => {
          // console.log("undo from peer")
          context.clearRect(
            0,
            0,
            backgroundCanvasRef.current!.width,
            backgroundCanvasRef.current!.height
          );
          context.drawImage(image, 0, 0);
        };
        // console.log(contextData[contextData.length - 1]);
        // console.log("before: ", image.src)
        if (imageSource) {
          // console.log('this is canvas pointer', canvasPointer)
          // console.log("undo on other window so setting up another canvas")
          // console.log(contextData[canvasPointer])
          // console.log("inside redraw context ", contextData)
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

  useEffect(() => {
    // console.log(contextData)
  }, [contextData]);

  const saveCanvasContext = () => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        setContextData((prevdata) => [
          ...prevdata,
          [canvasRef.current.toDataURL()],
        ]);
      }
    }
  };

  const savebgCanvasContext = () => {
    if (backgroundCanvasRef.current) {
      const context = backgroundCanvasRef.current.getContext("2d");
      if (context) {
        setContextData((prevdata) => [
          ...prevdata,
          [backgroundCanvasRef.current.toDataURL()],
        ]);
      }
    }
  };

  const runthisonce = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const dataURL = contextData[contextData.length - 1];
        if (dataURL) {
          const image = new Image();
          image.onload = function () {
            ctx.drawImage(image, 0, 0);
          };
          image.src = dataURL[0];
        } else {
          console.error("No data URL found in contextData");
        }
      } else {
        console.error("Failed to get 2D context");
      }
    } else {
      console.error("canvasRef.current is null or undefined");
    }
  }; 

  const undoCanvasContext = () => {
    // console.log("undo canvas is triggered")
    if (backgroundCanvasRef.current && contextData) {
      const context = backgroundCanvasRef.current.getContext("2d");
      if (context) {
        const image = new Image();
        image.onload = () => {
          // console.log("undo from peer")
          context.clearRect(
            0,
            0,
            backgroundCanvasRef.current!.width,
            backgroundCanvasRef.current!.height
          );
          context.drawImage(image, 0, 0);
        };
        // currentCanvasPointer != 0 ? sendDataToPeer(latestContext) : null;
        if (currentCanvasPointer <= 0) {
          // notify that "nothing to undo"
          return;
        }
        image.src = contextData[currentCanvasPointer - 1][0];
        setCurrentCanvasPointer(currentCanvasPointer - 1);
        // console.log(image.src);
        sendDataToPeer(latestContext, currentCanvasPointer-1);
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
        // console.log("currentCanvasPointer when you redo ", currentCanvasPointer)
        // console.log("send data now ", currentCanvasPointer);
        // currentCanvasPointer != 0 ? sendDataToPeer(latestContext) : null; 
        if (currentCanvasPointer >= contextData.length - 1) {
          // notify that "nothing to redo
          return;
        }

        image.src = contextData[currentCanvasPointer + 1][0];
        setCurrentCanvasPointer(currentCanvasPointer + 1);
        sendDataToPeer(latestContext, currentCanvasPointer + 1);
      }
    }
  };

  useEffect(() => {}, [contextData]);

  useEffect(() => {
    // console.log(currentCanvasPointer)
  }, [currentCanvasPointer]);

  useEffect(() => {
    // console.log(currentCanvasPointer)
  }, []);

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
          // console.log(drawingCanvas)
          bgCtx.drawImage(drawingCanvas, 0, 0);

          // Clear the temporary canvas
          drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        }
        sendDataToPeer(contextData);
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
    fill: fillColor + "25",
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
    // console.log("resetting canvas")
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

    // let linearPath = generator.linearPath(maindata.map((input) => [input[0], input[1]]), shapeOptions)
    // roughCanvas.draw(linearPath)

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
        const ctx = canvas.getContext("2d");

        // Create a new canvas with a black background
        const downloadCanvas = document.createElement("canvas");
        downloadCanvas.width = canvas.width;
        downloadCanvas.height = canvas.height;
        const downloadCtx = downloadCanvas.getContext("2d");

        if (downloadCtx) {
          // Fill the new canvas with black background
          downloadCtx.fillStyle = "#212529";
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

  const handleDownload = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Create a new canvas with a black background
      const downloadCanvas = document.createElement("canvas");
      downloadCanvas.width = canvas.width;
      downloadCanvas.height = canvas.height;
      const downloadCtx = downloadCanvas.getContext("2d");

      if (downloadCtx) {
        // Fill the new canvas with black background
        downloadCtx.fillStyle = "#212529";
        downloadCtx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

        // Draw the existing content onto the new canvas with black background
        downloadCtx.drawImage(canvas, 0, 0);
      }

      // Download the new canvas with black background
      const link = document.createElement("a");
      link.download = "whiteboard.png"; // Use PNG for transparent backgrounds (optional)
      link.href = downloadCanvas.toDataURL("image/png"); // Specify PNG format (optional)
      link.click();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setOnBoard(true);
    setMouseDown([e.nativeEvent.offsetX, e.nativeEvent.offsetY]);
    if (elementName === "brush") setbrushDown(true);
    // console.log(mouseDown[0], mouseDown[1])
    // console.log( e.nativeEvent.offsetX, e.nativeEvent.offsetY)44
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
    // console.log(mouseUp[0], mouseUp[1])
    if (brushDown === true)
      setPathdataHistory((prevHistory) => [...prevHistory, pathdata]);
    setpathdata([]);
    setbrushDown(false);
    // console.log(pathdataHistory)

    // saveCanvasContext()
    // runthisonce()

    // console.log(pathdataHistory);
    // console.log(contextData)
  };

  const tempstyle = {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: "10px",
  };

  const tempstyle2 = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  return (
    <div className="overflow-hidden d-flex justify-content-center align-items-center flex-column ">
      <div style={tempstyle} className="vw-100 p-2">
        <div style={tempstyle2}>
          <div className="tagContainer">
            <div className="boxcontainer">
              <input
                name="element"
                className="checkTag"
                id="arrow"
                type="radio"
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

        <div style={tempstyle2}>
          <label htmlFor="color">Color: </label>
          <input
            type="color"
            name="color"
            id="color"
            value={strokeColor}
            onChange={(e) => setcolorHex(e.target.value)}
          />

          <label htmlFor="color">Fill Color: </label>
          <input type="color" name="fillcolor" id="fillcolor" value={fillColor} onChange={(e)=> setfillColor(e.target.value)} />

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
          {/* <input type="range" className="" max={25} name="strokerange" id="strokerange" value={strokeWidth} onChange={(e)=> setstrokeWidth(e.target.value)} /> */}
        </div>

        <div style={{ scale: ".85" }}>
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
        </div>
      </div>

      <div className="canvasContainer">
        <canvas
          // className="shadow-lg mt-3 mb-5 rounded-3"
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          width={window.innerWidth - 100}
          height={window.innerHeight - 175}
        />

        <canvas // send bg color
          ref={backgroundCanvasRef}
          // className="shadow-lg mt-3 mb-5 rounded-3"
          width={window.innerWidth - 100}
          height={window.innerHeight - 175}
        />
      </div>
    </div>
  );
};

export default Secured;

// updates to do now -

// fix -1 sharing of context
// undo redo functionality sync with peers


// extra features to add -
// 1. add a stg option where user can set
//    - canvas bg color
//    - configure the element bg styles
//    - configure the shapeOptions like randomness etc

//  Workings for socket io
  //// - check the element updation if updated on peer 1 - send the context string to other peers and set them
////   - share the context and set it on each new element generation\