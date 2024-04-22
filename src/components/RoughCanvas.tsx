import React, { useRef, useEffect, useState } from 'react';
import rough from 'roughjs';

interface RoughProps {
  width: number;
  height: number;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

const RoughCanvas: React.FC<RoughProps> = ({ width, height, onMouseMove, onMouseDown, onMouseUp }) => {
  
  const canvasstyle = {
    outline: "3px solid white"
  }
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {

      const rc = rough.canvas(canvasRef.current);
      console.log(rc)

      // rc.line(60, 60, 190, 60);
      // rc.line(60, 60, 190, 60, {strokeWidth: 5});

      // rc.rectangle(10, 10, 100, 100, {
      //   fill:"yellow"
      // });

      console.log("under")

      const generator = rc.generator;
      let rect1 = generator.line(50, 50, 100, 100, {
        fill:"white",
        stroke:"white"
      });

      let rect2 = generator.line(50, 10, 230, 600, {
        fill:"white",
        stroke:"white"
      });


      let temppath = rc.linearPath([[40, 10], [200, 20], [250, 120], [300, 100]], {
        stroke: 'red', strokeWidth: 4,
        fill: 'rgba(255,255,0,0.4)', fillStyle: 'solid'      
      });

      rc.draw(rect2);
      rc.draw(rect1);
      rc.draw(temppath);

    }

  }, []);

  return <canvas style={canvasstyle} ref={canvasRef} width={width} height={height} onMouseMove={onMouseMove} onMouseDown={onMouseDown} onMouseUp={onMouseUp}/>;
};

export default RoughCanvas;