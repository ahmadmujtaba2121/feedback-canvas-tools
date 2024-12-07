import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Image as FabricImage, Text, Textbox, IEvent } from "fabric";
import { toast } from "sonner";
import { FileUploadHandler } from "./FileUploadHandler";
import { CanvasDialogs } from "./CanvasDialogs";

interface CanvasProps {
  activeTool: "select" | "pin" | "text" | null;
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

  const { handleDrop, handleFileInput } = FileUploadHandler({
    fabricCanvas,
    onLayerAdd,
  });

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
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = activeTool === "select";

    const handleCanvasClick = (e: IEvent) => {
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
      return () => fabricCanvas.off("mouse:down", handleCanvasClick);
    }
  }, [activeTool, fabricCanvas]);

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