
import React from 'react';
import { Button } from '@/components/ui/button';

export default function Onboarding() {
  return (
    <div className="onboarding">
      <h1>Welcome to Payoova</h1>
      <p>Let's get you started with your new Web3 wallet.</p>
      <Button onClick={() => console.log('Start Onboarding')}>Get Started</Button>
    </div>
  );
}