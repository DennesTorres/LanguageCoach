'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  MessageSquare, 
  BookOpen, 
  Target,
  Flame,
  Award,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { LearningProgress, LearningOverview, WeeklyGoal } from '@/types';
import { format, subDays, startOfWeek } from 'date-fns';

// Fetch functions
const fetchProgress = (): Promise<LearningProgress> =>
  apiClient.get<LearningProgress>('/analytics/progress?days=30');

const fetchOverview = (): Promise<LearningOverview> =>
  apiClient.get<LearningOverview>('/analytics/overview');

const fetchWeeklyGoal = (): Promise<WeeklyGoal> =>
  apiClient.get<WeeklyGoal>('/analytics/weekly-goal');

export default function ProgressPage() {
  const { user } = useAuth();
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: fetchProgress,
  });
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: fetchOverview,
  });
  const { data: weeklyGoal, isLoading: goalLoading } = useQuery({
    queryKey: ['weeklyGoal'],
    queryFn: fetchWeeklyGoal,
  });

  const isLoading = progressLoading || overviewLoading || goalLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
          <p className="text-gray-600 mt-1">
            Track your language learning journey
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Flame}
            label="Streak"
            value={`${overview?.streakDays || 0} days`}
            color="text-orange-500"
            bgColor="bg-orange-50"
          />
          <StatCard
            icon={Clock}
            label="Total Practice"
            value={`${Math.floor((overview?.totalPracticeMinutes || 0) / 60)}h ${(overview?.totalPracticeMinutes || 0) % 60}m`}
            color="text-blue-500"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={MessageSquare}
            label="Conversations"
            value={overview?.totalConversations || 0}
            color="text-purple-500"
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={BookOpen}
            label="Vocabulary"
            value={overview?.totalVocabulary || 0}
            color="text-green-500"
            bgColor="bg-green-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Progress Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Goal */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Weekly Goal</h2>
                    <p className="text-sm text-gray-600">
                      Week of {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {Math.round(weeklyGoal?.minutesProgressPercent || 0)}% complete
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Minutes Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Practice Time</span>
                    <span className="font-medium text-gray-900">
                      {weeklyGoal?.currentMinutes || 0} / {weeklyGoal?.targetMinutes || 120} min
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min(weeklyGoal?.minutesProgressPercent || 0, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Conversations Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Conversations</span>
                    <span className="font-medium text-gray-900">
                      {weeklyGoal?.currentConversations || 0} / {weeklyGoal?.targetConversations || 5}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${Math.min(weeklyGoal?.conversationsProgressPercent || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Activity Heatmap */}
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Activity (Last 30 Days)</h2>
              <ActivityHeatmap data={progress?.weeklyProgress || []} />
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {overview?.recentActivity?.slice(0, 5).map((activity) => (
                  <div
                    key={activity.conversationId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-medium">
                        {activity.languageCode.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">
                          {activity.type} • {activity.messagesCount} messages • {activity.durationMinutes} min
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(activity.startedAt), 'MMM d')}
                    </span>
                  </div>
                ))}
                {(overview?.recentActivity?.length || 0) === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No activity yet. Start a conversation to see your progress!
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Language Breakdown */}
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Language Progress</h2>
              <div className="space-y-4">
                {overview?.languageBreakdown?.map((lang) => (
                  <div key={lang.languageCode} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{getLanguageFlag(lang.languageCode)}</span>
                        <span className="font-medium text-gray-900">
                          {getLanguageName(lang.languageCode)}
                        </span>
                      </div>
                      <Badge variant="secondary" size="sm">
                        {lang.proficiencyLevel}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>{lang.conversationCount} conversations</span>
                      <span>{lang.vocabularyCount} words</span>
                    </div>
                  </div>
                ))}
                {(overview?.languageBreakdown?.length || 0) === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Add a language to get started
                  </p>
                )}
              </div>
            </Card>

            {/* Vocabulary Status */}
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Vocabulary Status</h2>
              <div className="space-y-3">
                <StatusBar
                  label="New"
                  count={overview?.vocabularyByStatus.New || 0}
                  total={overview?.totalVocabulary || 1}
                  color="bg-gray-400"
                />
                <StatusBar
                  label="Learning"
                  count={overview?.vocabularyByStatus.Learning || 0}
                  total={overview?.totalVocabulary || 1}
                  color="bg-yellow-400"
                />
                <StatusBar
                  label="Review"
                  count={overview?.vocabularyByStatus.Review || 0}
                  total={overview?.totalVocabulary || 1}
                  color="bg-orange-400"
                />
                <StatusBar
                  label="Mastered"
                  count={overview?.vocabularyByStatus.Mastered || 0}
                  total={overview?.totalVocabulary || 1}
                  color="bg-green-400"
                />
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Achievements</h2>
              <div className="space-y-3">
                <Achievement
                  icon={MessageSquare}
                  title="First Conversation"
                  description="Complete your first conversation"
                  unlocked={(overview?.totalConversations || 0) >= 1}
                />
                <Achievement
                  icon={BookOpen}
                  title="Word Collector"
                  description="Learn 50 vocabulary words"
                  unlocked={(overview?.totalVocabulary || 0) >= 50}
                />
                <Achievement
                  icon={Flame}
                  title="On Fire"
                  description="Maintain a 7-day streak"
                  unlocked={(overview?.streakDays || 0) >= 7}
                />
                <Achievement
                  icon={Clock}
                  title="Dedicated"
                  description="Practice for 10 hours total"
                  unlocked={(overview?.totalPracticeMinutes || 0) >= 600}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  bgColor 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  color: string;
  bgColor: string;
}) {
  return (
    <Card className="p-4 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bgColor}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </Card>
  );
}

