import { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Please check your environment variables.');
}

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

interface Message {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  author_name?: string;
}

export const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [authorName, setAuthorName] = useState(localStorage.getItem('authorName') || "");

  useEffect(() => {
    if (!supabase) {
      toast.error("Chat is currently unavailable - Supabase configuration missing");
      return;
    }

    // Subscribe to new messages
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    // Fetch existing messages
    const fetchMessages = async () => {
      console.log('Fetching messages...');
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast.error("Failed to load messages");
        return;
      }

      console.log('Messages fetched:', data);
      setMessages(data || []);
    };

    fetchMessages();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const sendMessage = async () => {
    if (!supabase) {
      toast.error("Chat is currently unavailable");
      return;
    }

    if (!newMessage.trim() || !authorName.trim()) {
      toast.error("Please enter both a message and your name");
      return;
    }

    console.log('Sending message:', newMessage);
    const { error } = await supabase
      .from('messages')
      .insert([
        {
          content: newMessage,
          user_id: authorName,
          created_at: new Date().toISOString(),
          author_name: authorName
        }
      ]);

    if (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
      return;
    }

    setNewMessage("");
    localStorage.setItem('authorName', authorName);
  };

  return (
    <div className="border-t bg-white p-4 h-80">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5" />
        <h2 className="font-semibold">Chat</h2>
      </div>

      <ScrollArea className="h-48 mb-4 p-2 border rounded-md">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="bg-slate-50 rounded-lg p-3"
            >
              <div className="font-medium text-sm text-blue-600 mb-1">
                {message.author_name || message.user_id}
              </div>
              <p className="text-sm text-slate-600">{message.content}</p>
              <span className="text-xs text-slate-400">
                {new Date(message.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="space-y-2">
        <Input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name..."
          className="mb-2"
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};