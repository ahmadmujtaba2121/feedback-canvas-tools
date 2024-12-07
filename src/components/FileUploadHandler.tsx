import { useCallback } from "react";
import { Canvas, Image as FabricImage } from "fabric";
import { toast } from "sonner";

interface FileUploadHandlerProps {
  fabricCanvas: Canvas | null;
  onLayerAdd: (layer: any) => void;
}

export const FileUploadHandler = ({ fabricCanvas, onLayerAdd }: FileUploadHandlerProps) => {
  const handleFile = useCallback((file: File) => {
    if (!fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const fabricImage = new FabricImage(img);
        fabricImage.set({
          left: 100,
          top: 100,
          cornerStyle: 'circle',
          cornerColor: '#0ea5e9',
          cornerStrokeColor: '#0369a1',
          cornerSize: 12,
          transparentCorners: false,
        });
        fabricCanvas.add(fabricImage);
        fabricCanvas.setActiveObject(fabricImage);
        fabricCanvas.renderAll();
        onLayerAdd({ type: "image", id: Date.now(), element: fabricImage });
        toast.success("Image added to canvas");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [fabricCanvas, onLayerAdd]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (!file) return;
    handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFile(file);
  }, [handleFile]);

  return {
    handleDrop,
    handleFileInput
  };
};