'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ExternalLink,
  ClipboardCheck,
  Stethoscope,
  User
} from 'lucide-react';
import { PatientQuestionnaire } from '@/components/patient-questionnaire';

const SYMPTOM_TRANSLATIONS: Record<string, string> = {
  'Toxic epidermal necrolysis': 'severe skin peeling and blistering',
  'Nausea': 'feeling like you want to vomit',
  'Palpitations': 'heart beating fast or irregularly',
  'Headache': 'pain in your head',
  'Memory loss': 'forgetting things more than usual'
};

interface Signal {
  id: string;
  drug: string;
  symptom: string;
  meddra: string;
  source: string;
  confidence: number;
  integrity: number;
  category: 'KNOWN' | 'NOVEL' | 'UNRELATED';
  status: 'pending_review' | 'escalated' | 'under_review' | 'resolved';
  created_at: string;
  submitted_at?: string;
  user_confirmations: number;
  doctor_validations: number;
  submitted_to_authority: boolean;
}

interface SignalListProps {
  onNavigate: (screen: string, signalId?: string) => void;
  userRole?: string | null;
}

export function SignalList({ onNavigate, userRole }: SignalListProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Patient Questionnaire state
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [activeSignal, setActiveSignal] = useState<Signal | null>(null);

  useEffect(() => {
    fetchSignals();
  }, []);

  useEffect(() => {
    filterSignals();
  }, [signals, searchTerm, categoryFilter, statusFilter]);

  const fetchSignals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/signals');
      
      if (response.ok) {
        const data = await response.json();
        setSignals(data.signals);
      } else {
        throw new Error('Failed to fetch signals');
      }
    } catch (error) {
      console.error('Failed to fetch signals:', error);
      setError('Connection Error: Could not reach the medical database.');
    } finally {
      setLoading(false);
    }
  };

  const filterSignals = () => {
    let filtered = signals;

    if (searchTerm) {
      filtered = filtered.filter(signal => 
        signal.drug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        signal.symptom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        signal.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(signal => signal.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(signal => signal.status === statusFilter);
    }

    setFilteredSignals(filtered);
  };

  const handleViewDetails = (signal: Signal) => {
    if (userRole === 'patient') {
      setActiveSignal(signal);
      setShowQuestionnaire(true);
    } else {
      onNavigate('signal-detail', signal.id);
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'NOVEL': return 'destructive';
      case 'KNOWN': return 'secondary';
      case 'UNRELATED': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending_review': return 'secondary';
      case 'escalated': return 'destructive';
      case 'under_review': return 'default';
      case 'resolved': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_review': return <Clock className="h-3 w-3" />;
      case 'escalated': return <AlertTriangle className="h-3 w-3" />;
      case 'under_review': return <Eye className="h-3 w-3" />;
      case 'resolved': return <CheckCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Signals</h1>
            <p className="text-muted-foreground">Pharmacovigilance signals requiring attention</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Signals</h1>
            <p className="text-muted-foreground">Pharmacovigilance signals requiring attention</p>
          </div>
        </div>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-16 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
            <h3 className="text-xl font-bold text-destructive">System Offline</h3>
            <p className="max-w-md mx-auto text-muted-foreground">{error}</p>
            <Button onClick={fetchSignals} variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive/10">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showQuestionnaire && activeSignal && (
        <PatientQuestionnaire 
          drugName={activeSignal.drug}
          symptomName={activeSignal.symptom}
          signalId={activeSignal.id}
          onClose={() => setShowQuestionnaire(false)}
          onSubmit={() => {
            setShowQuestionnaire(false);
            onNavigate('signals');
          }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Signals</h1>
          <p className="text-muted-foreground">
            {filteredSignals.length} pharmacovigilance signals found
          </p>
        </div>
        <Button variant="outline" onClick={() => onNavigate('dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by drug, symptom, or source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40 h-11">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="NOVEL">Novel</SelectItem>
            <SelectItem value="KNOWN">Known</SelectItem>
            <SelectItem value="UNRELATED">Unrelated</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-11">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredSignals.map((signal) => (
          <Card key={signal.id} className="hover:shadow-lg transition-all duration-300 border-primary/5 hover:border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold">
                      {signal.drug} - <span className="text-destructive">
                        {signal.symptom}
                        {userRole === 'patient' && SYMPTOM_TRANSLATIONS[signal.symptom] && (
                          <span className="text-slate-400 font-normal ml-1">({SYMPTOM_TRANSLATIONS[signal.symptom]})</span>
                        )}
                      </span>
                    </h3>
                    <Badge variant={getCategoryBadgeVariant(signal.category)} className="font-bold">
                      {signal.category}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(signal.status)} className="flex items-center space-x-1 font-semibold">
                      {getStatusIcon(signal.status)}
                      <span className="capitalize">{signal.status.replace('_', ' ')}</span>
                    </Badge>
                    
                    {/* Live Status Badges */}
                    {signal.submitted_to_authority && (
                      <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold border-none">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Sent to Authority
                      </Badge>
                    )}
                    {signal.doctor_validations > 0 && (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold border-none">
                        <Stethoscope className="h-3 w-3 mr-1" />
                        Doctor Verified
                      </Badge>
                    )}
                    {signal.user_confirmations > 0 && (
                      <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-bold border-none">
                        <User className="h-3 w-3 mr-1" />
                        User Confirmed
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-foreground/70">Source:</span> 
                      <span>{signal.source}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-foreground/70">MedDRA:</span> 
                      <span className="font-mono">{signal.meddra}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-foreground/70">Detected:</span> 
                      <span>{new Date(signal.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8 text-xs font-semibold">
                    <div className="flex items-center space-x-3">
                      <span className="text-muted-foreground uppercase tracking-wider">Confidence:</span>
                      <div className="w-24 bg-muted rounded-full h-2 shadow-inner">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            signal.confidence >= 80 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                            signal.confidence >= 60 ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                          }`}
                          style={{ width: `${signal.confidence}%` }}
                        />
                      </div>
                      <span className="text-foreground">{signal.confidence}%</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-muted-foreground uppercase tracking-wider">Integrity:</span>
                      <div className="w-24 bg-muted rounded-full h-2 shadow-inner">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            signal.integrity >= 80 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                            signal.integrity >= 60 ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                          }`}
                          style={{ width: `${signal.integrity}%` }}
                        />
                      </div>
                      <span className="text-foreground">{signal.integrity}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button 
                    variant={userRole === 'patient' ? 'default' : 'outline'} 
                    size="sm"
                    className={`font-bold transition-all ${userRole === 'patient' ? 'bg-primary hover:scale-105 shadow-md' : ''}`}
                    onClick={() => handleViewDetails(signal)}
                  >
                    {userRole === 'patient' ? (
                      <>
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        Verify Safety
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </>
                    )}
                  </Button>
                  
                  {signal.source.includes('http') && (
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSignals.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-16 text-center">
            <div className="text-muted-foreground">
              <Filter className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold mb-2">No matching signals found</h3>
              <p className="max-w-xs mx-auto">Try refining your search or clearing filters to see more results.</p>
              <Button variant="link" onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setStatusFilter('all'); }}>Clear all filters</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
