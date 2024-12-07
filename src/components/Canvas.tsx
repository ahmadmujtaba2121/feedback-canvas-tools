import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush, Image as FabricImage, Text, Textbox, TEvent } from "fabric";
import { toast } from "sonner";
import { FileUploadHandler } from "./FileUploadHandler";
import { CanvasDialogs } from "./CanvasDialogs";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CanvasProps {
  activeTool: "select" | "pin" | "text" | "draw" | null;
  onLayerAdd: (layer: any) => void;
}

export const Canvas = ({ activeTool, onLayerAdd }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });
  const [commentData, setCommentData] = useState<any>({});
  const [textData, setTextData] = useState<any>({
    fontSize: 16,
    fontFamily: "Arial",
    textAlign: "left",
  });
  const [drawingColor, setDrawingColor] = useState("#000000");

  const { handleDrop, handleFileInput } = FileUploadHandler({
    fabricCanvas,
    onLayerAdd,
  });

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth - 400,
      height: window.innerHeight - 100,
      backgroundColor: "#ffffff",
    });

    canvas.on('object:added', (e) => {
      if (e.target) {
        e.target.set({
          cornerStyle: 'circle',
          cornerColor: '#0ea5e9',
          cornerStrokeColor: '#0369a1',
          cornerSize: 12,
          transparentCorners: false,
          rotatingPointOffset: 40,
        });
      }
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
      setFabricCanvas(null);
    };
  }, []);

  // Handle tool changes
  useEffect(() => {
    if (!fabricCanvas) return;

    let cleanup: (() => void) | undefined;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    fabricCanvas.selection = activeTool === "select";

    if (activeTool === "draw") {
      const brush = new PencilBrush(fabricCanvas);
      brush.color = drawingColor;
      brush.width = 2;
      fabricCanvas.freeDrawingBrush = brush;
    }

    const handleCanvasClick = (e: TEvent) => {
      const pointer = fabricCanvas.getPointer(e.e);
      setCommentPosition({ x: pointer.x, y: pointer.y });

      if (activeTool === "pin") {
        setShowCommentDialog(true);
      } else if (activeTool === "text") {
        setShowTextDialog(true);
      }
    };

    if (activeTool === "pin" || activeTool === "text") {
      fabricCanvas.on("mouse:down", handleCanvasClick);
      cleanup = () => fabricCanvas.off("mouse:down", handleCanvasClick);
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [activeTool, fabricCanvas, drawingColor]);

  const handleAddComment = () => {
    if (!fabricCanvas || !commentData.author || !commentData.content) return;

    const commentGroup = new Text(`💬 ${commentData.author}: ${commentData.content}`, {
      left: commentPosition.x,
      top: commentPosition.y,
      fontSize: 14,
      fill: "#1f2937",
      backgroundColor: "#f3f4f6",
      padding: 8,
      selectable: true,
    });

    fabricCanvas.add(commentGroup);
    fabricCanvas.renderAll();
    onLayerAdd({ type: "comment", id: Date.now(), element: commentGroup });
    setShowCommentDialog(false);
    setCommentData({});
    toast.success("Comment added");
  };

  const handleAddText = () => {
    if (!fabricCanvas || !textData.content) return;

    const text = new Textbox(textData.content, {
      left: commentPosition.x,
      top: commentPosition.y,
      width: 200,
      fontSize: textData.fontSize,
      fontFamily: textData.fontFamily,
      textAlign: textData.textAlign as any,
      fill: "#1f2937",
    });

    fabricCanvas.add(text);
    fabricCanvas.renderAll();
    onLayerAdd({ type: "text", id: Date.now(), element: text });
    setShowTextDialog(false);
    setTextData({ fontSize: 16, fontFamily: "Arial", textAlign: "left" });
    toast.success("Text added");
  };

  return (
    <div 
      className="flex-1 overflow-auto bg-gray-50 p-4"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        id="file-input"
      />
      {activeTool === "draw" && (
        <div className="fixed top-4 right-4 z-10">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-12 h-12 p-2">
                <div className="w-full h-full rounded" style={{ backgroundColor: drawingColor }} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-none">
              <div className="p-2 bg-white rounded-lg shadow-lg">
                <input
                  type="color"
                  value={drawingColor}
                  onChange={(e) => setDrawingColor(e.target.value)}
                  className="w-8 h-8 p-0 border-none"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
      <canvas ref={canvasRef} className="shadow-lg rounded-lg" />

      <CanvasDialogs
        showCommentDialog={showCommentDialog}
        setShowCommentDialog={setShowCommentDialog}
        showTextDialog={showTextDialog}
        setShowTextDialog={setShowTextDialog}
        commentData={commentData}
        setCommentData={setCommentData}
        textData={textData}
        setTextData={setTextData}
        handleAddComment={handleAddComment}
        handleAddText={handleAddText}
      />
    </div>
  );
};