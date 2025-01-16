import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { WagmiConfig } from 'wagmi';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { arbitrum, mainnet } from 'wagmi/chains';

const projectId = 'test-project-id';
const metadata = {
  name: 'Test App',
  description: 'Test Description',
  url: 'https://test.com',
  icons: ['https://test.com/icon.png']
};

const chains = [mainnet, arbitrum];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

test('renders platform title', () => {
  render(
    <WagmiConfig config={wagmiConfig}>
      <App />
    </WagmiConfig>
  );
  const titleElement = screen.getByText(/BASE Network USDC Staking Platform/i);
  expect(titleElement).toBeInTheDocument();
});
