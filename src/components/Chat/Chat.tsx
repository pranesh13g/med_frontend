import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    full_name: string;
    role: string;
  };
}

interface ChatProps {
  doctorId?: string;
  chatId?: string;
}

export const Chat = ({ doctorId, chatId: providedChatId }: ChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || (!providedChatId && !doctorId)) {
      return;
    }

    let isMounted = true;
    let socketInstance: Socket | null = null;
    let activeChatId: string | null = null;

    const initChat = async () => {
      try {
        activeChatId = providedChatId ?? null;

        if (!activeChatId) {
          if (!doctorId) {
            return;
          }

          const chat = await api.post('/chats', { doctor_id: doctorId });
          activeChatId = chat.id;
        }

        if (!activeChatId || !isMounted) {
          return;
        }

        setChatId(activeChatId);

        const messagesData = await api.get(`/chats/${activeChatId}/messages`);
        if (isMounted) {
          setMessages(messagesData);
        }

        const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        const newSocket = io(SOCKET_URL);
        socketInstance = newSocket;

        const handleConnect = () => {
          newSocket.emit('register', user.id);
          newSocket.emit('join_chat', activeChatId);
        };

        const handleNewMessage = (message: Message) => {
          if (!isMounted) {
            return;
          }

          setMessages((prev) => {
            if (prev.some((existing) => existing.id === message.id)) {
              return prev;
            }
            return [...prev, message];
          });
        };

        newSocket.on('connect', handleConnect);
        newSocket.on('new_message', handleNewMessage);

        if (isMounted) {
          setSocket(newSocket);
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    };

    initChat();

    return () => {
      isMounted = false;
      if (socketInstance) {
        socketInstance.off('connect');
        socketInstance.off('new_message');
        socketInstance.disconnect();
      }
    };
  }, [user, doctorId, providedChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !chatId || !socket) return;

    try {
      socket.emit('send_message', {
        chatId,
        senderId: user?.id,
        content: newMessage,
      });

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-lg">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender.id === user?.id;

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-3 ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
