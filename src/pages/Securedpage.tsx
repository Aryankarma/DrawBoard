// import RoughCanvas, {ref} from "../components/RoughCanvas";
import { useRef, useState, useEffect } from "react";
import rough from 'roughjs';

const Secured = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mouseUp, setMouseUp] = useState<[number, number]>([0, 0]);
  const [mouseDown, setMouseDown] = useState<[number, number]>([0, 0]);
  const [mouseMove, setMouseMove] = useState<[number, number]>([0, 0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pencilData, setPencilData] = useState([[]])
  const [pathdata, setpathdata] = useState<number[][]>([]);



  useEffect(()=>{
    generateElement(mouseDown[0], mouseDown[1], mouseUp[0], mouseUp[1])
  }, [mouseUp])

  useEffect(()=>{
    // console.log(pathdata)  
    // const maindata = pathdata.map((input) =>  (input[0], input[1]))
    generateLinearPath(pathdata)
  }, [pathdata])

  const generateLinearPath = (maindata: number[][]) => {
    if(!canvasRef.current) return;
    const roughCanvas = rough.canvas(canvasRef.current);
    const generator = roughCanvas.generator;
    let linearPath = generator.linearPath(maindata.map((input) => [input[0], input[1]]))
    roughCanvas.draw(linearPath)
  }

  const generateElement = ( downx1: number, downx2: number, upx1: number, upx2: number ) => {
    if(!canvasRef.current) return;
    const roughCanvas = rough.canvas(canvasRef.current);
    const generator = roughCanvas.generator;

    let rect1 = generator.rectangle( downx1, downx2, upx1 - downx1, upx2 - downx2, {
      fill:"red",
      stroke: "white",
      roughness: 0,
      strokeWidth: 5,
    });
    
    let line1 = generator.line( downx1, downx2, upx1, upx2, {
      stroke:"red"
    });

    let circle1 = generator.circle( (downx1 + upx1)/2, (downx2 + upx2)/2 , Math.sqrt(Math.pow(upx1 - downx1, 2) + Math.pow(upx2 - downx2, 2)), {
      fill:"red"
    });

    let ellipse1 = generator.ellipse( (downx1 + upx1)/2, (downx2 + upx2)/2, upx1 - downx1, upx2 - downx2, {
      stroke: "white",
    });

    
    // console.log("values from generator: ", downx1, downx2, upx1, upx2)
    roughCanvas.draw(ellipse1);
  }

  const drawLine = (x: number, y: number) => {
    // console.log(x, y)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setpathdata(prevData => [...prevData, [e.nativeEvent.offsetX, e.nativeEvent.offsetY]]);
    // console.log(pathdata)
    // setMouseMove([e.nativeEvent.offsetX, e.nativeEvent.offsetY]);
    // if(isDrawing){
    //   drawLine(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    // }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setMouseDown([e.nativeEvent.offsetX, e.nativeEvent.offsetY]);
    setIsDrawing(true)
    // console.log(mouseDown[0], mouseDown[1])
    // console.log( e.nativeEvent.offsetX, e.nativeEvent.offsetY)
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setMouseUp([e.nativeEvent.offsetX, e.nativeEvent.offsetY]);
    // console.log(mouseUp[0], mouseUp[1])
    setIsDrawing(false)
    // console.log(mouseUp[0], mouseUp[1])
    // generateElement(mouseUp[0], mouseUp[1], mouseDown[0], mouseDown[1])
  };

  return (
    <div className="overflow-hidden d-flex justify-content-center align-items-center flex-column ">
      <div className="vw-100 p-2">
        <input
          name="line"
          id="line"
          type="checkbox"
        />
        <label htmlFor="line">line</label>
      </div>

      <canvas
        className="border border-light border-3"
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        width={window.innerWidth - 100}
        height={window.innerHeight - 150}
      />
    </div>
  );
};

export default Secured;