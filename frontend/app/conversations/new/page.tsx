'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useConversations } from '@/hooks/useConversations';
import { 
  MessageSquare, 
  Utensils, 
  Briefcase, 
  ShoppingBag, 
  MapPin, 
  Hotel,
  GraduationCap,
  MessageCircle,
  HelpCircle,
  Target,
  Users,
  ArrowRight
} from 'lucide-react';

const languages = [
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
];

const conversationTypes = [
  { id: 'FreeChat', name: 'Free Chat', icon: MessageCircle, description: 'Casual conversation on any topic' },
  { id: 'Scenario', name: 'Scenario', icon: Target, description: 'Practice specific real-life situations' },
  { id: 'GrammarPractice', name: 'Grammar Practice', icon: GraduationCap, description: 'Focus on grammar exercises' },
  { id: 'VocabularyQuiz', name: 'Vocabulary Quiz', icon: HelpCircle, description: 'Test your vocabulary knowledge' },
  { id: 'Debate', name: 'Debate', icon: Users, description: 'Discuss controversial topics' },
  { id: 'Interview', name: 'Interview', icon: Briefcase, description: 'Practice job interviews' },
];

const scenarios = [
  { id: 'restaurant', name: 'Restaurant', icon: Utensils, description: 'Ordering food, asking about the menu' },
  { id: 'job-interview', name: 'Job Interview', icon: Briefcase, description: 'Common interview questions' },
  { id: 'shopping', name: 'Shopping', icon: ShoppingBag, description: 'Buying clothes, asking for sizes' },
  { id: 'directions', name: 'Directions', icon: MapPin, description: 'Asking for and giving directions' },
  { id: 'hotel', name: 'Hotel Check-in', icon: Hotel, description: 'Booking rooms, asking for services' },
  { id: 'small-talk', name: 'Small Talk', icon: MessageSquare, description: 'Casual social conversations' },
];

export default function NewConversationPage() {
  const router = useRouter();
  const { startConversation, isLoading } = useConversations();
  
  const [step, setStep] = useState<'language' | 'type' | 'scenario' | 'title'>('language');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');

  const handleStart = async () => {
    const title = customTitle || 
      (selectedType === 'Scenario' && selectedScenario 
        ? scenarios.find(s => s.id === selectedScenario)?.name 
        : conversationTypes.find(t => t.id === selectedType)?.name);

    const result = await startConversation({
      languageCode: selectedLanguage,
      type: selectedType,
      scenario: selectedType === 'Scenario' ? selectedScenario : undefined,
      title: title,
    });

    if (result?.id) {
      router.push(`/conversations/${result.id}`);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'language':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Choose a Language</h2>
            <p className="text-gray-600">Select the language you want to practice</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.code);
                    setStep('type');
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedLanguage === lang.code
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl mr-3">{lang.flag}</span>
                  <span className="font-medium text-gray-900">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'type':
        return (
          <div className="space-y-4">
            <button 
              onClick={() => setStep('language')}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              ← Back to language
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Choose Conversation Type</h2>
            <p className="text-gray-600">How do you want to practice today?</p>
            <div className="grid grid-cols-1 gap-3">
              {conversationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      if (type.id === 'Scenario') {
                        setStep('scenario');
                      } else {
                        setStep('title');
                      }
                    }}
                    className={`p-4 rounded-xl border-2 text-left flex items-start gap-4 transition-all ${
                      selectedType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{type.name}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                    <ArrowRight className={`w-5 h-5 ml-auto ${selectedType === type.id ? 'text-blue-500' : 'text-gray-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'scenario':
        return (
          <div className="space-y-4">
            <button 
              onClick={() => setStep('type')}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              ← Back to type
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Choose a Scenario</h2>
            <p className="text-gray-600">Select a real-life situation to practice</p>
            <div className="grid grid-cols-1 gap-3">
              {scenarios.map((scenario) => {
                const Icon = scenario.icon;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => {
                      setSelectedScenario(scenario.id);
                      setStep('title');
                    }}
                    className={`p-4 rounded-xl border-2 text-left flex items-start gap-4 transition-all ${
                      selectedScenario === scenario.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{scenario.name}</h3>
                      <p className="text-sm text-gray-600">{scenario.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'title':
        return (
          <div className="space-y-4">
            <button 
              onClick={() => setStep(selectedType === 'Scenario' ? 'scenario' : 'type')}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              ← Back
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Customize (Optional)</h2>
            <p className="text-gray-600">Give your conversation a title or use the default</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conversation Title
                </label>
                <Input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={
                    selectedType === 'Scenario' && selectedScenario
                      ? scenarios.find(s => s.id === selectedScenario)?.name
                      : conversationTypes.find(t => t.id === selectedType)?.name
                  }
                />
              </div>
              <Button 
                onClick={handleStart} 
                isLoading={isLoading}
                className="w-full"
                size="lg"
              >
                Start Conversation
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8">
        <Card className="p-6">
          {renderStep()}
        </Card>
      </div>
    </DashboardLayout>
  );
}
