import { useRef } from "react";

type ColorPickerPros = {
  setColorValue: (colorValue: string) => void;
  colorValue: string;
};

export default function ColorPicker({
  setColorValue,
  colorValue,
}: ColorPickerPros) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <div
        style={{
          width: "30px",
          height: "30px",
          outline: "1px solid white",
          borderRadius: "50%",
          backgroundColor: colorValue,
        }}
        onClick={(e) => {
          e.preventDefault();
          console.log("Clicked");
          inputRef.current?.click();
        }}
      ></div>
      <input
        style={{
          visibility: "hidden",
          position: "absolute",
          bottom: "-50%",
          right: "-50%",
        }}
        ref={inputRef}
        type="color"
        value={colorValue}
        onChange={(e) => setColorValue(e.target.value)}
      />
    </div>
  );
}
