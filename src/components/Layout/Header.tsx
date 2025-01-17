// src/components/layout/Header.tsx
import React from 'react';
import { useWeb3Connection } from '../../hooks/useWeb3';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function Header() {
  const { isConnected, isConnecting, address, connectWallet, isCorrectNetwork } = useWeb3Connection();

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              BASE Network USDC Staking
            </h1>
            {isConnected && isCorrectNetwork && (
              <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                BASE Network
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 hidden sm:block">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                {!isCorrectNetwork ? (
                  <Button variant="destructive" size="sm">
                    Wrong Network
                  </Button>
                ) : (
                  <Button variant="outline" onClick={connectWallet}>
                    Disconnect
                  </Button>
                )}
              </div>
            ) : (
              <Button onClick={connectWallet} disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Wallet'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// src/components/layout/Footer.tsx
import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            Make sure you are connected to BASE Network to use this platform
          </p>
          <p className="text-xs text-gray-400">
            Contract Address: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}
          </p>
          <a
            href="mailto:support@baseusdc.com"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Contact Support: support@baseusdc.com
          </a>
        </div>
      </div>
    </footer>
  );
}

// src/components/layout/Layout.tsx
import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

// src/components/layout/NetworkStatus.tsx
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useWeb3Connection } from '../../hooks/useWeb3';

export function NetworkStatus() {
  const { isConnected, isCorrectNetwork, chainName, handleNetworkSwitch, isSwitchingNetwork } = useWeb3Connection();

  if (!isConnected || isCorrectNetwork) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <Alert variant="destructive">
        <AlertTitle>Wrong Network</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>Please switch to {chainName} to continue</span>
          <Button 
            variant="outline" 
            onClick={handleNetworkSwitch}
            disabled={isSwitchingNetwork}
          >
            {isSwitchingNetwork ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Switching...
              </>
            ) : (
              'Switch Network'
            )}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
