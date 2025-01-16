// src/hooks/useWeb3.ts
import { useEffect, useState, useCallback } from 'react';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { base } from 'wagmi/chains';
import { UI_MESSAGES, BASE_CHAIN_ID } from '../constants';
import { handleTransactionError } from '../utils/errors';

interface Web3State {
  isConnected: boolean;
  isConnecting: boolean;
  isSwitchingNetwork: boolean;
  isCorrectNetwork: boolean;
  address: string | undefined;
  error: string | null;
}

export const useWeb3Connection = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork, isLoading: isSwitchingNetwork } = useSwitchNetwork();
  const { open } = useWeb3Modal();
  
  const [state, setState] = useState<Web3State>({
    isConnected: false,
    isConnecting: false,
    isSwitchingNetwork: false,
    isCorrectNetwork: false,
    address: undefined,
    error: null
  });

  // ネットワークの切り替え処理
  const handleNetworkSwitch = useCallback(async () => {
    try {
      if (chain?.id !== BASE_CHAIN_ID) {
        await switchNetwork?.(BASE_CHAIN_ID);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: handleTransactionError(error, 'network-switch')
      }));
    }
  }, [chain?.id, switchNetwork]);

  // ウォレット接続処理
  const connectWallet = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));
      await open();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: handleTransactionError(error, 'wallet-connect')
      }));
    } finally {
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  }, [open]);

  // ネットワーク状態の監視
  useEffect(() => {
    const isCorrectNetwork = chain?.id === BASE_CHAIN_ID;
    setState(prev => ({
      ...prev,
      isConnected,
      isCorrectNetwork,
      address,
      isSwitchingNetwork,
      error: !isCorrectNetwork && isConnected ? UI_MESSAGES.WALLET.WRONG_NETWORK : null
    }));

    if (isConnected && !isCorrectNetwork) {
      handleNetworkSwitch();
    }
  }, [isConnected, chain?.id, address, isSwitchingNetwork, handleNetworkSwitch]);

  // 接続状態のクリーンアップ
  useEffect(() => {
    return () => {
      setState({
        isConnected: false,
        isConnecting: false,
        isSwitchingNetwork: false,
        isCorrectNetwork: false,
        address: undefined,
        error: null
      });
    };
  }, []);

  return {
    ...state,
    connectWallet,
    handleNetworkSwitch,
    BASE_CHAIN_ID,
    chainName: base.name
  };
};

// コントラクト接続状態の管理
export const useContractConnection = () => {
  const { isConnected, address, isCorrectNetwork } = useWeb3Connection();
  const [isContractReady, setIsContractReady] = useState(false);

  useEffect(() => {
    setIsContractReady(isConnected && isCorrectNetwork && Boolean(address));
  }, [isConnected, isCorrectNetwork, address]);

  return {
    isContractReady,
    userAddress: address,
    isConnected,
    isCorrectNetwork
  };
};

// イベント監視のためのフック
export const useContractEvents = (
  contract: any,
  eventName: string,
  callback: (event: any) => void
) => {
  const { isContractReady } = useContractConnection();

  useEffect(() => {
    if (!isContractReady || !contract) return;

    const unsubscribe = contract.on(eventName, callback);
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isContractReady, contract, eventName, callback]);
};

// ガス価格の最適化
export const useOptimalGasPrice = () => {
  const [gasPrice, setGasPrice] = useState<bigint | null>(null);

  const updateGasPrice = useCallback(async () => {
    try {
      const provider = new providers.JsonRpcProvider('https://mainnet.base.org');
      const currentGasPrice = await provider.getGasPrice();
      
      // BASE Networkでは85%のバッファーを追加
      setGasPrice(currentGasPrice * BigInt(185) / BigInt(100));
    } catch (error) {
      console.error('Error fetching gas price:', error);
      setGasPrice(null);
    }
  }, []);

  useEffect(() => {
    updateGasPrice();
    const interval = setInterval(updateGasPrice, 30000); // 30秒ごとに更新

    return () => clearInterval(interval);
  }, [updateGasPrice]);

  return { gasPrice, updateGasPrice };
};
