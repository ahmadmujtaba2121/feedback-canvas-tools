import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DialogsProps {
  showCommentDialog: boolean;
  setShowCommentDialog: (show: boolean) => void;
  showTextDialog: boolean;
  setShowTextDialog: (show: boolean) => void;
  commentData: any;
  setCommentData: (data: any) => void;
  textData: any;
  setTextData: (data: any) => void;
  handleAddComment: () => void;
  handleAddText: () => void;
}

export const CanvasDialogs = ({
  showCommentDialog,
  setShowCommentDialog,
  showTextDialog,
  setShowTextDialog,
  commentData,
  setCommentData,
  textData,
  setTextData,
  handleAddComment,
  handleAddText
}: DialogsProps) => {
  return (
    <>
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
    </>
  );
};