import { useState } from "react";
import { MessageCircle, Plus, Send, User, Phone, Search, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomers } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  text: string;
  sender: "user" | "customer";
  timestamp: Date;
}

interface Conversation {
  customerId: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  unread: number;
  messages: Message[];
}

export default function WhatsApp() {
  const { customers } = useCustomers();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  
  // Get customers with phone numbers
  const phoneableCustomers = customers.filter(c => c.phone);
  
  // Mock conversations for demo (in production, these would come from a database)
  const [conversations, setConversations] = useState<Conversation[]>(() => 
    phoneableCustomers.slice(0, 5).map(c => ({
      customerId: c.id,
      customerName: c.name,
      customerPhone: c.phone || "",
      lastMessage: "Click to start conversation",
      unread: 0,
      messages: [],
    }))
  );

  const filteredConversations = conversations.filter(c =>
    c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.customerPhone.includes(searchQuery)
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    setSending(true);
    
    try {
      // Call edge function to send WhatsApp message
      const { data: result, error } = await supabase.functions.invoke("send-whatsapp", {
        body: {
          recipients: [{ phone: selectedConversation.customerPhone, name: selectedConversation.customerName }],
          message: newMessage,
        },
      });

      if (error) throw error;

      // Add message to local state
      const newMsg: Message = {
        id: crypto.randomUUID(),
        text: newMessage,
        sender: "user",
        timestamp: new Date(),
      };

      setConversations(prev => prev.map(c => 
        c.customerId === selectedConversation.customerId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMessage }
          : c
      ));
      
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMsg],
        lastMessage: newMessage,
      } : null);

      setNewMessage("");

      toast({
        title: result.simulated ? "Message simulated" : "Message sent!",
        description: result.simulated 
          ? "Configure WhatsApp API keys for real messaging" 
          : `Sent to ${selectedConversation.customerName}`,
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message,
      });
    } finally {
      setSending(false);
    }
  };

  const startNewConversation = (customer: typeof customers[0]) => {
    const existing = conversations.find(c => c.customerId === customer.id);
    if (existing) {
      setSelectedConversation(existing);
    } else {
      const newConv: Conversation = {
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone || "",
        lastMessage: "Start a conversation",
        unread: 0,
        messages: [],
      };
      setConversations(prev => [...prev, newConv]);
      setSelectedConversation(newConv);
    }
  };

  return (
    <div>
      <PageHeader
        title="WhatsApp Messaging"
        description="Send and receive WhatsApp messages with your customers."
        icon={MessageCircle}
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{phoneableCustomers.length}</div>
            <p className="text-xs text-muted-foreground">customers with phone</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {conversations.reduce((sum, c) => sum + c.unread, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">API Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-warning">Demo Mode</Badge>
            <p className="text-xs text-muted-foreground mt-1">Add API keys in Settings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 h-[600px]">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Chats</CardTitle>
              <Tabs defaultValue="conversations" className="w-auto">
                <TabsList className="h-8">
                  <TabsTrigger value="conversations" className="text-xs px-2">Chats</TabsTrigger>
                  <TabsTrigger value="contacts" className="text-xs px-2">Contacts</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[450px]">
              <Tabs defaultValue="conversations">
                <TabsContent value="conversations" className="m-0">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conv) => (
                      <div
                        key={conv.customerId}
                        className={`flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedConversation?.customerId === conv.customerId ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedConversation(conv)}
                      >
                        <Avatar>
                          <AvatarFallback>{conv.customerName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{conv.customerName}</p>
                          <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                        </div>
                        {conv.unread > 0 && (
                          <Badge className="bg-success text-success-foreground">{conv.unread}</Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No conversations yet</p>
                      <p className="text-xs">Add customers with phone numbers to start</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="contacts" className="m-0">
                  {phoneableCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-muted/50"
                      onClick={() => startNewConversation(customer)}
                    >
                      <Avatar>
                        <AvatarFallback>{customer.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{customer.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{customer.phone}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{selectedConversation.customerName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedConversation.customerName}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedConversation.customerPhone}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4 overflow-hidden">
                <ScrollArea className="h-[380px]">
                  {selectedConversation.messages.length > 0 ? (
                    <div className="space-y-4">
                      {selectedConversation.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              msg.sender === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p>{msg.text}</p>
                            <p className={`text-xs mt-1 ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2" />
                        <p>No messages yet</p>
                        <p className="text-sm">Send a message to start the conversation</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sending}>
                    {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg">Select a conversation</p>
                <p className="text-sm">Or start a new chat from the Contacts tab</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
