'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Globe,
  Zap,
  Search,
  Code,
  FileText,
  RefreshCw
} from 'lucide-react';

interface OnboardingStep {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: string;
  details?: string;
}

interface OnboardingJob {
  id: string;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  current_step: number;
  total_steps: number;
  steps: OnboardingStep[];
  confidence?: number;
  extraction_schema?: any;
  created_at: string;
  completed_at?: string;
}

export function SourceOnboarding() {
  const [jobs, setJobs] = useState<OnboardingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/sources/onboard');
      
      // Mock data for now
      const mockJobs: OnboardingJob[] = [];
      setJobs(mockJobs);
    } catch (error) {
      console.error('Failed to fetch onboarding jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    if (!newUrl.trim()) return;
    
    try {
      setSubmitting(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/sources/onboard', {
      //   method: 'POST',
      //   body: JSON.stringify({ url: newUrl })
      // });

      // Mock job creation
      const newJob: OnboardingJob = {
        id: Date.now().toString(),
        url: newUrl,
        status: 'running',
        progress: 0,
        current_step: 0,
        total_steps: 6,
        steps: [
          { step: 'URL Validation', status: 'pending', timestamp: new Date().toISOString() },
          { step: 'Content Analysis', status: 'pending', timestamp: new Date().toISOString() },
          { step: 'Schema Detection', status: 'pending', timestamp: new Date().toISOString() },
          { step: 'Extraction Testing', status: 'pending', timestamp: new Date().toISOString() },
          { step: 'Confidence Scoring', status: 'pending', timestamp: new Date().toISOString() },
          { step: 'Integration Setup', status: 'pending', timestamp: new Date().toISOString() }
        ],
        created_at: new Date().toISOString()
      };

      setJobs([newJob, ...jobs]);
      setNewUrl('');

      // Simulate progress
      simulateOnboardingProgress(newJob.id);
    } catch (error) {
      console.error('Failed to start onboarding:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const simulateOnboardingProgress = (jobId: string) => {
    const stepNames = [
      'URL Validation',
      'Content Analysis', 
      'Schema Detection',
      'Extraction Testing',
      'Confidence Scoring',
      'Integration Setup'
    ];

    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      setJobs(prevJobs => {
        return prevJobs.map(job => {
          if (job.id !== jobId) return job;

          const updatedSteps = [...job.steps];
          if (currentStep > 0) {
            updatedSteps[currentStep - 1] = {
              ...updatedSteps[currentStep - 1],
              status: 'completed'
            };
          }
          
          if (currentStep < stepNames.length) {
            updatedSteps[currentStep] = {
              ...updatedSteps[currentStep],
              status: 'running'
            };
          }

          const progress = Math.round(((currentStep + 1) / stepNames.length) * 100);
          const isCompleted = currentStep >= stepNames.length - 1;

          if (isCompleted) {
            clearInterval(progressInterval);
            updatedSteps[currentStep] = {
              ...updatedSteps[currentStep],
              status: 'completed'
            };

            return {
              ...job,
              status: 'completed',
              progress: 100,
              current_step: currentStep + 1,
              steps: updatedSteps,
              confidence: Math.floor(Math.random() * 13) + 85, // 85-97
              extraction_schema: {
                title_selector: 'h1, .title',
                content_selector: '.content, .post-content, article',
                date_selector: '.date, .timestamp, time',
                author_selector: '.author, .username',
                metadata_fields: ['likes', 'shares', 'comments']
              },
              completed_at: new Date().toISOString()
            };
          }

          return {
            ...job,
            progress,
            current_step: currentStep + 1,
            steps: updatedSteps
          };
        });
      });

      currentStep++;
    }, 1000); // Simulate 1 second delays
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Source Onboarding</h1>
            <p className="text-muted-foreground">Add new data sources for pharmacovigilance monitoring</p>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-2 w-full" />
                  <div className="space-y-2">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="flex items-center space-x-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Source Onboarding</h1>
          <p className="text-muted-foreground">Add new data sources for pharmacovigilance monitoring</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Onboard New Source</span>
          </CardTitle>
          <CardDescription>
            Enter a URL to automatically configure data extraction and monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="url" className="sr-only">Source URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/forum or https://reddit.com/r/health"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && startOnboarding()}
              />
            </div>
            <Button 
              onClick={startOnboarding}
              disabled={!newUrl.trim() || submitting}
            >
              {submitting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {submitting ? 'Starting...' : 'Start Onboarding'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span className="truncate max-w-md">{job.url}</span>
                  </CardTitle>
                  <CardDescription>
                    Started: {new Date(job.created_at).toLocaleString()}
                    {job.completed_at && (
                      <span> • Completed: {new Date(job.completed_at).toLocaleString()}</span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusBadgeVariant(job.status)}>
                    {getStatusIcon(job.status)}
                    <span className="ml-1">{job.status}</span>
                  </Badge>
                  {job.confidence && (
                    <Badge variant="outline">
                      {job.confidence}% confidence
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.status === 'running' && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="w-full" />
                </div>
              )}

              <div>
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Onboarding Steps</span>
                </h4>
                <div className="space-y-2">
                  {job.steps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-3 text-sm">
                      {getStatusIcon(step.status)}
                      <span className={step.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                        {step.step}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </span>
                      {step.status === 'running' && (
                        <Badge variant="secondary" className="text-xs">
                          Running...
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {job.extraction_schema && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <Code className="h-4 w-4" />
                    <span>Extraction Schema</span>
                  </h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(job.extraction_schema, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {job.status === 'completed' && (
                <div className="flex items-center space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Onboarding Completed Successfully
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Source is now ready for pharmacovigilance monitoring
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {jobs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No onboarding jobs</h3>
              <p>Start by entering a URL above to onboard a new data source.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
