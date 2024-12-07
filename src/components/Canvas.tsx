import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas } from "fabric";
import { toast } from "sonner";

interface CanvasProps {
  activeTool: "select" | "pin" | "text" | null;
  onLayerAdd: (layer: any) => void;
}

export const Canvas = ({ activeTool, onLayerAdd }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth - 400, // Account for toolbar and layers panel
      height: window.innerHeight - 100, // Account for header
      backgroundColor: "#ffffff",
    });

    setFabricCanvas(canvas);

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const fabricImage = new fabric.Image(img);
          canvas.add(fabricImage);
          canvas.renderAll();
          onLayerAdd({ type: "image", id: Date.now(), element: fabricImage });
          toast.success("Image added to canvas");
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    };

    canvasRef.current.addEventListener("drop", handleDrop);
    canvasRef.current.addEventListener("dragover", (e) => e.preventDefault());

    return () => {
      canvas.dispose();
      canvasRef.current?.removeEventListener("drop", handleDrop);
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = activeTool === "select";

    if (activeTool === "pin") {
      const handleClick = (e: fabric.IEvent) => {
        const pointer = fabricCanvas.getPointer(e.e);
        const text = new fabric.Text("📌", {
          left: pointer.x,
          top: pointer.y,
          fontSize: 24,
        });
        fabricCanvas.add(text);
        onLayerAdd({ type: "pin", id: Date.now(), element: text });
        toast.success("Pin added");
      };

      fabricCanvas.on("mouse:down", handleClick);
      return () => fabricCanvas.off("mouse:down", handleClick);
    }

    if (activeTool === "text") {
      const handleClick = (e: fabric.IEvent) => {
        const pointer = fabricCanvas.getPointer(e.e);
        const text = new fabric.Textbox("Add your review here", {
          left: pointer.x,
          top: pointer.y,
          width: 200,
          fontSize: 16,
          fill: "#1f2937",
        });
        fabricCanvas.add(text);
        onLayerAdd({ type: "text", id: Date.now(), element: text });
        toast.success("Text box added");
      };

      fabricCanvas.on("mouse:down", handleClick);
      return () => fabricCanvas.off("mouse:down", handleClick);
    }
  }, [activeTool, fabricCanvas]);

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4">
      <canvas ref={canvasRef} className="shadow-lg rounded-lg" />
    </div>
  );
};