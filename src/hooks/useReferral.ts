// src/hooks/useReferral.ts
import { useCallback, useEffect, useState } from 'react';
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { useContractConnection } from './useWeb3';
import { CONTRACT_ADDRESS, STAKING_ABI, UI_MESSAGES } from '../constants';
import { validateReferralCode } from '../utils/validation';
import { handleTransactionError, logError } from '../utils/errors';

interface ReferralState {
  isProcessing: boolean;
  error: string | null;
  referralCode: string;
  hasReferrer: boolean;
  totalReferrals: number;
  referralRewards: string;
}

export const useReferralSystem = () => {
  const { isContractReady, userAddress } = useContractConnection();
  const [state, setState] = useState<ReferralState>({
    isProcessing: false,
    error: null,
    referralCode: '0',
    hasReferrer: false,
    totalReferrals: 0,
    referralRewards: '0'
  });

  // コントラクト操作の準備
  const { config: generateConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'generateReferralCode',
    enabled: isContractReady
  });

  const { config: applyConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'processReferral',
    enabled: isContractReady
  });

  const { config: claimConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'claimReferralReward',
    enabled: isContractReady
  });

  const { writeAsync: generateCode } = useContractWrite(generateConfig);
  const { writeAsync: applyCode } = useContractWrite(applyConfig);
  const { writeAsync: claimRewards } = useContractWrite(claimConfig);

  // リファラル情報の取得
  const { data: referralInfo, refetch: refetchReferralInfo } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getUserInfo',
    args: [userAddress],
    enabled: Boolean(userAddress) && isContractReady,
    watch: true
  });

  // リファラルコードの生成
  const handleGenerateCode = useCallback(async () => {
    if (!isContractReady || !generateCode) return;

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      const tx = await generateCode();
      const receipt = await tx.wait();

      // イベントからリファラルコードを取得
      const event = receipt.logs.find(
        log => log.topics[0] === 'ReferralCodeCreated(address,uint256)'
      );

      if (event) {
        const referralCode = event.topics[2];
        setState(prev => ({ ...prev, referralCode }));
        await refetchReferralInfo();
      }

      return true;
    } catch (error) {
      const errorMessage = handleTransactionError(error, 'generate-referral');
      setState(prev => ({ ...prev, error: errorMessage }));
      logError(error, 'generate-referral');
      return false;
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [isContractReady, generateCode, refetchReferralInfo]);

  // リファラルコードの適用
  const handleApplyCode = useCallback(async (code: string) => {
    if (!isContractReady || !applyCode) return;

    try {
      // 入力値の検証
      const validationError = validateReferralCode(code);
      if (validationError) {
        throw new Error(validationError);
      }

      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      const tx = await applyCode({
        args: [BigInt(code)]
      });

      await tx.wait();
      await refetchReferralInfo();
      return true;
    } catch (error) {
      const errorMessage = handleTransactionError(error, 'apply-referral');
      setState(prev => ({ ...prev, error: errorMessage }));
      logError(error, 'apply-referral', { code });
      return false;
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [isContractReady, applyCode, refetchReferralInfo]);

  // リファラル報酬の請求
  const handleClaimReferralRewards = useCallback(async () => {
    if (!isContractReady || !claimRewards) return;

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      const tx = await claimRewards();
      await tx.wait();
      await refetchReferralInfo();

      return true;
    } catch (error) {
      const errorMessage = handleTransactionError(error, 'claim-referral-rewards');
      setState(prev => ({ ...prev, error: errorMessage }));
      logError(error, 'claim-referral-rewards');
      return false;
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [isContractReady, claimRewards, refetchReferralInfo]);

  // リファラル情報の更新
  useEffect(() => {
    if (referralInfo) {
      setState(prev => ({
        ...prev,
        hasReferrer: referralInfo[4],
        totalReferrals: Number(referralInfo[3]),
        referralRewards: referralInfo[2].toString()
      }));
    }
  }, [referralInfo]);

  return {
    ...state,
    handleGenerateCode,
    handleApplyCode,
    handleClaimReferralRewards,
    refetchReferralInfo
  };
};

// リファラルイベントの監視
export const useReferralEvents = () => {
  const { isContractReady } = useContractConnection();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!isContractReady) return;

    const contract = new Contract(CONTRACT_ADDRESS, STAKING_ABI);
    
    const referralFilter = contract.filters.ReferralProcessed();
    const codeFilter = contract.filters.ReferralCodeCreated();

    const handleNewEvent = (event: any) => {
      setEvents(prev => [...prev, event]);
    };

    contract.on(referralFilter, handleNewEvent);
    contract.on(codeFilter, handleNewEvent);

    return () => {
      contract.off(referralFilter, handleNewEvent);
      contract.off(codeFilter, handleNewEvent);
    };
  }, [isContractReady]);

  return events;
};
