import { MousePointer, PinIcon, Type, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  activeTool: "select" | "pin" | "text" | null;
  onToolSelect: (tool: "select" | "pin" | "text" | null) => void;
  onSave: () => void;
}

export const Toolbar = ({ activeTool, onToolSelect, onSave }: ToolbarProps) => {
  const tools = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "pin", icon: PinIcon, label: "Add Pin" },
    { id: "text", icon: Type, label: "Add Text" },
  ] as const;

  return (
    <div className="w-16 bg-slate-800 flex flex-col items-center py-4 gap-2">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant="ghost"
          size="icon"
          onClick={() => onToolSelect(activeTool === tool.id ? null : tool.id)}
          className={cn(
            "w-12 h-12 text-slate-400 hover:text-white hover:bg-slate-700",
            activeTool === tool.id && "bg-slate-700 text-white"
          )}
        >
          <tool.icon className="w-5 h-5" />
        </Button>
      ))}

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={onSave}
        className="w-12 h-12 text-slate-400 hover:text-white hover:bg-slate-700"
      >
        <Save className="w-5 h-5" />
      </Button>
    </div>
  );
};