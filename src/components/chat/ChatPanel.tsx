import { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase credentials are available
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
}

export const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(!!supabase);

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

    if (!newMessage.trim()) return;

    console.log('Sending message:', newMessage);
    const { error } = await supabase
      .from('messages')
      .insert([
        {
          content: newMessage,
          user_id: 'anonymous', // Replace with actual user ID when auth is implemented
          created_at: new Date().toISOString() // Add the created_at field
        }
      ]);

    if (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
      return;
    }

    setNewMessage("");
  };

  return (
    <div className={`bg-white border-r transition-all duration-300 ${isCollapsed ? "w-12" : "w-64"}`}>
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <h2 className="font-semibold">Chat</h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
      </div>

      {!isCollapsed && (
        <>
          {!isSupabaseConfigured ? (
            <div className="p-4 text-sm text-red-500">
              Chat is currently unavailable. Please check Supabase configuration.
            </div>
          ) : (
            <>
              <ScrollArea className="h-[calc(100vh-8rem)] p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="bg-slate-50 rounded-lg p-3"
                    >
                      <p className="text-sm text-slate-600">{message.content}</p>
                      <span className="text-xs text-slate-400">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
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
            </>
          )}
        </>
      )}
    </div>
  );
};