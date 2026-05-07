'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Activity, 
  Settings, 
  PlusCircle, 
  Shield,
  LogOut,
  User,
  Stethoscope
} from 'lucide-react';

type AppScreen = 'dashboard' | 'signals' | 'signal-detail' | 'projects' | 'onboarding';

interface NavigationProps {
  onNavigate: (screen: AppScreen, signalId?: string) => void;
  currentScreen: AppScreen;
  userRole?: string | null;
  onLogout?: () => void;
}

export function Navigation({ onNavigate, currentScreen, userRole, onLogout }: NavigationProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Prahari</h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Pharmacovigilance Portal</p>
              </div>
            </div>
            {userRole && (
              <Badge variant="outline" className="ml-4 px-3 py-1 flex items-center space-x-2 bg-muted/50 border-primary/20">
                {userRole === 'doctor' ? <Stethoscope className="h-3 w-3 text-primary" /> : <User className="h-3 w-3 text-primary" />}
                <span className="capitalize font-bold text-primary">{userRole === 'patient' ? 'user' : userRole}</span>
              </Badge>
            )}
          </div>
          
          <nav className="flex items-center space-x-2">
            <Button
              variant={currentScreen === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2 transition-all"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Dashboard</span>
            </Button>
            
            <Button
              variant={currentScreen === 'signals' ? 'default' : 'ghost'}
              onClick={() => onNavigate('signals')}
              className="flex items-center space-x-2 transition-all"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden md:inline">Signals</span>
              <Badge variant="secondary" className="ml-1">5</Badge>
            </Button>
            
            {userRole === 'doctor' && (
              <>
                <Button
                  variant={currentScreen === 'projects' ? 'default' : 'ghost'}
                  onClick={() => onNavigate('projects')}
                  className="flex items-center space-x-2 transition-all"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden md:inline">Projects</span>
                </Button>
                
                <Button
                  variant={currentScreen === 'onboarding' ? 'default' : 'ghost'}
                  onClick={() => onNavigate('onboarding')}
                  className="flex items-center space-x-2 transition-all"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden md:inline">Onboard Source</span>
                </Button>
              </>
            )}

            <div className="h-6 w-px bg-border mx-2" />

            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
