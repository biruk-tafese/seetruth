'use client';
import { useState, useEffect } from 'react';

export function useAnonymousGate(companyId: string) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const submissions = JSON.parse(localStorage.getItem('seetruth_submissions') || '{}');
    setHasSubmitted(!!submissions[companyId]);
    setIsChecking(false);
  }, [companyId]);

  const recordSubmission = () => {
    const submissions = JSON.parse(localStorage.getItem('seetruth_submissions') || '{}');
    submissions[companyId] = true;
    localStorage.setItem('seetruth_submissions', JSON.stringify(submissions));
    setHasSubmitted(true);
  };

  return { hasSubmitted, isChecking, recordSubmission };
}
