'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useVocabulary } from '@/hooks/useVocabulary';
import { 
  Search, 
  Plus, 
  BookOpen, 
  RefreshCw, 
  Filter,
  MoreHorizontal,
  Volume2,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  New: { color: 'bg-blue-100 text-blue-800', label: 'New' },
  Learning: { color: 'bg-yellow-100 text-yellow-800', label: 'Learning' },
  Review: { color: 'bg-orange-100 text-orange-800', label: 'Review' },
  Mastered: { color: 'bg-green-100 text-green-800', label: 'Mastered' },
  Archived: { color: 'bg-gray-100 text-gray-800', label: 'Archived' },
};

const partOfSpeechLabels: Record<string, string> = {
  Noun: 'n.',
  Verb: 'v.',
  Adjective: 'adj.',
  Adverb: 'adv.',
  Pronoun: 'pron.',
  Preposition: 'prep.',
  Conjunction: 'conj.',
  Interjection: 'interj.',
  Phrase: 'phr.',
  Other: '',
};

export default function VocabularyPage() {
  const { vocabulary, stats, isLoading, dueForReview } = useVocabulary();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  const filteredVocabulary = vocabulary?.items.filter((item) => {
    const matchesSearch = 
      item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesLanguage = selectedLanguage === 'all' || item.languageCode === selectedLanguage;
    return matchesSearch && matchesFilter && matchesLanguage;
  }) || [];

  const dueCount = dueForReview?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vocabulary</h1>
            <p className="text-gray-600 mt-1">Manage and review your vocabulary</p>
          </div>
          <div className="flex gap-2">
            {dueCount > 0 && (
              <Link href="/vocabulary/review">
                <Button variant="secondary" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Review ({dueCount})
                </Button>
              </Link>
            )}
            <Link href="/vocabulary/add">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Word
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard 
            label="Total" 
            value={stats?.totalItems || 0} 
            icon={BookOpen}
            color="bg-blue-500"
          />
          <StatCard 
            label="New" 
            value={stats?.newItems || 0} 
            icon={Star}
            color="bg-slate-500"
          />
          <StatCard 
            label="Learning" 
            value={stats?.learningItems || 0} 
            icon={Clock}
            color="bg-yellow-500"
          />
          <StatCard 
            label="Review" 
            value={stats?.reviewItems || 0} 
            icon={RefreshCw}
            color="bg-orange-500"
          />
          <StatCard 
            label="Mastered" 
            value={stats?.masteredItems || 0} 
            icon={CheckCircle}
            color="bg-green-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search vocabulary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="all">All Languages</option>
              <option value="de">German</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
            </select>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="all">All Status</option>
              <option value="New">New</option>
              <option value="Learning">Learning</option>
              <option value="Review">Review</option>
              <option value="Mastered">Mastered</option>
            </select>
          </div>
        </div>

        {/* Vocabulary List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading vocabulary...</p>
          </div>
        ) : filteredVocabulary.length > 0 ? (
          <div className="grid gap-3">
            {filteredVocabulary.map((item) => (
              <VocabCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No words found' : 'No vocabulary yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? "Try adjusting your search."
                : "Words you learn in conversations will appear here, or you can add them manually."}
            </p>
            <Link href="/vocabulary/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Word
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ 
  label, 
  value, 
  icon: Icon,
  color 
}: { 
  label: string; 
  value: number; 
  icon: any;
  color: string;
}) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </Card>
  );
}

function VocabCard({ item }: { item: any }) {
  const status = statusConfig[item.status as keyof typeof statusConfig];

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-lg text-gray-900">{item.word}</h3>
            <span className="text-sm text-gray-500">
              {partOfSpeechLabels[item.partOfSpeech]}
            </span>
            <Badge className={status.color} size="sm">
              {status.label}
            </Badge>
          </div>
          
          <p className="text-gray-700 mt-1">{item.translation}</p>
          
          {item.definition && (
            <p className="text-sm text-gray-500 mt-1">{item.definition}</p>
          )}
          
          {item.contextPhrase && (
            <p className="text-sm text-gray-600 mt-2 italic">
              "{item.contextPhrase}"
            </p>
          )}
          
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span>{item.languageCode.toUpperCase()}</span>
            <span>{item.reviewCount} reviews</span>
            {item.nextReviewAt && (
              <span className={new Date(item.nextReviewAt) <= new Date() ? 'text-orange-600 font-medium' : ''}>
                Due {formatDistanceToNow(new Date(item.nextReviewAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Volume2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
