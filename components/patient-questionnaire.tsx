'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Shield, Award, ArrowRight, X } from 'lucide-react';

const SYMPTOM_TRANSLATIONS: Record<string, string> = {
  'Toxic epidermal necrolysis': 'severe skin peeling and blistering',
  'Nausea': 'feeling like you want to vomit',
  'Palpitations': 'heart beating fast or irregularly',
  'Headache': 'pain in your head',
  'Memory loss': 'forgetting things more than usual'
};

interface PatientQuestionnaireProps {
  drugName: string;
  symptomName: string;
  onClose: () => void;
  onSubmit: () => void;
}

export function PatientQuestionnaire({ drugName, symptomName, onClose, onSubmit, signalId }: PatientQuestionnaireProps & { signalId: string }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState({
    takingDrug: '',
    experiencedSymptom: '',
    timeToOnset: '',
    reasonForPrescription: ''
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`http://localhost:8000/api/signals/${signalId}/user-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit verification');
      }
      
      setSubmitted(true);
      // Success message is shown in the UI
      setTimeout(() => {
        onSubmit();
      }, 3000);
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('Failed to record your response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <Card className="w-full max-w-md animate-in zoom-in duration-500 overflow-hidden">
          <div className="h-2 bg-primary animate-progress-grow" />
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Submission Received!</h2>
              <p className="text-muted-foreground text-sm">
                Thank you. Your response has been recorded and contributes to a national pharmacovigilance alert.
              </p>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-2xl border border-primary/10 space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Your Impact</p>
              <div className="flex items-center justify-center space-x-3">
                <Badge className="px-4 py-2 text-lg bg-primary text-primary-foreground flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Contribution Score: +50</span>
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">
                You are in the top 15% of contributors this month.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg shadow-2xl border-primary/20 animate-in slide-in-from-bottom-8 duration-500">
        <CardHeader className="relative border-b pb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 rounded-full"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">User Safety Verification</span>
          </div>
          <CardTitle className="text-xl">Help us validate this signal</CardTitle>
          <CardDescription>
            Your input directly helps national health authorities monitor drug safety.
          </CardDescription>
          
          <div className="flex space-x-1 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-primary' : 'bg-muted'}`} 
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-8 pb-8 min-h-[250px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Label className="text-lg font-semibold leading-tight">Q1: Were you taking <span className="text-primary">{drugName}</span> when the symptoms occurred?</Label>
              <RadioGroup 
                onValueChange={(v) => setAnswers({...answers, takingDrug: v})} 
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors">
                  <RadioGroupItem value="yes" id="q1y" />
                  <Label htmlFor="q1y" className="flex-1 cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors">
                  <RadioGroupItem value="no" id="q1n" />
                  <Label htmlFor="q1n" className="flex-1 cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Label className="text-lg font-semibold leading-tight">
                Q2: Did you experience <span className="text-destructive font-bold">{symptomName}</span>
                {SYMPTOM_TRANSLATIONS[symptomName] && (
                  <span className="text-slate-400 font-normal ml-1">({SYMPTOM_TRANSLATIONS[symptomName]})</span>
                )}
                ?
              </Label>
              <RadioGroup 
                onValueChange={(v) => setAnswers({...answers, experiencedSymptom: v})} 
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors">
                  <RadioGroupItem value="yes" id="q2y" />
                  <Label htmlFor="q2y" className="flex-1 cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors">
                  <RadioGroupItem value="no" id="q2n" />
                  <Label htmlFor="q2n" className="flex-1 cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Label className="text-lg font-semibold leading-tight">Q3: How long after starting medication did symptoms appear?</Label>
              <Select onValueChange={(v) => setAnswers({...answers, timeToOnset: v})}>
                <SelectTrigger className="h-14 text-base">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Within 24 hours</SelectItem>
                  <SelectItem value="2-7d">2-7 days</SelectItem>
                  <SelectItem value="1-2w">1-2 weeks</SelectItem>
                  <SelectItem value="longer">Longer than 2 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Label className="text-lg font-semibold leading-tight">Q4: Why were you prescribed this medicine?</Label>
              <Select onValueChange={(v) => setAnswers({...answers, reasonForPrescription: v})}>
                <SelectTrigger className="h-14 text-base">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diabetes">Diabetes management</SelectItem>
                  <SelectItem value="infection">Infection</SelectItem>
                  <SelectItem value="pain">Pain relief</SelectItem>
                  <SelectItem value="cardiac">Cardiac condition</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t pt-6 bg-muted/20">
          <Button 
            className="w-full h-12 text-lg font-bold group" 
            onClick={handleNext}
            disabled={
              isSubmitting ||
              (step === 1 && !answers.takingDrug) ||
              (step === 2 && !answers.experiencedSymptom) ||
              (step === 3 && !answers.timeToOnset) ||
              (step === 4 && !answers.reasonForPrescription)
            }
          >
            {isSubmitting ? 'Submitting...' : step < 4 ? (
              <>
                <span>Next Question</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            ) : (
              <span>Submit Assessment</span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
