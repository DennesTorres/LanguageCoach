'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/hooks/useAuth';
import { Send, Mic, MicOff, Loader2, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const { user } = useAuth();
  const { 
    getConversation, 
    getMessages, 
    sendMessage, 
    completeConversation,
    isLoading 
  } = useConversations();
  
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showCorrections, setShowCorrections] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = getConversation(conversationId);
  const messages = getMessages(conversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    const content = newMessage;
    setNewMessage('');
    await sendMessage({ conversationId, content, requestCorrection: showCorrections });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading || !conversation) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout hideSidebar>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="border-b bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/conversations" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <div>
              <h1 className="font-semibold text-gray-900">{conversation.title}</h1>
              <p className="text-sm text-gray-600">
                {conversation.scenario || conversation.type} · {conversation.languageCode.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={conversation.status === 'Active' ? 'success' : 'default'}>
              {conversation.status}
            </Badge>
            {conversation.status === 'Active' && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => completeConversation(conversationId)}
              >
                Complete
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages?.map((message, index) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                isUser={message.role === 'User'}
                showCorrections={showCorrections}
                isConsecutive={index > 0 && messages[index - 1].role === message.role}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        {conversation.status === 'Active' && (
          <div className="border-t bg-white p-4">
            <div className="max-w-3xl mx-auto">
              {/* Toolbar */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <button
                  onClick={() => setShowCorrections(!showCorrections)}
                  className={`flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors ${
                    showCorrections 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Corrections
                </button>
                <button
                  className="flex items-center gap-1 text-sm px-2 py-1 rounded text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Extract Vocab
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-3 rounded-xl transition-colors ${
                    isRecording 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 min-h-[60px] max-h-[200px]"
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="px-6"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function MessageBubble({ 
  message, 
  isUser, 
  showCorrections,
  isConsecutive 
}: { 
  message: any; 
  isUser: boolean;
  showCorrections: boolean;
  isConsecutive: boolean;
}) {
  const [showVocab, setShowVocab] = useState(false);

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}>
      {!isUser && !isConsecutive && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          AI
        </div>
      )}
      {!isUser && isConsecutive && <div className="w-8 flex-shrink-0" />}
      
      <div className={`max-w-[70%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div 
          className={`rounded-2xl px-4 py-3 ${
            isUser 
              ? 'bg-gray-900 text-white' 
              : 'bg-white border border-gray-200 text-gray-900'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          
          {/* Corrections */}
          {isUser && showCorrections && message.correctedContent && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-sm text-green-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Correction:
              </p>
              <p className="text-gray-200 mt-1">{message.correctedContent}</p>
              {message.explanation && (
                <p className="text-sm text-gray-400 mt-1">{message.explanation}</p>
              )}
            </div>
          )}

          {/* Extracted Vocabulary */}
          {!isUser && message.extractedVocabulary?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setShowVocab(!showVocab)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <BookOpen className="w-4 h-4" />
                {showVocab ? 'Hide' : 'Show'} new vocabulary ({message.extractedVocabulary.length})
              </button>
              {showVocab && (
                <div className="mt-2 space-y-1">
                  {message.extractedVocabulary.map((vocab: any) => (
                    <div key={vocab.vocabularyItemId} className="text-sm">
                      <span className="font-medium">{vocab.word}</span>
                      <span className="text-gray-500"> — {vocab.translation}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <p className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : ''}`}>
          {format(new Date(message.sentAt), 'h:mm a')}
        </p>
      </div>
      
      {isUser && !isConsecutive && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-bold flex-shrink-0 order-2">
          {user?.name?.[0] || 'U'}
        </div>
      )}
      {isUser && isConsecutive && <div className="w-8 flex-shrink-0 order-2" />}
    </div>
  );
}
