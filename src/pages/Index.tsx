import { useState } from "react";
import { Canvas } from "@/components/Canvas";
import { Toolbar } from "@/components/Toolbar";
import { LayersPanel } from "@/components/LayersPanel";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [activeTool, setActiveTool] = useState<"select" | "pin" | "text" | null>(null);
  const [layers, setLayers] = useState<any[]>([]);

  const handleSave = () => {
    toast.success("Project saved successfully!");
  };

  const handleApprove = () => {
    toast.success("Project approved!");
  };

  const handleReject = () => {
    toast.error("Project rejected");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Toolbar activeTool={activeTool} onToolSelect={setActiveTool} onSave={handleSave} />
      
      <main className="flex-1 flex flex-col">
        <div className="flex justify-between items-center px-4 py-2 bg-white border-b">
          <h1 className="text-xl font-semibold text-slate-800">Feedback Canvas</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReject} className="text-red-500 hover:text-red-600">
              <X className="w-4 h-4 mr-1" />
              Reject
            </Button>
            <Button onClick={handleApprove} className="bg-green-500 hover:bg-green-600">
              <Check className="w-4 h-4 mr-1" />
              Approve
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          <Canvas activeTool={activeTool} onLayerAdd={(layer) => setLayers([...layers, layer])} />
          <LayersPanel layers={layers} onLayersChange={setLayers} />
        </div>
      </main>
    </div>
  );
};

export default Index;