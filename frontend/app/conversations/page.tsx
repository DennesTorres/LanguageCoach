'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useConversations } from '@/hooks/useConversations';
import { MessageSquare, Plus, Search, Clock, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function ConversationsPage() {
  const { conversations, isLoading } = useConversations();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredConversations = conversations?.filter((conv) => {
    const matchesSearch = conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.scenario?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? conv.status === 'Active' :
      conv.status === 'Completed';
    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
            <p className="text-gray-600 mt-1">Practice and review your conversations</p>
          </div>
          <Link href="/conversations/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Conversation
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="grid gap-4">
            {filteredConversations.map((conversation) => (
              <ConversationCard key={conversation.id} conversation={conversation} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? "No conversations match your search." 
                : "Start your first conversation to begin practicing."}
            </p>
            <Link href="/conversations/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Start Conversation
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function ConversationCard({ conversation }: { conversation: any }) {
  const statusColors = {
    Active: 'bg-green-100 text-green-800',
    Paused: 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-blue-100 text-blue-800',
    Abandoned: 'bg-gray-100 text-gray-800',
  };

  const typeLabels: Record<string, string> = {
    FreeChat: 'Free Chat',
    Scenario: 'Scenario',
    GrammarPractice: 'Grammar Practice',
    VocabularyQuiz: 'Vocabulary Quiz',
    Debate: 'Debate',
    Interview: 'Interview',
  };

  return (
    <Link href={`/conversations/${conversation.id}`}>
      <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer group">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-lg truncate">
                {conversation.title}
              </h3>
              <Badge 
                className={statusColors[conversation.status as keyof typeof statusColors]}
                size="sm"
              >
                {conversation.status}
              </Badge>
            </div>
            
            {conversation.scenario && (
              <p className="text-gray-600 mt-1">{conversation.scenario}</p>
            )}
            
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDistanceToNow(new Date(conversation.startedAt), { addSuffix: true })}
              </span>
              <span>{conversation.languageCode.toUpperCase()}</span>
              <span>{typeLabels[conversation.type] || conversation.type}</span>
              <span>{conversation.messagesCount} messages</span>
              {conversation.correctionsCount > 0 && (
                <span className="text-orange-600">
                  {conversation.correctionsCount} corrections
                </span>
              )}
            </div>
          </div>

          <button className="p-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </Card>
    </Link>
  );
}
