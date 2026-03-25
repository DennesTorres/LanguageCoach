'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { useVocabulary } from '@/hooks/useVocabulary';
import { MessageSquare, BookOpen, Clock, TrendingUp, Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const { conversations, activeConversations, stats: conversationStats } = useConversations();
  const { stats: vocabStats, dueForReview } = useVocabulary();
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);

  const recentConversations = conversations?.slice(0, 5) || [];
  const dueCount = dueForReview?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Learner'}!
            </h1>
            <p className="text-gray-600 mt-1">
              {dueCount > 0 
                ? `You have ${dueCount} words due for review today.` 
                : "You're all caught up! Start a conversation to learn more."}
            </p>
          </div>
          <Button 
            onClick={() => setShowNewConversationModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Conversations</p>
              <p className="text-2xl font-bold text-gray-900">
                {conversationStats?.totalConversations || 0}
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Practice Minutes</p>
              <p className="text-2xl font-bold text-gray-900">
                {conversationStats?.totalPracticeMinutes || 0}
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vocabulary</p>
              <p className="text-2xl font-bold text-gray-900">
                {vocabStats?.totalItems || 0}
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Streak</p>
              <p className="text-2xl font-bold text-gray-900">
                {user?.streakDays || 0} days
              </p>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Conversations */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active Conversations</h2>
              <Link href="/conversations" className="text-sm text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>

            {activeConversations && activeConversations.length > 0 ? (
              <div className="space-y-3">
                {activeConversations.map((conversation) => (
                  <Link key={conversation.id} href={`/conversations/${conversation.id}`}>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{conversation.title}</h3>
                            <Badge variant="success" size="sm">Active</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {conversation.scenario || conversation.type}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>{conversation.languageCode.toUpperCase()}</span>
                            <span>{conversation.messagesCount} messages</span>
                            <span>Started {formatDistanceToNow(new Date(conversation.startedAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : recentConversations.length > 0 ? (
              <div className="space-y-3">
                {recentConversations.map((conversation) => (
                  <Link key={conversation.id} href={`/conversations/${conversation.id}`}>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{conversation.title}</h3>
                            <Badge variant={conversation.status === 'Completed' ? 'default' : 'secondary'} size="sm">
                              {conversation.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {conversation.scenario || conversation.type}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>{conversation.languageCode.toUpperCase()}</span>
                            <span>{conversation.messagesCount} messages</span>
                            <span>{formatDistanceToNow(new Date(conversation.startedAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-600 mb-4">Start your first conversation to practice a language</p>
                <Button onClick={() => setShowNewConversationModal(true)}>
                  Start Conversation
                </Button>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Review Reminder */}
            {dueCount > 0 && (
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Review Due</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {dueCount} words waiting for review
                    </p>
                    <Link href="/vocabulary/review">
                      <Button variant="secondary" size="sm" className="mt-3 w-full">
                        Start Review
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="p-4">
              <h3 className="font-medium text-gray-900 mb-4">Learning Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">New</span>
                    <span className="font-medium text-gray-900">{vocabStats?.newItems || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ 
                        width: `${vocabStats?.totalItems ? (vocabStats.newItems / vocabStats.totalItems) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Learning</span>
                    <span className="font-medium text-gray-900">{vocabStats?.learningItems || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500"
                      style={{ 
                        width: `${vocabStats?.totalItems ? (vocabStats.learningItems / vocabStats.totalItems) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Mastered</span>
                    <span className="font-medium text-gray-900">{vocabStats?.masteredItems || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ 
                        width: `${vocabStats?.totalItems ? (vocabStats.masteredItems / vocabStats.totalItems) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* New Conversation Modal - would be a separate component */}
      {showNewConversationModal && (
        <NewConversationModal 
          onClose={() => setShowNewConversationModal(false)} 
        />
      )}
    </DashboardLayout>
  );
}

function NewConversationModal({ onClose }: { onClose: () => void }) {
  const { startConversation } = useConversations();
  const [languageCode, setLanguageCode] = useState('de');
  const [type, setType] = useState('FreeChat');
  const [scenario, setScenario] = useState('');

  const scenarios: Record<string, string[]> = {
    'de': ['Restaurant', 'Job Interview', 'Shopping', 'Directions', 'Hotel Check-in', 'Small Talk'],
    'es': ['Restaurant', 'Job Interview', 'Shopping', 'Directions', 'Hotel Check-in', 'Small Talk'],
    'fr': ['Restaurant', 'Job Interview', 'Shopping', 'Directions', 'Hotel Check-in', 'Small Talk'],
    'it': ['Restaurant', 'Job Interview', 'Shopping', 'Directions', 'Hotel Check-in', 'Small Talk'],
    'pt': ['Restaurant', 'Job Interview', 'Shopping', 'Directions', 'Hotel Check-in', 'Small Talk'],
  };

  const handleStart = async () => {
    await startConversation({ languageCode, type, scenario: scenario || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Start New Conversation</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={languageCode}
              onChange={(e) => setLanguageCode(e.target.value)}
            >
              <option value="de">German</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="FreeChat">Free Chat</option>
              <option value="Scenario">Scenario</option>
              <option value="GrammarPractice">Grammar Practice</option>
              <option value="VocabularyQuiz">Vocabulary Quiz</option>
              <option value="Debate">Debate</option>
              <option value="Interview">Interview</option>
            </select>
          </div>

          {type === 'Scenario' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scenario</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              >
                <option value="">Select a scenario...</option>
                {(scenarios[languageCode] || []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleStart} className="flex-1">
            Start Conversation
          </Button>
        </div>
      </div>
    </div>
  );
}
