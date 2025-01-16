import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

function App() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();

  return (
    <div className="App">
      <header className="App-header">
        <h1>BASE Network USDC Staking Platform</h1>
        
        {isConnected ? (
          <div>
            <p>Connected Address: {address}</p>
            <button 
              onClick={() => disconnect()}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div>
            <p>Connect your wallet to start staking</p>
            <button
              onClick={() => open()}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: '#4444ff',
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Connect Wallet
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
