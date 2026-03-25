"use client";

import { useAuth } from "@/hooks/useAuth";
import { Bell, LogOut, Flame } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 lg:top-0 top-14 z-30">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="lg:hidden w-8" /> {/* Spacer for mobile */}
        
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2 text-orange-500">
              <Flame className="w-5 h-5" />
              <span className="font-semibold">{user.streakDays} day streak</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full"></span>
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className="hidden sm:flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
