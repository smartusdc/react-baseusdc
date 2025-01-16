// src/hooks/useStaking.ts
import { useCallback, useEffect, useState } from 'react';
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useContractConnection, useOptimalGasPrice } from './useWeb3';
import { STAKING_ABI, USDC_ABI } from '../constants/abis';
import { CONTRACT_ADDRESS, USDC_ADDRESS, StakingStats, UI_MESSAGES } from '../constants';
import { validateAmount, validateStakingPrerequisites } from '../utils/validation';
import { handleTransactionError, logError } from '../utils/errors';

export const useStakingOperations = () => {
  const { isContractReady, userAddress } = useContractConnection();
  const { gasPrice } = useOptimalGasPrice();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // コントラクトの準備
  const { config: stakeConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'depositFunds',
    enabled: isContractReady
  });

  const { config: withdrawConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'withdraw',
    enabled: isContractReady
  });

  const { config: claimConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'claimDepositReward',
    enabled: isContractReady
  });

  const { writeAsync: stake } = useContractWrite(stakeConfig);
  const { writeAsync: withdraw } = useContractWrite(withdrawConfig);
  const { writeAsync: claimRewards } = useContractWrite(claimConfig);

  // USDC承認の処理
  const handleApproval = useCallback(async (amount: string) => {
    try {
      const amountInWei = parseUnits(amount, 6);
      const approve = await useContractWrite({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS, amountInWei]
      });

      const tx = await approve.writeAsync?.();
      await tx?.wait();
      
      return true;
    } catch (error) {
      throw new Error('Failed to approve USDC: ' + error.message);
    }
  }, []);

  // ステーキング処理
  const handleStake = useCallback(async (amount: string, referralCode: string = '0') => {
    if (!isContractReady || !stake) return;

    try {
      setIsProcessing(true);
      setError(null);

      // 承認状態の確認
      const allowance = await useContractRead({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'allowance',
        args: [userAddress, CONTRACT_ADDRESS]
      });

      if (parseUnits(amount, 6) > allowance.data) {
        await handleApproval(amount);
      }

      const tx = await stake({
        args: [parseUnits(amount, 6), BigInt(referralCode)],
        gasPrice
      });

      const receipt = await tx.wait();
      return true;

    } catch (error) {
      const errorMessage = handleTransactionError(error, 'stake');
      setError(errorMessage);
      logError(error, 'stake', { amount, referralCode });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isContractReady, stake, gasPrice, userAddress, handleApproval]);

  // 引き出し処理
  const handleWithdraw = useCallback(async (amount: string) => {
    if (!isContractReady || !withdraw) return;

    try {
      setIsProcessing(true);
      setError(null);

      const tx = await withdraw({
        args: [parseUnits(amount, 6)],
        gasPrice
      });

      await tx.wait();
      return true;

    } catch (error) {
      const errorMessage = handleTransactionError(error, 'withdraw');
      setError(errorMessage);
      logError(error, 'withdraw', { amount });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isContractReady, withdraw, gasPrice]);

  // 報酬請求処理
  const handleClaimRewards = useCallback(async () => {
    if (!isContractReady || !claimRewards) return;

    try {
      setIsProcessing(true);
      setError(null);

      const tx = await claimRewards({
        gasPrice
      });

      await tx.wait();
      return true;

    } catch (error) {
      const errorMessage = handleTransactionError(error, 'claim-rewards');
      setError(errorMessage);
      logError(error, 'claim-rewards');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isContractReady, claimRewards, gasPrice]);

  return {
    handleStake,
    handleWithdraw,
    handleClaimRewards,
    isProcessing,
    error
  };
};

// ステーキング情報の取得
export const useStakingInfo = () => {
  const { isContractReady, userAddress } = useContractConnection();
  const [stakingStats, setStakingStats] = useState<StakingStats>({
    depositAmount: '0',
    pendingRewards: '0',
    referralRewards: '0',
    totalReferrals: 0,
    hasReferrer: false,
    referralCode: '0'
  });

  const { data: userInfo, refetch: refetchUserInfo } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getUserInfo',
    args: [userAddress],
    enabled: Boolean(userAddress) && isContractReady,
    watch: true
  });

  useEffect(() => {
    if (userInfo) {
      setStakingStats({
        depositAmount: formatUnits(userInfo[0], 6),
        pendingRewards: formatUnits(userInfo[1], 6),
        referralRewards: formatUnits(userInfo[2], 6),
        totalReferrals: Number(userInfo[3]),
        hasReferrer: userInfo[4],
        referralCode: userInfo[5]?.toString() || '0'
      });
    }
  }, [userInfo]);

  return {
    stakingStats,
    refetchUserInfo,
    isContractReady
  };
};

// USDC残高管理
export const useUSDCBalance = () => {
  const { isContractReady, userAddress } = useContractConnection();
  const [balance, setBalance] = useState('0');
  const [allowance, setAllowance] = useState('0');

  const { data: usdcBalance, refetch: refetchBalance } = useContractRead({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
    enabled: Boolean(userAddress) && isContractReady,
    watch: true
  });

  const { data: usdcAllowance, refetch: refetchAllowance } = useContractRead({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [userAddress, CONTRACT_ADDRESS],
    enabled: Boolean(userAddress) && isContractReady,
    watch: true
  });

  useEffect(() => {
    if (usdcBalance !== undefined) {
      setBalance(formatUnits(usdcBalance, 6));
    }
    if (usdcAllowance !== undefined) {
      setAllowance(formatUnits(usdcAllowance, 6));
    }
  }, [usdcBalance, usdcAllowance]);

  return {
    balance,
    allowance,
    refetchBalance,
    refetchAllowance
  };
};
