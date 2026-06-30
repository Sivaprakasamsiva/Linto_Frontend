// frontend/src/pages/MessagesPage.jsx
/**
 * Messages page - conversation list + chat window.
 * Full-screen chat interface like WhatsApp (no footer).
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSend, FiMessageSquare, FiArrowLeft, FiUser, FiChevronLeft } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  useConversations, useMessages, useSendMessage,
} from '../hooks/queries';
import { useAuth } from '../context/AuthContext';
import { timeAgo, getInitials, formatDateTime, classNames } from '../utils/helpers';
import { ListSkeleton, EmptyState } from '../components/ui';
import BottomNav from '../components/layout/BottomNav';

// Group conversations by user
const groupConversationsByUser = (conversations) => {
  if (!conversations) return [];
  
  const grouped = {};
  conversations.forEach(conv => {
    const userId = conv.other_participant?.id;
    if (!userId) return;
    
    if (!grouped[userId]) {
      grouped[userId] = {
        ...conv,
        products: [conv.product],
        count: 1
      };
    } else {
      // Update with latest message
      if (new Date(conv.last_message_at) > new Date(grouped[userId].last_message_at)) {
        grouped[userId].last_message = conv.last_message;
        grouped[userId].last_message_at = conv.last_message_at;
      }
      grouped[userId].products.push(conv.product);
      grouped[userId].count += 1;
    }
  });
  
  return Object.values(grouped);
};

export default function MessagesPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [containerHeight, setContainerHeight] = useState('100vh');

  // Check if mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate proper height for mobile
  useEffect(() => {
    const calculateHeight = () => {
      if (isMobile) {
        // Get the actual viewport height
        const vh = window.innerHeight;
        // Subtract bottom nav height (approximately 64px)
        const bottomNavHeight = 64;
        // Subtract any additional padding if needed
        const headerOffset = 0; // No header on messages page
        const availableHeight = vh - bottomNavHeight;
        setContainerHeight(`${availableHeight}px`);
      } else {
        setContainerHeight('calc(100vh - 80px)');
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    window.addEventListener('orientationchange', calculateHeight);
    
    return () => {
      window.removeEventListener('resize', calculateHeight);
      window.removeEventListener('orientationchange', calculateHeight);
    };
  }, [isMobile]);

  const { data: conversationsData, isLoading: convLoading } = useConversations();
  const { data: messagesData, isLoading: msgLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);

  const conversations = conversationsData?.results || [];
  const messages = messagesData?.results || [];
  const groupedConversations = groupConversationsByUser(conversations);
  
  // Find current conversation for header
  const currentConversation = groupedConversations.find(c => c.id === conversationId);

  // ===== RELIABLE SCROLL TO BOTTOM =====
  const scrollToBottom = useCallback((smooth = true) => {
    const container = messagesContainerRef.current;
    const endRef = messagesEndRef.current;
    
    if (endRef) {
      endRef.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    } else if (container) {
      container.scrollTop = container.scrollHeight;
    }
    
    // Multiple fallbacks for mobile
    setTimeout(() => {
      if (endRef) {
        endRef.scrollIntoView({ 
          behavior: smooth ? 'smooth' : 'auto',
          block: 'end'
        });
      } else if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
    
    setTimeout(() => {
      if (endRef) {
        endRef.scrollIntoView({ 
          behavior: smooth ? 'smooth' : 'auto',
          block: 'end'
        });
      } else if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 300);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(true), 100);
      setTimeout(() => scrollToBottom(true), 300);
    }
  }, [messages, scrollToBottom]);

  // Scroll to bottom when conversation changes
  useEffect(() => {
    if (conversationId) {
      setTimeout(() => scrollToBottom(false), 150);
      setTimeout(() => scrollToBottom(false), 400);
    }
  }, [conversationId, scrollToBottom]);

  // Focus input when conversation changes
  useEffect(() => {
    if (conversationId) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [conversationId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    try {
      await sendMessage.mutateAsync(messageText);
      setMessageText('');
      setTimeout(() => scrollToBottom(true), 50);
      setTimeout(() => scrollToBottom(true), 200);
      setTimeout(() => scrollToBottom(true), 400);
    } catch (err) {
      toast.error('Failed to send message.');
    }
  };

  const handleBack = () => {
    navigate('/messages');
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      setIsScrolled(!atBottom);
    }
  };

  // ===== RENDER CONVERSATION LIST =====
  const renderConversationList = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          Messages
          <span className="ml-2 text-sm font-normal text-slate-400">
            ({groupedConversations.length})
          </span>
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {convLoading ? (
          <ListSkeleton count={3} />
        ) : groupedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <FiMessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <p className="font-medium text-slate-700 dark:text-slate-300">No conversations</p>
            <p className="text-sm text-slate-400 mt-1">Start chatting from a product page</p>
          </div>
        ) : (
          groupedConversations.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/messages/${c.id}`)}
              className={classNames(
                'w-full text-left p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
                conversationId === c.id && 'bg-brand/5 dark:bg-brand/10 border-l-4 border-l-brand'
              )}
            >
              <div className="flex items-start gap-3">
                {c.other_participant?.profile_image ? (
                  <img src={c.other_participant.profile_image} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {getInitials(c.other_participant?.full_name || 'U')}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                      {c.other_participant?.full_name || 'Unknown User'}
                    </p>
                    {c.last_message_at && (
                      <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                        {timeAgo(c.last_message_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">
                    {c.last_message?.body || 'No messages yet'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-slate-400 truncate flex-1">
                      Re: {c.product?.title || 'Unknown Product'}
                    </p>
                    {c.unread_count > 0 && (
                      <span className="inline-block bg-accent-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  // ===== RENDER CHAT WINDOW =====
  const renderChatWindow = () => {
    if (!conversationId) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="w-10 h-10 text-slate-400" />
            </div>
            <p className="font-medium text-slate-700 dark:text-slate-300">Select a conversation</p>
            <p className="text-sm text-slate-400 mt-1">Choose a conversation from the list to start chatting</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 min-h-[60px] z-10">
          {isMobile && (
            <button
              onClick={handleBack}
              className="p-1 -ml-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Back to conversations"
            >
              <FiChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </button>
          )}
          {currentConversation?.other_participant?.profile_image ? (
            <img src={currentConversation.other_participant.profile_image} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold">
              {getInitials(currentConversation?.other_participant?.full_name || 'U')}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
              {currentConversation?.other_participant?.full_name || 'Unknown User'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {currentConversation?.product?.title ? `Re: ${currentConversation.product.title}` : 'Chat'}
            </p>
          </div>
        </div>

        {/* Messages Container */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overscroll-contain px-4 pt-3 pb-2 min-h-0"
        >
          <div className="space-y-3">
            {msgLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand border-t-transparent"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 min-h-[200px]">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <FiMessageSquare className="w-8 h-8 text-slate-400" />
                </div>
                <p className="font-medium text-slate-700 dark:text-slate-300">No messages yet</p>
                <p className="text-sm text-slate-400 mt-1">Start the conversation!</p>
              </div>
            ) : (
              messages.map((m, index) => {
                const isMe = m.sender?.id === user?.id;
                const showDate = index === 0 || 
                  new Date(messages[index - 1].created_at).toDateString() !== 
                  new Date(m.created_at).toDateString();

                return (
                  <div key={m.id}>
                    {showDate && (
                      <div className="flex justify-center my-3">
                        <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                          {formatDateTime(m.created_at).split(',')[0]}
                        </span>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={classNames('flex', isMe ? 'justify-end' : 'justify-start')}
                    >
                      {!isMe && (
                        <div className="flex-shrink-0 mr-2 self-end">
                          {currentConversation?.other_participant?.profile_image ? (
                            <img
                              src={currentConversation.other_participant.profile_image}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-semibold">
                              {getInitials(currentConversation?.other_participant?.full_name || 'U')}
                            </div>
                          )}
                        </div>
                      )}
                      <div
                        className={classNames(
                          'max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5',
                          isMe
                            ? 'bg-brand text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none shadow-sm'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                        <p
                          className={classNames(
                            'text-[10px] mt-1',
                            isMe ? 'text-blue-100' : 'text-slate-400'
                          )}
                        >
                          {formatDateTime(m.created_at).split(',')[1]?.trim() || ''}
                        </p>
                      </div>
                      {isMe && (
                        <div className="flex-shrink-0 ml-2 self-end">
                          {user?.profile_image ? (
                            <img
                              src={user.profile_image}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold">
                              {getInitials(user?.full_name || 'U')}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </div>
                );
              })
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {isScrolled && messages.length > 0 && (
          <button
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-brand text-white rounded-full p-2 shadow-lg hover:bg-brand-dark transition-colors z-10"
            aria-label="Scroll to bottom"
          >
            <FiChevronLeft className="w-5 h-5 rotate-90" />
          </button>
        )}

        {/* Message Input */}
        <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form 
            onSubmit={handleSend} 
            className="p-3"
          >
            <div className="flex gap-2 max-w-4xl mx-auto">
              <input
                ref={inputRef}
                id="message-input"
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className={classNames(
                  "flex-1 rounded-full border border-slate-200 dark:border-slate-700",
                  "bg-slate-50 dark:bg-slate-800",
                  "px-4 py-2.5 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent",
                  "transition-colors duration-200",
                  "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                  "min-h-[44px]",
                  "text-slate-900 dark:text-white"
                )}
                disabled={sendMessage.isPending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!messageText.trim() || sendMessage.isPending}
                className={classNames(
                  "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0",
                  messageText.trim() && !sendMessage.isPending
                    ? "bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                )}
              >
                {sendMessage.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiSend className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>
          {conversationId && currentConversation 
            ? `${currentConversation.other_participant?.full_name} - Messages` 
            : 'Messages - Lintro'}
        </title>
      </Helmet>

      {/* Main container with dynamic height */}
      <div 
        className="flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden"
        style={{ height: containerHeight }}
      >
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Conversation List */}
          <div 
            className={classNames(
              "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800",
              "w-full md:w-80 lg:w-96",
              isMobile && conversationId ? "hidden" : "flex flex-col"
            )}
          >
            {renderConversationList()}
          </div>

          {/* Chat Window */}
          <div 
            className={classNames(
              "flex-1 flex flex-col relative overflow-hidden min-h-0",
              isMobile && !conversationId ? "hidden" : "flex"
            )}
          >
            {renderChatWindow()}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}