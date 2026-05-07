'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Stethoscope, ShieldCheck, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin?: (role: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const router = useRouter();
  const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
  const [mciNumber, setMciNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!role) return;
    if (role === 'doctor' && !mciNumber) return;

    setLoading(true);
    // Simulate a brief delay for "premium" feel
    setTimeout(() => {
      localStorage.setItem('userRole', role);
      if (role === 'doctor') {
        localStorage.setItem('mciNumber', mciNumber);
      }
      if (onLogin) {
        onLogin(role);
      } else {
        router.push('/');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-background via-muted/50 to-background p-4">
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="px-3 py-1 text-xs font-semibold tracking-wider uppercase border-primary/20 bg-primary/5 text-primary">
            Prahari - Pharmacovigilance Portal
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
            Welcome to Prahari
          </h1>
          <p className="text-muted-foreground text-lg">
            Select your portal to continue with signal monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Card */}
          <Card 
            className={`relative group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${role === 'patient' ? 'ring-2 ring-primary border-primary' : 'border-border/50'}`}
            onClick={() => setRole('patient')}
          >
            <CardHeader className="pb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${role === 'patient' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                <User className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl mt-4">User Portal</CardTitle>
              <CardDescription>View drug safety signals and contribute your experience.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Public Safety Alerts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Contribution Badges</span>
                </li>
              </ul>
            </CardContent>
            {role === 'patient' && (
              <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                <Badge className="bg-primary text-primary-foreground">Selected</Badge>
              </div>
            )}
          </Card>

          {/* Doctor Card */}
          <Card 
            className={`relative group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${role === 'doctor' ? 'ring-2 ring-primary border-primary' : 'border-border/50'}`}
            onClick={() => setRole('doctor')}
          >
            <CardHeader className="pb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${role === 'doctor' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                <Stethoscope className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl mt-4">Doctor Portal</CardTitle>
              <CardDescription>Clinical assessment and CDSCO escalation tools.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Clinical Assessments</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Earn CME Credits</span>
                </li>
              </ul>
              
              {role === 'doctor' && (
                <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1">
                    <Label htmlFor="mci" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">MCI Registration Number</Label>
                    <Input 
                      id="mci" 
                      placeholder="Enter your MCI number" 
                      value={mciNumber}
                      onChange={(e) => setMciNumber(e.target.value)}
                      className="bg-muted/50 border-primary/20 focus:ring-primary/20"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <p className="text-[10px] leading-tight text-muted-foreground bg-primary/5 p-2 rounded-lg border border-primary/10 italic">
                    "CME credits will be awarded for validated reports - recognized under NMC 2020 framework"
                  </p>
                </div>
              )}
            </CardContent>
            {role === 'doctor' && (
              <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                <Badge className="bg-primary text-primary-foreground">Selected</Badge>
              </div>
            )}
          </Card>
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            size="lg" 
            className="w-full max-w-sm h-12 text-lg font-bold transition-all duration-300 hover:scale-[1.02] shadow-lg group"
            disabled={!role || (role === 'doctor' && !mciNumber) || loading}
            onClick={handleLogin}
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Entering Portal...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Secure access restricted to authorized personnel.
        </p>
      </div>
    </div>
  );
}
