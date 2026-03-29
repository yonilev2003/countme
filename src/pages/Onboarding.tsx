import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export default function Onboarding() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isProfileLoading, userProfile } = useAuth();

  useEffect(() => {
    if (isLoading || isProfileLoading) return;
    if (!isAuthenticated) {
      navigate('/');
    } else if (userProfile?.isRegistrationComplete) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, isProfileLoading, userProfile, navigate]);

  if (isLoading || isProfileLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <OnboardingFlow />;
}
