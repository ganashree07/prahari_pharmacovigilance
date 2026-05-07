'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  ExternalLink,
  Upload,
  FileText,
  User,
  Calendar,
  Target,
  Shield,
  FileSearch,
  Activity,
  History,
  AlertCircle,
  FileCheck2,
  Award,
  Stethoscope
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DoctorAssessment } from '@/components/doctor-assessment';

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
  source_url?: string;
  confidence: number;
  integrity: number;
  category: 'KNOWN' | 'NOVEL' | 'UNRELATED';
  status: 'pending_review' | 'escalated' | 'under_review' | 'resolved';
  created_at: string;
  submitted_at?: string;
  raw_text?: string;
  user_confirmations: number;
  doctor_validations: number;
  submitted_to_authority: boolean;
  authority_status: string;
  verification_data?: {
    doctor_name: string;
    doctor_credential: string;
    verification_timestamp: string;
    notes: string;
  };
}

interface SignalDetailProps {
  signalId: string;
  onNavigate: (screen: string, signalId?: string) => void;
  userRole?: string | null;
}

export function SignalDetail({ signalId, onNavigate, userRole }: SignalDetailProps) {
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSignalDetail();
  }, [signalId]);

  const fetchSignalDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:8000/api/signals/${signalId}`);
      
      if (response.ok) {
        const signalData = await response.json();
        setSignal(signalData);
      } else {
        throw new Error('Failed to fetch signal detail');
      }
    } catch (error) {
      console.error('Failed to fetch signal detail:', error);
      setError('Connection Error: Could not reach the medical database. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitToCDSCO = async () => {
    if (!signal) return;
    
    try {
      setSubmitting(true);
      
      const response = await fetch(`http://localhost:8000/api/signals/${signalId}/submit`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        setSignal(result);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Submission failed: ${errorData.detail || 'Server error'}`);
      }
    } catch (error) {
      console.error('Network error during submission:', error);
      alert('Network error: Could not reach the backend server.');
    } finally {
      setSubmitting(false);
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
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-12 text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h3 className="text-xl font-bold text-destructive">System Offline</h3>
          <p className="max-w-md mx-auto text-muted-foreground">{error}</p>
          <Button onClick={fetchSignalDetail} variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive/10">
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!signal) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Signal not found</h3>
            <p>The requested signal could not be found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Authority Banner */}
      {signal.submitted_to_authority && (
        <div className="bg-green-500 text-white p-4 rounded-xl flex items-center justify-between shadow-lg animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6" />
            <div>
              <p className="font-bold text-lg">Submitted to CDSCO ✓</p>
              <p className="text-xs opacity-90">Official report filed on {new Date(signal.submitted_at!).toLocaleString()}</p>
            </div>
          </div>
          <Badge className="bg-white/20 border-white/40 text-white">Status: {signal.authority_status}</Badge>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => onNavigate('signals')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Signals
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Signal Details</h1>
            <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest">ID: {signal.id}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={getCategoryBadgeVariant(signal.category)} className="font-bold">
            {signal.category}
          </Badge>
          <Badge variant={getStatusBadgeVariant(signal.status)} className="flex items-center space-x-1 font-semibold">
            {getStatusIcon(signal.status)}
            <span className="capitalize">{signal.status.replace('_', ' ')}</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="officer-review" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Officer Review</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <Card className="border-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span>Signal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Drug</label>
                      <p className="text-xl font-extrabold">{signal.drug}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Symptom</label>
                      <p className="text-xl font-extrabold text-destructive">
                        {signal.symptom}
                        {userRole === 'patient' && SYMPTOM_TRANSLATIONS[signal.symptom] && (
                          <span className="text-slate-400 font-normal ml-1">({SYMPTOM_TRANSLATIONS[signal.symptom]})</span>
                        )}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">MedDRA Code</label>
                      <Badge variant="secondary" className="font-mono text-sm">{signal.meddra}</Badge>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Source</label>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{signal.source}</span>
                        {signal.source_url && (
                          <Button variant="ghost" size="icon" asChild className="h-6 w-6 rounded-full">
                            <a href={signal.source_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confidence Score</label>
                        <span className="font-bold text-sm">{signal.confidence}%</span>
                      </div>
                      <div className="bg-muted rounded-full h-2.5 overflow-hidden shadow-inner">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            signal.confidence >= 80 ? 'bg-green-500' : 
                            signal.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${signal.confidence}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Data Integrity</label>
                        <span className="font-bold text-sm">{signal.integrity}%</span>
                      </div>
                      <div className="bg-muted rounded-full h-2.5 overflow-hidden shadow-inner">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            signal.integrity >= 80 ? 'bg-green-500' : 
                            signal.integrity >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${signal.integrity}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-blue-500/5 border-blue-500/10">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-3xl font-black text-blue-600">{signal.user_confirmations}</p>
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-500">Users Confirmed</p>
                          </div>
                          <User className="h-8 w-8 text-blue-500/30" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-amber-500/5 border-amber-500/10">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-3xl font-black text-amber-600">{signal.doctor_validations}</p>
                            <p className="text-xs font-bold uppercase tracking-widest text-amber-500">Doctors Validated</p>
                          </div>
                          <Stethoscope className="h-8 w-8 text-amber-500/30" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>Raw Content</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-6 rounded-xl border border-dashed border-primary/20">
                    <p className="text-sm leading-relaxed italic text-muted-foreground">"{signal.raw_text}"</p>
                  </div>
                </CardContent>
              </Card>

              {signal.verification_data && (
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-700">
                      <Shield className="h-5 w-5" />
                      <span>Medical Verification</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/50 p-4 rounded-lg shadow-sm">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Verified By</label>
                        <p className="font-bold text-green-800">{signal.verification_data.doctor_name}</p>
                        <p className="text-xs text-green-600 font-medium">{signal.verification_data.doctor_credential}</p>
                      </div>
                      <div className="bg-white/50 p-4 rounded-lg shadow-sm">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Verification Time</label>
                        <p className="font-bold">{new Date(signal.verification_data.verification_timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Medical Notes</label>
                      <div className="bg-white/50 p-4 rounded-lg border-l-4 border-green-500 shadow-sm">
                        <p className="text-sm leading-relaxed font-medium">{signal.verification_data.notes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="officer-review" className="mt-6">
              <Card className="border-primary/5">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">PvPI Report Summary</CardTitle>
                      <CardDescription>Auto-generated pharmacovigilance report for CDSCO submission</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-background font-mono">PvPI-2024-001</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Suspected Drug</p>
                      <p className="text-2xl font-black text-primary">{signal.drug}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Adverse Event</p>
                      <p className="text-2xl font-black text-destructive">{signal.symptom}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <p className="text-sm font-bold flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Officer Validations</span>
                    </p>
                    <div className="p-4 bg-muted/50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Automated Triage System</p>
                          <p className="text-[10px] text-muted-foreground">Confidence verified via NLP engine</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500">CLEARED</Badge>
                    </div>
                  </div>

                  {userRole === 'doctor' && (
                    <div className="pt-4">
                      {signal.status !== 'escalated' ? (
                        <Button 
                          size="lg" 
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-8 text-xl shadow-xl transition-all hover:scale-[1.01]"
                          onClick={handleSubmitToCDSCO}
                          disabled={submitting}
                        >
                          <Upload className="h-6 w-6 mr-3" />
                          {submitting ? 'Processing Submission...' : 'Final Submission to CDSCO'}
                        </Button>
                      ) : (
                        <div className="p-6 bg-green-500 text-white rounded-xl flex flex-col items-center justify-center space-y-2 shadow-inner">
                          <CheckCircle className="h-10 w-10" />
                          <span className="font-black text-xl tracking-tighter">SUCCESSFULLY FILED WITH CDSCO</span>
                          <span className="text-xs opacity-80">Reference ID: PvPI-INDIA-2024-X992</span>
                        </div>
                      )}
                    </div>
                  )}

                  {userRole === 'patient' && (
                    <div className="p-6 bg-muted/50 rounded-xl border border-dashed text-center">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-primary/40" />
                      <p className="text-sm font-semibold text-muted-foreground">Officer review is restricted to medical personnel.</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Your contribution has been noted and is being analyzed.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          {/* Doctor Assessment Section */}
          {userRole === 'doctor' && !signal.submitted_to_authority && (
            <DoctorAssessment 
              drugName={signal.drug} 
              symptomName={signal.symptom} 
              signalId={signal.id}
              onSubmit={() => onNavigate('signals')} 
            />
          )}

          {userRole === 'patient' && (
            <Card className="bg-primary/5 border-primary/20 shadow-lg overflow-hidden">
              <div className="h-1.5 bg-primary w-full" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center space-x-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span>Your Contribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Safety Badge</p>
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs">Verified Reporter</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your recent verification of <span className="font-bold">{signal.drug}</span> has added <span className="text-primary font-bold">+50 points</span> to your community impact score.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:bg-muted">
                <div className="relative flex items-center space-x-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-sm z-10">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Signal Detected</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(signal.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {signal.verification_data && (
                  <div className="relative flex items-center space-x-4">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow-sm z-10">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Medical Verification</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(signal.verification_data.verification_timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {signal.submitted_at && (
                  <div className="relative flex items-center space-x-4">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm z-10">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Submitted to CDSCO</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(signal.submitted_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {userRole === 'doctor' && (
            <Card className="border-primary/5">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>Administrative Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start h-9 text-xs font-semibold hover:bg-primary/5 hover:text-primary transition-colors">
                  <FileSearch className="h-3.5 w-3.5 mr-2" />
                  Mark as Reviewed
                </Button>
                <Button variant="outline" className="w-full justify-start h-9 text-xs font-semibold hover:bg-primary/5 hover:text-primary transition-colors">
                  <User className="h-3.5 w-3.5 mr-2" />
                  Assign to Peer Review
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
