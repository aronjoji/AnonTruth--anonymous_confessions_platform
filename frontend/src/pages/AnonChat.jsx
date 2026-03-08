import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, X, Clock, Shield } from 'lucide-react';
import { getChat, sendChatMessage, endChat, SOCKET_URL } from '../services/api';
import { io } from 'socket.io-client';
import PageTransition from '../components/PageTransition';
import toast from '../components/Toast';

const AnonChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await getChat(id);
        setChat(res.data);
        setMessages(res.data.messages || []);
      } catch (err) {
        toast.error('Chat not found');
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };
    fetchChat();

    // Socket
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.emit('join_chat', id);

    socketRef.current.on('chat_message', (data) => {
      if (data.chatId === id) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    socketRef.current.on('chat_partner_joined', () => {
      setChat(prev => prev ? { ...prev, partnerJoined: true } : prev);
      toast.success('Partner joined the chat!');
    });

    socketRef.current.on('chat_ended', () => {
      setChat(prev => prev ? { ...prev, isActive: false } : prev);
      toast.info('Chat has ended');
    });

    return () => {
      socketRef.current?.emit('leave_chat', id);
      socketRef.current?.disconnect();
    };
  }, [id, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await sendChatMessage(id, text.trim());
      setText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
  };

  const handleEnd = async () => {
    try {
      await endChat(id);
      navigate('/home');
    } catch (err) {
      toast.error('Failed to end chat');
    }
  };

  const timeRemaining = () => {
    if (!chat?.expiresAt) return '';
    const ms = new Date(chat.expiresAt) - Date.now();
    if (ms <= 0) return 'Expired';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m remaining`;
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-[#4F8CFF] border-t-transparent rounded-full animate-spin" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-4 flex flex-col h-[100dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#4F8CFF]/15 rounded-lg">
              <Shield className="w-4 h-4 text-[#4F8CFF]" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Anonymous Chat</h3>
              <p className="text-[10px] text-gray-500">
                You are <span className="text-[#4F8CFF] font-bold">{chat?.myLabel}</span>
                {!chat?.partnerJoined && ' • Waiting for partner...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <Clock className="w-3 h-3" />
              {timeRemaining()}
            </div>
            <button onClick={handleEnd} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
          {messages.length === 0 && (
            <div className="text-center py-16 text-gray-600 text-sm">
              <Shield className="w-10 h-10 mx-auto mb-3 text-gray-700" />
              <p className="font-medium">Chat started anonymously</p>
              <p className="text-xs text-gray-700 mt-1">No usernames. No profiles. Auto-deletes in 24h.</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.senderLabel === chat?.myLabel;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6] text-white rounded-br-md'
                    : 'bg-white/5 border border-white/10 text-gray-300 rounded-bl-md'
                }`}>
                  <p className="text-[9px] font-bold mb-1 opacity-60">{msg.senderLabel}</p>
                  {msg.text}
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {chat?.isActive && chat?.partnerJoined ? (
          <form onSubmit={handleSend} className="flex items-center gap-2 mt-3 pb-16 lg:pb-0">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type anonymously..."
              className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#4F8CFF]/30 transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center text-white cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </form>
        ) : (
          <div className="text-center py-4 text-xs text-gray-600 pb-16 lg:pb-0">
            {!chat?.partnerJoined ? 'Waiting for someone to join...' : 'This chat has ended.'}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AnonChat;
