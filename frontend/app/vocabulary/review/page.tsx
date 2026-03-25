'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useVocabularyPage } from '@/hooks/useVocabulary';
import { 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff,
  Volume2,
  ArrowRight,
  Trophy,
  Clock
} from 'lucide-react';

const DIFFICULTY_RATINGS = [
  { value: 1, label: 'Again', color: 'bg-red-500 hover:bg-red-600', icon: XCircle },
  { value: 2, label: 'Hard', color: 'bg-orange-500 hover:bg-orange-600', icon: Clock },
  { value: 3, label: 'Good', color: 'bg-blue-500 hover:bg-blue-600', icon: CheckCircle },
  { value: 4, label: 'Easy', color: 'bg-green-500 hover:bg-green-600', icon: Trophy },
];

export default function ReviewPage() {
  const router = useRouter();
  const { dueForReview, submitReview, isLoading } = useVocabularyPage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [reviewStats, setReviewStats] = useState({ correct: 0, total: 0 });

  const currentItem = dueForReview?.[currentIndex];
  const totalItems = dueForReview?.length || 0;
  const progress = totalItems > 0 ? ((currentIndex) / totalItems) * 100 : 0;

  useEffect(() => {
    if (!isLoading && dueForReview?.length === 0) {
      setCompleted(true);
    }
  }, [dueForReview, isLoading]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleRate = (difficulty: number) => {
    if (!currentItem) return;

    submitReview({ id: currentItem.id, difficulty });
    setReviewStats(prev => ({
      correct: prev.correct + (difficulty >= 3 ? 1 : 0),
      total: prev.total + 1
    }));

    if (currentIndex < totalItems - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setCompleted(false);
    setReviewStats({ correct: 0, total: 0 });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (completed) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Review Complete!
            </h1>
            <p className="text-gray-600 mb-6">
              You reviewed {reviewStats.total} words
              {reviewStats.total > 0 && (
                <span> and got {reviewStats.correct} correct</span>
              )}
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="secondary" onClick={() => router.push('/vocabulary')}>
                Back to Vocabulary
              </Button>
              {dueForReview?.length > 0 && (
                <Button onClick={handleRestart}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Review Again
                </Button>
              )}
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentItem) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              All Caught Up!
            </h1>
            <p className="text-gray-600 mb-6">
              You have no words due for review right now.
            </p>
            <Button onClick={() => router.push('/vocabulary')}>
              Back to Vocabulary
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Card {currentIndex + 1} of {totalItems}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <Card className="p-8 md:p-12">
          <div className="text-center mb-8">
            {/* Word */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-4xl font-bold text-gray-900">
                {currentItem.word}
              </h2>
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => {
                  // Text-to-speech could be implemented here
                  const utterance = new SpeechSynthesisUtterance(currentItem.word);
                  utterance.lang = getLanguageCode(currentItem.languageCode);
                  window.speechSynthesis.speak(utterance);
                }}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Part of speech */}
            <p className="text-gray-500 text-lg">
              {currentItem.partOfSpeech.toLowerCase()}
            </p>

            {/* Context hint (if available) */}
            {currentItem.contextPhrase && (
              <p className="mt-4 text-gray-600 italic">
                "{currentItem.contextPhrase}"
              </p>
            )}
          </div>

          {/* Answer section */}
          {!showAnswer ? (
            <div className="text-center">
              <Button 
                size="lg" 
                onClick={handleShowAnswer}
                className="px-12"
              >
                <Eye className="w-5 h-5 mr-2" />
                Show Answer
              </Button>
            </div>
          ) : (
            <div className="border-t pt-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {currentItem.translation}
                </h3>
                {currentItem.definition && (
                  <p className="text-gray-600">{currentItem.definition}</p>
                )}
              </div>

              {/* Difficulty rating buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DIFFICULTY_RATINGS.map((rating) => (
                  <button
                    key={rating.value}
                    onClick={() => handleRate(rating.value)}
                    className={`${rating.color} text-white py-4 px-4 rounded-xl font-medium transition-colors flex flex-col items-center gap-2`}
                  >
                    <rating.icon className="w-6 h-6" />
                    <span>{rating.label}</span>
                    <span className="text-xs opacity-75">
                      [{getInterval(rating.value, currentItem.reviewCount)}]
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-gray-500 mt-6">
                How well did you know this word?
              </p>
            </div>
          )}
        </Card>

        {/* Navigation hint */}
        <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
          <span>Press Space to {showAnswer ? 'rate Again' : 'show answer'}</span>
          <div className="flex gap-4">
            <span className="hidden md:inline">1-4 to rate</span>
            <button 
              onClick={() => router.push('/vocabulary')}
              className="hover:text-gray-700"
            >
              Exit review
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Helper function to get browser language code
function getLanguageCode(code: string): string {
  const map: Record<string, string> = {
    'de': 'de-DE',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'it': 'it-IT',
    'pt': 'pt-PT',
    'en': 'en-US',
  };
  return map[code] || code;
}

// Helper to estimate next review interval (simplified SR algorithm)
function getInterval(difficulty: number, reviewCount: number): string {
  const intervals: Record<number, string[]> = {
    1: ['10m', '10m', '10m', '10m', '10m'], // Again - reset
    2: ['1d', '2d', '4d', '7d', '12d'],     // Hard
    3: ['1d', '3d', '7d', '14d', '30d'],    // Good
    4: ['2d', '5d', '12d', '25d', '60d'],   // Easy
  };
  const index = Math.min(reviewCount, 4);
  return intervals[difficulty][index];
}