function StatusBar({ 
  label, 
  count, 
  total, 
  color 
}: { 
  label: string; 
  count: number; 
  total: number; 
  color: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{count}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function Achievement({ 
  icon: Icon, 
  title, 
  description, 
  unlocked 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  unlocked: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${unlocked ? 'bg-yellow-50' : 'bg-gray-50'}`}>
      <div className={`p-2 rounded-lg ${unlocked ? 'bg-yellow-100' : 'bg-gray-200'}`}>
        <Icon className={`w-5 h-5 ${unlocked ? 'text-yellow-600' : 'text-gray-400'}`} />
      </div>
      <div className="flex-1">
        <p className={`font-medium ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
          {title}
        </p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      {unlocked && <Badge variant="success">Unlocked</Badge>}
    </div>
  );
}

function ActivityHeatmap({ data }: { data: any[] }) {
  // Generate last 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = data.find(d => d.weekStarting <= dateStr && d.weekStarting >= format(subDays(date, 6), 'yyyy-MM-dd'));
    return {
      date,
      activity: dayData?.conversationsCount || 0,
      minutes: dayData?.practiceMinutes || 0,
    };
  });

  const maxActivity = Math.max(...days.map(d => d.activity), 1);

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day, index) => {
        const intensity = day.activity / maxActivity;
        let bgColor = 'bg-gray-100';
        if (intensity > 0.75) bgColor = 'bg-blue-600';
        else if (intensity > 0.5) bgColor = 'bg-blue-400';
        else if (intensity > 0.25) bgColor = 'bg-blue-200';
        else if (intensity > 0) bgColor = 'bg-blue-100';

        return (
          <div
            key={index}
            className={`aspect-square rounded ${bgColor} relative group cursor-pointer`}
            title={`${format(day.date, 'MMM d')}: ${day.activity} conversations, ${day.minutes} min`}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-medium text-white">{day.activity || ''}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getLanguageFlag(code: string): string {
  const flags: Record<string, string> = {
    de: '🇩🇪',
    es: '🇪🇸',
    fr: '🇫🇷',
    it: '🇮🇹',
    pt: '🇵🇹',
    en: '🇬🇧',
  };
  return flags[code] || '🌐';
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    de: 'German',
    es: 'Spanish',
    fr: 'French',
    it: 'Italian',
    pt: 'Portuguese',
    en: 'English',
  };
  return names[code] || code.toUpperCase();
}
