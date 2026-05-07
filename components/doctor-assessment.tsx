'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Stethoscope, AlertTriangle, CheckCircle2, Send, ShieldCheck, TrendingUp } from 'lucide-react';

interface DoctorAssessmentProps {
  drugName: string;
  symptomName: string;
  signalId: string;
  onSubmit: () => void;
}

export function DoctorAssessment({ drugName, symptomName, signalId, onSubmit }: DoctorAssessmentProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState({
    plausibility: '',
    similarCases: '',
    causality: '',
    recommendation: ''
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Step 1: Record clinical validation
      const validateResponse = await fetch(`http://localhost:8000/api/signals/${signalId}/doctor-validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          answers,
          recommendation: answers.recommendation 
        })
      });
      
      if (!validateResponse.ok) {
        throw new Error('Failed to submit clinical validation');
      }
      
      // Step 2: If escalated, also call submit endpoint (handled by backend in doctor-validate, but double check prompt)
      // Prompt says: "Then call POST /api/signals/{id}/submit"
      if (answers.recommendation === 'escalate') {
        const submitResponse = await fetch(`http://localhost:8000/api/signals/${signalId}/submit`, {
          method: 'POST'
        });
        if (!submitResponse.ok) {
          console.warn('Escalation failed, but validation was recorded');
        }
      }
      
      setSubmitted(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        onSubmit();
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to record clinical assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-500/50 bg-green-500/5 overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="h-1.5 bg-green-500 w-full" />
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
              <ShieldCheck className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-green-700">Assessment Submitted</h3>
            <p className="text-sm text-green-600/80">Clinical data has been synchronized with the PvPI database.</p>
          </div>
          
          <div className="inline-flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-in slide-in-from-bottom-4 delay-300 fill-mode-both">
            <TrendingUp className="w-4 h-4" />
            <span>+2 CME Credits Earned</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 shadow-xl bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-muted/30 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Medical Reviewer Toolkit</span>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary">NMC 2020 Compliant</Badge>
        </div>
        <CardTitle className="text-2xl mt-4">Clinical Validation</CardTitle>
        <CardDescription>
          Provide expert assessment for <span className="font-bold text-foreground">{drugName}</span> and <span className="font-bold text-destructive">{symptomName}</span>.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* Q1 */}
        <div className="space-y-3">
          <Label className="text-sm font-bold flex items-center space-x-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-[10px] text-primary-foreground">1</span>
            <span>Is this drug-symptom combination clinically plausible?</span>
          </Label>
          <RadioGroup 
            onValueChange={(v) => setAnswers({...answers, plausibility: v})} 
            className="flex flex-wrap gap-3"
          >
            <div className={`flex items-center space-x-2 border rounded-lg px-3 py-2 cursor-pointer transition-all ${answers.plausibility === 'yes' ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}>
              <RadioGroupItem value="yes" id="p1y" />
              <Label htmlFor="p1y" className="text-xs font-medium cursor-pointer">Yes</Label>
            </div>
            <div className={`flex items-center space-x-2 border rounded-lg px-3 py-2 cursor-pointer transition-all ${answers.plausibility === 'no' ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}>
              <RadioGroupItem value="no" id="p1n" />
              <Label htmlFor="p1n" className="text-xs font-medium cursor-pointer">No</Label>
            </div>
            <div className={`flex items-center space-x-2 border rounded-lg px-3 py-2 cursor-pointer transition-all ${answers.plausibility === 'investigate' ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}>
              <RadioGroupItem value="investigate" id="p1i" />
              <Label htmlFor="p1i" className="text-xs font-medium cursor-pointer">Needs investigation</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Q2 */}
        <div className="space-y-3">
          <Label className="text-sm font-bold flex items-center space-x-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-[10px] text-primary-foreground">2</span>
            <span>Have you observed similar cases in your practice?</span>
          </Label>
          <Select onValueChange={(v) => setAnswers({...answers, similarCases: v})}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select observation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple">Yes - Multiple cases</SelectItem>
              <SelectItem value="one">Yes - One case</SelectItem>
              <SelectItem value="no">No cases observed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Q3 */}
        <div className="space-y-3">
          <Label className="text-sm font-bold flex items-center space-x-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-[10px] text-primary-foreground">3</span>
            <span>Causality Assessment (WHO-UMC Criteria)</span>
          </Label>
          <Select onValueChange={(v) => setAnswers({...answers, causality: v})}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select causality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="certain">Certain</SelectItem>
              <SelectItem value="probable">Probable</SelectItem>
              <SelectItem value="possible">Possible</SelectItem>
              <SelectItem value="unlikely">Unlikely</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Q4 */}
        <div className="space-y-3">
          <Label className="text-sm font-bold flex items-center space-x-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-[10px] text-primary-foreground">4</span>
            <span>Final Recommendation</span>
          </Label>
          <RadioGroup 
            onValueChange={(v) => setAnswers({...answers, recommendation: v})} 
            className="space-y-2"
          >
            <div className={`flex items-center space-x-2 border rounded-lg px-4 py-3 cursor-pointer transition-all ${answers.recommendation === 'escalate' ? 'bg-destructive/10 border-destructive ring-1 ring-destructive' : 'hover:bg-muted'}`}>
              <RadioGroupItem value="escalate" id="r1" />
              <div className="flex-1 flex items-center justify-between">
                <Label htmlFor="r1" className="text-sm font-bold cursor-pointer text-destructive">Escalate to CDSCO</Label>
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
            </div>
            <div className={`flex items-center space-x-2 border rounded-lg px-4 py-3 cursor-pointer transition-all ${answers.recommendation === 'monitor' ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}>
              <RadioGroupItem value="monitor" id="r2" />
              <Label htmlFor="r2" className="text-sm font-medium cursor-pointer">Continue Monitoring</Label>
            </div>
            <div className={`flex items-center space-x-2 border rounded-lg px-4 py-3 cursor-pointer transition-all ${answers.recommendation === 'none' ? 'bg-muted border-border' : 'hover:bg-muted'}`}>
              <RadioGroupItem value="none" id="r3" />
              <Label htmlFor="r3" className="text-sm font-medium cursor-pointer text-muted-foreground">No action needed</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/30 border-t pt-6">
        <Button 
          className="w-full h-12 text-lg font-bold shadow-lg"
          disabled={!answers.plausibility || !answers.similarCases || !answers.causality || !answers.recommendation}
          onClick={handleSubmit}
        >
          <Send className="w-5 h-5 mr-2" />
          Submit Clinical Review
        </Button>
      </CardFooter>
    </Card>
  );
}
