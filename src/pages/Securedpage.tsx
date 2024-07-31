import { useRef, useState, useEffect } from "react";
import "./styles.css";
import rough from "roughjs";
import { Options } from "roughjs/bin/core";
import { LuBrush } from "react-icons/lu";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FiDownload, FiMinus, FiMousePointer, FiSquare } from "react-icons/fi";
import { FaRegCircle } from "react-icons/fa6";
import { GrPowerReset } from "react-icons/gr";
import { LuUndo2 } from "react-icons/lu";
import { LuRedo2 } from "react-icons/lu";
import { LuHistory } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebaseConfig.ts";
import { IoMdMore } from "react-icons/io";
import { GrNewWindow } from "react-icons/gr";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  addDoc,
  query,
  where,
  getFirestore,
} from "firebase/firestore";
import ColorPicker from "../components/ColorPicker.tsx";
import HistoryPanel from "../components/Modal.tsx";
import { OverlayInjectedProps } from "react-bootstrap/esm/Overlay";

const Secured = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, setMouseUp] = useState<[number, number]>([0, 0]);
  const [mouseDown, setMouseDown] = useState<[number, number]>([0, 0]);
  const [mouseMove, setMouseMove] = useState<[number, number]>([0, 0]);
  const [strokeColor, setcolorHex] = useState<string>("#ffffff");
  const [fillColor, setfillColor] = useState<string>("#000000");
  const [strokeWidth, setstrokeWidth] = useState<string>("1");
  const [elementName, setElement] = useState<string>("arrow");
  // const elementRef = useRef<HTMLLabelElement>(null); // Ref to hold the element

  const [pathdata, setpathdata] = useState<number[][]>([]);
  const [, setPathdataHistory] = useState<number[][][]>([]); // brush
  const [brushDown, setbrushDown] = useState(false);
  const [onBoard, setOnBoard] = useState(false);

  const [contextData, setContextData] = useState<string[][]>([]);
  const [isContextDataUpdated, setIsContextDataUpdated] = useState(false);

  // const [tempcontext, settempcontext] = useState<string[]>([]);
  const [currentCanvasPointer, setCurrentCanvasPointer] = useState<number>(-1);
  const [sessionName, setSessionName] = useState("");
  const [historyPopup, setHistoryPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<String[]>([]);

  // auth
  const [_, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // setup user drawing history
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [drawings, setDrawings] = useState<[]>([]);
  const [datesData, setDatesData] = useState<String[]>([]);
  const [sessionData, setSessionData] = useState<String[][]>([]);

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

  const generateNewSession = async () => {
    const { time, date } = getFormattedDateTime(false);
    const generatedName = "Session " + time;
    // check if a session already exists as generate name
    const currentdata = await getSessionData([date]);
    if (currentdata.some((input) => input.includes(generatedName))) {
      const { time, date } = getFormattedDateTime(true);
      const generatedName = "Session " + time;
      setSessionName(generatedName);
      return;
    }
    setSessionName(generatedName);
  };


  const renderTooltip = (props: OverlayInjectedProps, text: string) => (
    <Tooltip id="button-tooltip" {...props}>
      {text}
    </Tooltip>
  );

  // format date and time function
  function getFormattedDateTime(incrementMinute: boolean) {
    const now = new Date();
    const day = now.getDate();
    const monthNames = [
      "Jan",
      "Feb",
      "March",
      "April",
      "May",
      "Jun",
      "July",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();

    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const minutesplusone = (now.getMinutes() + 1).toString().padStart(2, "0");
    const seconds = now.getSeconds();

    const date = `${day} ${month} ${year}`;
    let time = `${hours}:${minutes}`;

    if (incrementMinute) {
      time = `${hours}:${minutesplusone}`;
    }

    return { date, time };
  }

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

  // send data to firebase storage
  function sendDataToFirebase(data: object) {
    const uid = auth.currentUser?.uid;

    let { date, time } = getFormattedDateTime(false);
    let dbUrl = ``;

    if (!sessionName) {
      dbUrl = `${uid}/${date}/Sessions/${"Session " + time}`; // first session
      setDoc(doc(db, `${uid}/${date}/`), { f: "v" }); // adding some temp data to make the document queryable, will'be ignored while fetching data
      setSessionName("Session " + time);
    } else {
      dbUrl = `${uid}/${date}/Sessions/${sessionName}`; // later sessions
    }

    const userDocRef = doc(db, dbUrl);

    setDoc(userDocRef, { dataArray: data })
      .then(() => {
        console.log("Document successfully written!");
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
  }

  // type for data object
  type DataObject = {
    [key: number]: string;
  };

  const convertArrayToObj = (input: string[][]) => {
    const dataObject: DataObject = input.reduce(
      (acc: DataObject, curr: string[], index: number) => {
        acc[index] = curr[0];
        return acc;
      },
      {}
    );

    return dataObject;
  };

  useEffect(() => {
    // send data to firestore db);
    if (auth.currentUser) {
      const contextObj = convertArrayToObj(contextData);
      sendDataToFirebase(contextObj);
    } else {
      // // console.log("auth not available");
    }
    setCurrentCanvasPointer(contextData.length - 1);
    reDrawCanvasUpdateContext();
  }, [contextData]);

  const getDatesData = async () => {
    const uid = auth.currentUser?.uid;

    // get all documents in a collection
    let tempDatesData: String[] = [];

    const queryToGetAllDatesData = await getDocs(collection(db, `${uid}/`));

    queryToGetAllDatesData.forEach((input) => {
      tempDatesData = [...tempDatesData, input.id];
    });

    setDatesData(tempDatesData);
    getSessionData(tempDatesData);
  };

  // useEffect(() => {
  //   console.log('session data updated', sessionData)
  // },[sessionData])

  const getSessionData = async (tempDatesData: String[]) => {
    console.log("getting session data");
    const uid = auth.currentUser?.uid;

    let tempSessionData: string[][] = [];

    // Use Promise.all to wait for all async operations to complete
    await Promise.all(
      tempDatesData.map(async (input, index) => {
        const queryToGetAllSessionData = await getDocs(
          collection(db, `${uid}/${input}/Sessions`)
        );

        // Initialize the sub-array if it doesn't exist
        if (!tempSessionData[index]) {
          tempSessionData[index] = [];
        }

        queryToGetAllSessionData.forEach((doc) => {
          tempSessionData[index].push(doc.id);
        });
      })
    );

    setSessionData(tempSessionData);
    setIsLoading(false);

    return tempSessionData;
  };

  // recieve data from firebase
  useEffect(() => {
    if (datesData.length == 0) {
      // optional - isHistoryOpen as condition => leads to more read req
      setIsLoading(true);
      getDatesData();
    }
  }, [isHistoryOpen]);

  const handleSelectSession = async (sessionName: String[]) => {
    setSelectedSession(sessionName);
    // // console.log("Selected session:", sessionName);
    const uid = auth.currentUser?.uid;
    const getDrawing = await getDoc(
      doc(db, `${uid}/${selectedSession[0]}/Sessions/${selectedSession[1]}`)
    );

    const originalData = getDrawing.data();
    // console.log(getDrawing.data())
    // Create a new array to hold the transformed data
    const transformedData = [];

    // Iterate through the original data and create new arrays
    if (originalData) {
      for (let i = 0; i < Object.keys(originalData.dataArray).length; i++) {
        transformedData.push([originalData.dataArray[i]]);
      }
    }

    // console.log(transformedData);
    setContextData(transformedData);
    setIsHistoryOpen(false);
  };

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

  // fixes drawing last element except current one...
  useEffect(() => {
    if (isContextDataUpdated) {
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
    fill: fillColor,
    // fill: fillColor + "50",
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
      case "text":
        // generateText(100, 150, "I'm Aryan Karma");
        break;
    }

    roughCanvas.draw(shapeToDraw);
  };

  // function generateText(x: number, y: number, text: string) {
  //   if (backgroundCanvasRef.current) {
  //     let ctx = backgroundCanvasRef.current.getContext("2d");
  //     if (ctx != null) {
  //       ctx.font = "48px serif";
  //       ctx.fillStyle = "white"
  //       ctx.fillText(text, x, y);
  //     }
  //   }
  // }

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

            {/* <div className="boxcontainer">
              <input
                name="element"
                className="checkTag"
                id="text"
                type="radio"
                onClick={() => setElement("text")}
              />
              <label
                style={{
                  backgroundColor: "rgb(213, 230, 253)",
                  padding: ".5rem 1.25rem",
                }}
                className="thisislabel"
                htmlFor="text"
              >
                T
              </label>
            </div> */}
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
          <OverlayTrigger
            placement="bottom"
            delay={{ show: 200, hide: 200 }}
            overlay={(props) => renderTooltip(props, "Reset Canvas")}
          >
            <button
              className="ms-1 me-1 rounded-5 "
              onClick={() => resetCanvasWithBtn()}
            >
              <GrPowerReset />
            </button>
          </OverlayTrigger>

          <OverlayTrigger
            placement="bottom"
            delay={{ show: 200, hide: 200 }}
            overlay={(props) => renderTooltip(props, "Undo")}
          >
            <button className="ms-1 me-1 rounded-5" onClick={undoCanvasContext}>
              <LuUndo2 />
            </button>
          </OverlayTrigger>

          <OverlayTrigger
            placement="bottom"
            delay={{ show: 200, hide: 200 }}
            overlay={(props) => renderTooltip(props, "Redo")}
          >
            <button className="ms-1 me-1 rounded-5" onClick={redoCanvasContext}>
              <LuRedo2 />
            </button>
          </OverlayTrigger>

          <OverlayTrigger
            placement="bottom"
            delay={{ show: 200, hide: 200 }}
            overlay={(props) => renderTooltip(props, "Show History")}
          >
            <button
              className="ms-1 me-1 rounded-5"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            >
              <LuHistory />
            </button>
          </OverlayTrigger>

          <OverlayTrigger
            placement="bottom"
            delay={{ show: 200, hide: 200 }}
            overlay={(props) => renderTooltip(props, "Download Canvas")}
          >
            <button
              className="ms-1 me-1 rounded-5"
              onClick={handleDownloadBgCanvas}
            >
              <FiDownload />
            </button>
          </OverlayTrigger>

          <OverlayTrigger
            placement="bottom"
            delay={{ show: 200, hide: 200 }}
            overlay={(props) => renderTooltip(props, "New Canvas")}
          >
            <button
              className="ms-1 me-1 rounded-5"
              onClick={() => {
                resetCanvasWithBtn();
                generateNewSession();
              }}
            >
              <GrNewWindow />
            </button>
          </OverlayTrigger>
        </div>
      </div>

      <HistoryPanel
        isOpen={isHistoryOpen}
        datesData={datesData}
        sessionData={sessionData}
        isLoading={isLoading}
        onSelectSession={handleSelectSession}
      />

      <div className="canvasContainer">
        <canvas
          className="shadow-lg mb-5 rounded-3"
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          width={window.innerWidth}
          height={window.innerHeight}
        />

        <canvas // send bg color
          ref={backgroundCanvasRef}
          id="bgCanvas"
          // className="shadow-lg mb-5 rounded-3"
          width={window.innerWidth}
          height={window.innerHeight}
        />
      </div>
    </div>
  );
};

export default Secured;
