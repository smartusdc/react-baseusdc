// src/App.tsx
import React from 'react';
import { Layout } from './components/layout/Layout';
import { NetworkStatus } from './components/layout/NetworkStatus';
import StakingDashboard from './components/StakingDashboard';
import { useWeb3Connection } from './hooks/useWeb3';
import LandingPage from './components/LandingPage';

function App() {
  const { isConnected, isCorrectNetwork } = useWeb3Connection();

  return (
    <Layout>
      <NetworkStatus />
      
      {isConnected && isCorrectNetwork ? (
        <StakingDashboard />
      ) : (
        <LandingPage />
      )}
    </Layout>
  );
}

export default App;

// src/components/LandingPage.tsx
import React from 'react';
import { useWeb3Connection } from '../hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function LandingPage() {
  const { connectWallet, isConnecting } = useWeb3Connection();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-8">
          The Future of Finance on BASE Network
        </h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
          Join the next evolution in digital finance. Stake your USDC and earn rewards 
          with institutional-grade security on Coinbase's revolutionary BASE Network.
        </p>
        
        <Button 
          size="lg"
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-8 py-4 text-lg"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Connecting Wallet...
            </>
          ) : (
            'Start Staking Now'
          )}
        </Button>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Security First
            </h3>
            <p className="text-gray-500">
              Built on Coinbase's BASE Network with institutional-grade security 
              and fully audited smart contracts.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              High Yields
            </h3>
            <p className="text-gray-500">
              Earn competitive APR on your USDC with additional referral rewards 
              and future governance token benefits.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Easy to Start
            </h3>
            <p className="text-gray-500">
              Begin with just $1 USDC. User-friendly interface with instant 
              reward tracking and no lock-up periods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
