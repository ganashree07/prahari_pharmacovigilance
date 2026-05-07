import re
from typing import Dict, List, Optional

class NLPipeline:
    def __init__(self):
        # Indian pharmacopeia drug dictionary
        self.drug_dict = {
            'metformin', 'paracetamol', 'azithromycin', 'atorvastatin', 'ibuprofen',
            'amoxicillin', 'glipizide', 'insulin', 'nimesulide', 'aspirin',
            'omeprazole', 'cetirizine', 'pantoprazole', 'amlodipine', 'losartan',
            'atenolol', 'ciprofloxacin', 'doxycycline', 'ranitidine', 'montelukast'
        }
        
        # Common symptom keywords
        self.symptom_keywords = {
            'nausea', 'headache', 'rash', 'allergy', 'palpitations', 'chest pain',
            'memory loss', 'confusion', 'dizziness', 'fatigue', 'weakness',
            'skin rash', 'hives', 'swelling', 'breathing difficulty', 'wheezing',
            'stomach pain', 'diarrhea', 'constipation', 'vomiting', 'fever',
            'joint pain', 'muscle pain', 'back pain', 'insomnia', 'anxiety',
            'depression', 'mood changes', 'weight gain', 'weight loss',
            'hair loss', 'vision changes', 'hearing loss', 'tinnitus',
            'toxic epidermal necrolysis', 'stevens johnson syndrome'
        }
        
        # Known drug-symptom pairs
        self.known_pairs = {
            ('paracetamol', 'nausea'): 'KNOWN',
            ('paracetamol', 'headache'): 'KNOWN',
            ('ibuprofen', 'headache'): 'KNOWN',
            ('ibuprofen', 'stomach pain'): 'KNOWN',
            ('aspirin', 'stomach pain'): 'KNOWN',
            ('aspirin', 'bleeding'): 'KNOWN',
            ('omeprazole', 'headache'): 'KNOWN',
            ('cetirizine', 'drowsiness'): 'KNOWN',
            ('amoxicillin', 'rash'): 'KNOWN',
            ('ciprofloxacin', 'tendon rupture'): 'KNOWN',
            ('atorvastatin', 'muscle pain'): 'KNOWN',
            ('amlodipine', 'swelling'): 'KNOWN',
            ('losartan', 'dizziness'): 'KNOWN',
            ('atenolol', 'fatigue'): 'KNOWN',
            ('metformin', 'diarrhea'): 'KNOWN',
            ('insulin', 'hypoglycemia'): 'KNOWN',
            ('glipizide', 'hypoglycemia'): 'KNOWN'
        }

    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """
        Extract drugs and symptoms from text using keyword matching.
        Returns a dictionary with drugs, symptoms, and confidence score.
        """
        # Convert to lowercase for matching
        text_lower = text.lower()
        
        # Extract drugs
        found_drugs = []
        for drug in self.drug_dict:
            if drug.lower() in text_lower:
                found_drugs.append(drug)
        
        # Extract symptoms
        found_symptoms = []
        for symptom in self.symptom_keywords:
            if symptom.lower() in text_lower:
                found_symptoms.append(symptom)
        
        # Calculate confidence based on entity density and text quality
        entity_count = len(found_drugs) + len(found_symptoms)
        word_count = len(text.split())
        
        if entity_count == 0:
            confidence = 0.0
        elif word_count < 10:
            confidence = min(0.3 + (entity_count * 0.1), 0.8)
        else:
            confidence = min(0.5 + (entity_count * 0.15), 0.95)
        
        return {
            'drugs': found_drugs,
            'symptoms': found_symptoms,
            'confidence': round(confidence, 2)
        }

    def classify_signal(self, drug: str, symptom: str) -> Dict[str, str]:
        """
        Classify a drug-symptom pair as KNOWN, NOVEL, or UNRELATED.
        Returns category and reasoning.
        """
        # Check if it's a known pair
        pair = (drug.lower(), symptom.lower())
        reverse_pair = (symptom.lower(), drug.lower())
        
        if pair in self.known_pairs or reverse_pair in self.known_pairs:
            return {
                'category': 'KNOWN',
                'reasoning': f'Known adverse reaction: {drug} -> {symptom}. Documented in pharmacovigilance databases.'
            }
        
        # Check if drug and symptom are in our dictionaries
        drug_known = drug.lower() in [d.lower() for d in self.drug_dict]
        symptom_known = symptom.lower() in [s.lower() for s in self.symptom_keywords]
        
        if drug_known and symptom_known:
            return {
                'category': 'NOVEL',
                'reasoning': f'Potential novel adverse reaction: {drug} -> {symptom}. Not found in reference databases but both entities are recognized.'
            }
        elif drug_known and not symptom_known:
            return {
                'category': 'UNRELATED',
                'reasoning': f'Unrelated: {drug} is recognized but "{symptom}" is not a typical adverse drug reaction symptom.'
            }
        elif not drug_known and symptom_known:
            return {
                'category': 'UNRELATED',
                'reasoning': f'Unrelated: {symptom} is recognized but "{drug}" is not in the monitored drug list.'
            }
        else:
            return {
                'category': 'UNRELATED',
                'reasoning': f'Unrelated: Neither "{drug}" nor "{symptom}" are in the monitored lists.'
            }

    def pii_redact(self, text: str) -> str:
        """
        Redact personally identifiable information from text.
        Handles Aadhaar, PAN, phone numbers, and email addresses.
        """
        # Aadhaar pattern: XXXX-XXXX-XXXX or XXXXXXXXXXX
        aadhaar_pattern = r'\b\d{4}-\d{4}-\d{4}\b|\b\d{12}\b'
        text = re.sub(aadhaar_pattern, '[AADHAAR-REDACTED]', text)
        
        # PAN pattern: 5 letters + 4 digits + 1 letter
        pan_pattern = r'\b[A-Z]{5}\d{4}[A-Z]{1}\b'
        text = re.sub(pan_pattern, '[PAN-REDACTED]', text)
        
        # Phone number pattern: 10-digit numbers
        phone_pattern = r'\b\d{10}\b'
        text = re.sub(phone_pattern, '[PHONE-REDACTED]', text)
        
        # Email pattern
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        text = re.sub(email_pattern, '[EMAIL-REDACTED]', text)
        
        return text

    def process_text(self, text: str) -> Dict:
        """
        Complete text processing pipeline.
        Extracts entities, classifies signals, and redacts PII.
        """
        # Redact PII first
        redacted_text = self.pii_redact(text)
        
        # Extract entities
        entities = self.extract_entities(redacted_text)
        
        # Classify signals for each drug-symptom pair
        classifications = []
        for drug in entities['drugs']:
            for symptom in entities['symptoms']:
                classification = self.classify_signal(drug, symptom)
                classifications.append({
                    'drug': drug,
                    'symptom': symptom,
                    **classification
                })
        
        return {
            'original_text': text,
            'redacted_text': redacted_text,
            'entities': entities,
            'classifications': classifications
        }
