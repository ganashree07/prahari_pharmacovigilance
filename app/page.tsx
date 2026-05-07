'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dashboard } from '@/components/dashboard';
import { SignalList } from '@/components/signal-list';
import { SignalDetail } from '@/components/signal-detail';
import { ProjectConfig } from '@/components/project-config';
import { SourceOnboarding } from '@/components/source-onboarding';
import { Navigation } from '@/components/navigation';
import LoginPage from './login/page';

type AppScreen = 'dashboard' | 'signals' | 'signal-detail' | 'projects' | 'onboarding';

export default function Home() {
  const router = useRouter();
  const [screen, setScreen] = useState<AppScreen>('dashboard');
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (!storedRole) {
      router.push('/login');
    } else {
      setRole(storedRole);
      setIsLoaded(true);
    }
  }, [router]);

  const handleNavigate = (newScreen: string, signalId?: string) => {
    if (signalId) {
      setSelectedSignalId(signalId);
      setScreen('signal-detail');
    } else {
      setScreen(newScreen as AppScreen);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('mciNumber');
    router.push('/login');
  };

  if (!isLoaded) {
    return <LoginPage onLogin={(newRole) => {
      setRole(newRole);
      setIsLoaded(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation onNavigate={handleNavigate} currentScreen={screen} onLogout={handleLogout} userRole={role} />
      
      <main className="container mx-auto px-4 py-6">
        {screen === 'dashboard' && <Dashboard onNavigate={handleNavigate} userRole={role} />}
        {screen === 'signals' && <SignalList onNavigate={handleNavigate} userRole={role} />}
        {screen === 'signal-detail' && selectedSignalId && (
          <SignalDetail signalId={selectedSignalId} onNavigate={handleNavigate} userRole={role} />
        )}
        {screen === 'projects' && <ProjectConfig />}
        {screen === 'onboarding' && <SourceOnboarding />}
      </main>
    </div>
  );
}
