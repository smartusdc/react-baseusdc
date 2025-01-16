import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiConfig } from 'wagmi';
import { arbitrum, mainnet } from 'wagmi/chains';

// Web3Modalの設定
const projectId = 'YOUR_WALLET_CONNECT_PROJECT_ID'; // WalletConnectのプロジェクトIDを設定

const metadata = {
  name: 'BASE USDC Staking',
  description: 'BASE Network USDC Staking Platform',
  url: 'https://baseusdc.com', 
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [mainnet, arbitrum];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({ wagmiConfig, projectId, chains });

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <App />
    </WagmiConfig>
  </React.StrictMode>
);

reportWebVitals();