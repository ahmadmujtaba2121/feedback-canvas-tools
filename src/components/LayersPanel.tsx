import { Layers, Image, Type, Pin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayersPanelProps {
  layers: any[];
  onLayersChange: (layers: any[]) => void;
}

export const LayersPanel = ({ layers, onLayersChange }: LayersPanelProps) => {
  const handleDelete = (id: number) => {
    const layer = layers.find((l) => l.id === id);
    if (layer?.element) {
      layer.element.remove();
    }
    onLayersChange(layers.filter((l) => l.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "text":
        return <Type className="w-4 h-4" />;
      case "pin":
        return <Pin className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-64 bg-white border-l p-4">
      <div className="flex items-center gap-2 mb-4 text-slate-800">
        <Layers className="w-5 h-5" />
        <h2 className="font-semibold">Layers</h2>
      </div>

      <div className="space-y-2">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className="flex items-center justify-between p-2 rounded hover:bg-slate-50"
          >
            <div className="flex items-center gap-2">
              {getIcon(layer.type)}
              <span className="text-sm text-slate-600">
                {layer.type.charAt(0).toUpperCase() + layer.type.slice(1)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(layer.id)}
              className="w-8 h-8 text-slate-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};