// src/utils/validation.ts
import { MIN_STAKE_AMOUNT, UI_MESSAGES } from '../constants';
import { parseUnits, formatUnits } from 'viem';

// トランザクション入力の検証
export const validateAmount = (
  amount: string,
  maxAmount: string,
  minAmount: number = MIN_STAKE_AMOUNT
): string | null => {
  if (!amount || amount.trim() === '') {
    return UI_MESSAGES.ERRORS.INVALID_AMOUNT;
  }

  const numAmount = Number(amount);
  const numMaxAmount = Number(maxAmount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return UI_MESSAGES.ERRORS.INVALID_AMOUNT;
  }

  if (numAmount < minAmount) {
    return UI_MESSAGES.ERRORS.MINIMUM_AMOUNT;
  }

  if (numAmount > numMaxAmount) {
    return UI_MESSAGES.ERRORS.INSUFFICIENT_BALANCE;
  }

  // USDCは6桁までの小数点を許容
  if (amount.includes('.') && amount.split('.')[1].length > 6) {
    return 'Amount cannot have more than 6 decimal places';
  }

  return null;
};

// ステーキング前の事前チェック
export const validateStakingPrerequisites = async (
  amount: string,
  balance: string,
  allowance: string,
  isContractPaused: boolean
): Promise<string | null> => {
  if (isContractPaused) {
    return UI_MESSAGES.ERRORS.CONTRACT_PAUSED;
  }

  const amountValidation = validateAmount(amount, balance);
  if (amountValidation) {
    return amountValidation;
  }

  const amountInWei = parseUnits(amount, 6);
  const allowanceInWei = parseUnits(allowance, 6);

  if (amountInWei > allowanceInWei) {
    return 'Insufficient allowance. Please approve USDC first.';
  }

  return null;
};

// リファラルコードの検証
export const validateReferralCode = (code: string): string | null => {
  if (!code || code.trim() === '') {
    return 'Referral code is required';
  }

  if (!/^\d+$/.test(code)) {
    return 'Referral code must contain only numbers';
  }

  const codeNumber = parseInt(code);
  if (isNaN(codeNumber) || codeNumber <= 0 || codeNumber > 999999) {
    return 'Invalid referral code format';
  }

  return null;
};

// 引き出し前の事前チェック
export const validateWithdrawalPrerequisites = (
  amount: string,
  stakedAmount: string,
  isContractPaused: boolean
): string | null => {
  if (isContractPaused) {
    return UI_MESSAGES.ERRORS.CONTRACT_PAUSED;
  }

  const amountValidation = validateAmount(amount, stakedAmount);
  if (amountValidation) {
    return amountValidation;
  }

  return null;
};

// トランザクションレシートの検証
export const validateTransactionReceipt = (receipt: any): boolean => {
  if (!receipt || !receipt.status) {
    return false;
  }

  // イベントの存在確認
  const events = receipt.logs || [];
  if (events.length === 0) {
    return false;
  }

  return true;
};

// ガス見積もりの計算（BASE Network用に最適化）
export const calculateOptimalGasLimit = (estimatedGas: bigint): bigint => {
  // BASE Networkでは20%のバッファーを追加
  return estimatedGas * BigInt(120) / BigInt(100);
};
