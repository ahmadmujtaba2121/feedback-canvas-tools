import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Image as FabricImage, Text, Textbox, TEvent } from "fabric";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CanvasProps {
  activeTool: "select" | "pin" | "text" | null;
  onLayerAdd: (layer: any) => void;
}

interface CommentData {
  id: string;
  author: string;
  content: string;
  position: { x: number; y: number };
}

interface TextData {
  content: string;
  fontSize: number;
  fontFamily: string;
  textAlign: "left" | "center" | "right";
}

export const Canvas = ({ activeTool, onLayerAdd }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });
  const [commentData, setCommentData] = useState<Partial<CommentData>>({});
  const [textData, setTextData] = useState<Partial<TextData>>({
    fontSize: 16,
    fontFamily: "Arial",
    textAlign: "left",
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth - 400,
      height: window.innerHeight - 100,
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
          const fabricImage = new FabricImage(img);
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
      const handleClick = (e: TEvent) => {
        const pointer = fabricCanvas.getPointer(e.e);
        setCommentPosition({ x: pointer.x, y: pointer.y });
        setShowCommentDialog(true);
      };

      fabricCanvas.on("mouse:down", handleClick);
      return () => fabricCanvas.off("mouse:down", handleClick);
    }

    if (activeTool === "text") {
      const handleClick = (e: TEvent) => {
        const pointer = fabricCanvas.getPointer(e.e);
        setCommentPosition({ x: pointer.x, y: pointer.y });
        setShowTextDialog(true);
      };

      fabricCanvas.on("mouse:down", handleClick);
      return () => fabricCanvas.off("mouse:down", handleClick);
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
    <div className="flex-1 overflow-auto bg-gray-50 p-4">
      <canvas ref={canvasRef} className="shadow-lg rounded-lg" />

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Your name"
              value={commentData.author || ""}
              onChange={(e) => setCommentData({ ...commentData, author: e.target.value })}
            />
            <Textarea
              placeholder="Write your comment..."
              value={commentData.content || ""}
              onChange={(e) => setCommentData({ ...commentData, content: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommentDialog(false)}>Cancel</Button>
            <Button onClick={handleAddComment}>Add Comment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Text</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your text..."
              value={textData.content || ""}
              onChange={(e) => setTextData({ ...textData, content: e.target.value })}
            />
            <Select
              value={textData.fontFamily}
              onValueChange={(value) => setTextData({ ...textData, fontFamily: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Font Family" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={String(textData.fontSize)}
              onValueChange={(value) => setTextData({ ...textData, fontSize: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Font Size" />
              </SelectTrigger>
              <SelectContent>
                {[12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={textData.textAlign}
              onValueChange={(value) => setTextData({ ...textData, textAlign: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Text Align" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTextDialog(false)}>Cancel</Button>
            <Button onClick={handleAddText}>Add Text</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};