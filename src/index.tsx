// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import App from './App';
import './index.css';

// 環境変数の検証
if (!process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID) {
  throw new Error('WalletConnect Project ID is not defined in environment variables');
}

// WalletConnectの設定
const projectId = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID;

// Wagmi/Web3Modalの設定
const metadata = {
  name: 'BASE USDC Staking',
  description: 'Stake your USDC on BASE Network with institutional-grade security',
  url: 'https://baseusdc.com',
  icons: ['https://baseusdc.com/logo.png']
};

const chains = [base];
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,     // WalletConnectを有効化
  enableInjected: true,          // MetaMaskなどのインジェクトされたプロバイダーを有効化
  enableEIP6963: true,           // EIP-6963をサポート
  enableCoinbase: true,          // Coinbase Walletを有効化
});

// Web3Modalの初期化
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: 'light',
  themeVariables: {
    '--w3m-font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '--w3m-accent-color': '#2196F3',
    '--w3m-background-color': '#ffffff',
    '--w3m-text-medium-regular': '14px',
    '--w3m-border-radius-master': '8px',
  }
});

// グローバルスタイル
import './styles/globals.css';

// エラーバウンダリーコンポーネント
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We apologize for the inconvenience. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// アプリケーションのルートレンダリング
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <WagmiConfig config={wagmiConfig}>
        <App />
      </WagmiConfig>
    </ErrorBoundary>
  </React.StrictMode>
);
