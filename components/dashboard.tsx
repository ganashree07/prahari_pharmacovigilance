'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SYMPTOM_TRANSLATIONS: Record<string, string> = {
  'Toxic epidermal necrolysis': 'severe skin peeling and blistering',
  'Nausea': 'feeling like you want to vomit',
  'Palpitations': 'heart beating fast or irregularly',
  'Headache': 'pain in your head',
  'Memory loss': 'forgetting things more than usual'
};

interface DashboardStats {
  active_projects: number;
  signals_today: number;
  novel_adrs: number;
  pending_review: number;
}

interface TrendData {
  date: string;
  known_adr: number;
  novel_adr: number;
}

interface DashboardProps {
  onNavigate: (screen: string, signalId?: string) => void;
  userRole?: string | null;
}

interface Signal {
  id: string;
  drug: string;
  symptom: string;
  source: string;
  created_at: string;
  category: string;
  submitted_to_authority: boolean;
  doctor_validations: number;
  user_confirmations: number;
}

export function Dashboard({ onNavigate, userRole }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [recentSignals, setRecentSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, trendResponse, signalsResponse] = await Promise.all([
        fetch('http://localhost:8000/api/dashboard/stats'),
        fetch('http://localhost:8000/api/dashboard/trend'),
        fetch('http://localhost:8000/api/signals?per_page=5')
      ]);
      
      if (!statsResponse.ok || !trendResponse.ok || !signalsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const statsData = await statsResponse.json();
      const trendData = await trendResponse.json();
      const signalsData = await signalsResponse.json();

      setStats(statsData);
      setTrendData(trendData);
      setRecentSignals(signalsData.signals);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Connection Error: Could not reach the medical database.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of pharmacovigilance signals</p>
        </div>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-16 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
            <h3 className="text-xl font-bold text-destructive">System Offline</h3>
            <p className="max-w-md mx-auto text-muted-foreground">{error}</p>
            <Button onClick={fetchDashboardData} variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive/10">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of pharmacovigilance signals</p>
        </div>
        <Button onClick={() => onNavigate('signals')}>
          View All Signals
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_projects}</div>
            <p className="text-xs text-muted-foreground">
              Monitoring projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signals Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.signals_today}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3" /> +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novel ADRs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.novel_adrs}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pending_review}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>7-Day Signal Trend</CardTitle>
          <CardDescription>
            Daily count of known vs novel adverse drug reactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="known_adr" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Known ADRs"
                />
                <Line 
                  type="monotone" 
                  dataKey="novel_adr" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                  name="Novel ADRs"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Signals</CardTitle>
            <CardDescription>Latest detected pharmacovigilance signals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSignals.map(signal => (
                <div key={signal.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Badge variant={signal.category === 'NOVEL' ? 'destructive' : 'secondary'}>{signal.category}</Badge>
                    <div>
                      <p className="font-medium">
                        {signal.drug} - {signal.symptom}
                        {userRole === 'patient' && SYMPTOM_TRANSLATIONS[signal.symptom] && (
                          <span className="text-slate-400 font-normal ml-1 text-xs">({SYMPTOM_TRANSLATIONS[signal.symptom]})</span>
                        )}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-[10px] text-muted-foreground">{signal.source} • {new Date(signal.created_at).toLocaleDateString()}</p>
                        {signal.submitted_to_authority && (
                          <Badge className="h-4 px-1 text-[8px] bg-green-500 border-none">Authority Filed</Badge>
                        )}
                        {signal.doctor_validations > 0 && (
                          <Badge className="h-4 px-1 text-[8px] bg-amber-500 border-none">Doctor Verified</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onNavigate('signals', signal.id)}>
                    View
                  </Button>
                </div>
              ))}
              {recentSignals.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No recent signals detected.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userRole === 'doctor' && (
              <Button className="w-full justify-start" onClick={() => onNavigate('onboarding')}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Onboard New Source
              </Button>
            )}
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('signals')}>
              <Activity className="mr-2 h-4 w-4" />
              Review Pending Signals
            </Button>
            {userRole === 'doctor' && (
              <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('projects')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Manage Projects
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
