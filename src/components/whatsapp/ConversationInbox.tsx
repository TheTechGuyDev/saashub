import { useState, useRef, useEffect } from "react";
import { useWhatsAppConversations, useWhatsAppMessages } from "@/hooks/useWhatsApp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Search, Phone, Plus, Tag, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Props {
  companyId: string;
}

export function ConversationInbox({ companyId }: Props) {
  const { conversations, isLoading, createConversation } = useWhatsAppConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const selected = conversations.find((c) => c.id === selectedId);
  const filtered = conversations.filter(
    (c) => c.contact_name.toLowerCase().includes(search.toLowerCase()) || c.contact_phone.includes(search)
  );

  const handleNewConversation = () => {
    if (!newName || !newPhone) return;
    createConversation.mutate({ company_id: companyId, contact_name: newName, contact_phone: newPhone }, {
      onSuccess: (data) => { setSelectedId(data.id); setShowNewChat(false); setNewName(""); setNewPhone(""); }
    });
  };

  return (
    <div className="flex h-[calc(100vh-220px)] rounded-lg border border-border overflow-hidden">
      {/* Conversation list */}
      <div className="w-80 shrink-0 border-r border-border flex flex-col bg-card">
        <div className="p-3 border-b border-border space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button size="sm" className="w-full" variant="outline" onClick={() => setShowNewChat(!showNewChat)}>
            <Plus className="mr-2 h-4 w-4" /> New Conversation
          </Button>
          {showNewChat && (
            <div className="space-y-2 p-2 rounded bg-muted/50">
              <Input placeholder="Contact name" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Input placeholder="Phone number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
              <Button size="sm" className="w-full" onClick={handleNewConversation} disabled={createConversation.isPending}>Create</Button>
            </div>
          )}
        </div>
        <ScrollArea className="flex-1">
          {isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50 border-b border-border/50",
                  selectedId === c.id && "bg-primary/5"
                )}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">{c.contact_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">{c.contact_name}</span>
                    <span className="text-xs text-muted-foreground">{c.last_message_at ? format(new Date(c.last_message_at), "HH:mm") : ""}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground truncate">{c.contact_phone}</span>
                    {(c.unread_count ?? 0) > 0 && (
                      <Badge variant="default" className="h-5 min-w-5 flex items-center justify-center text-xs">{c.unread_count}</Badge>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <ChatPanel conversation={selected} companyId={companyId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Phone className="mx-auto h-12 w-12 mb-4 text-muted-foreground/30" />
              <p className="font-medium">Select a conversation</p>
              <p className="text-sm">Choose from your existing conversations or start a new one.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatPanel({ conversation, companyId }: { conversation: any; companyId: string }) {
  const { messages, isLoading, sendMessage } = useWhatsAppMessages(conversation.id);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage.mutate({ conversation_id: conversation.id, company_id: companyId, content: input });
    setInput("");
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">{conversation.contact_name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{conversation.contact_name}</p>
            <p className="text-xs text-muted-foreground">{conversation.contact_phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {conversation.tags?.map((t: string) => (
            <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
          ))}
          <Badge variant={conversation.status === "open" ? "default" : "secondary"} className="text-xs capitalize">{conversation.status}</Badge>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center mt-10">No messages yet. Send the first message!</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={cn("flex", m.direction === "outbound" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[70%] rounded-lg px-4 py-2 text-sm",
                m.direction === "outbound"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-card border border-border text-foreground rounded-bl-none"
              )}>
                <p>{m.content}</p>
                <p className={cn("text-[10px] mt-1", m.direction === "outbound" ? "text-primary-foreground/60" : "text-muted-foreground")}>
                  {m.sent_at ? format(new Date(m.sent_at), "HH:mm") : ""}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-3 flex gap-2">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={!input.trim() || sendMessage.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
