// src/utils/errors.ts
import { UI_MESSAGES } from '../constants';

// カスタムエラークラス
export class StakingError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'StakingError';
    Object.setPrototypeOf(this, StakingError.prototype);
  }
}

// エラーの種類を定義
export enum ErrorType {
  USER_REJECTED = 'USER_REJECTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN = 'UNKNOWN'
}

// エラーの解析と分類
export const classifyError = (error: any): ErrorType => {
  const errorMessage = error?.message?.toLowerCase() || '';

  if (errorMessage.includes('user rejected') || errorMessage.includes('user denied')) {
    return ErrorType.USER_REJECTED;
  }

  if (errorMessage.includes('insufficient funds') || errorMessage.includes('balance')) {
    return ErrorType.INSUFFICIENT_FUNDS;
  }

  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return ErrorType.NETWORK_ERROR;
  }

  if (errorMessage.includes('execution reverted')) {
    return ErrorType.CONTRACT_ERROR;
  }

  if (error instanceof StakingError) {
    return ErrorType.VALIDATION_ERROR;
  }

  return ErrorType.UNKNOWN;
};

// コントラクトエラーの解析
export const parseContractError = (error: any): string => {
  const errorData = error?.data?.message || '';
  const errorMessage = error?.message?.toLowerCase() || '';

  // コントラクトの特定のエラーメッセージを解析
  if (errorData.includes('paused') || errorMessage.includes('paused')) {
    return UI_MESSAGES.ERRORS.CONTRACT_PAUSED;
  }

  if (errorMessage.includes('amount too low')) {
    return UI_MESSAGES.ERRORS.MINIMUM_AMOUNT;
  }

  if (errorMessage.includes('insufficient allowance')) {
    return 'Insufficient allowance. Please approve USDC first.';
  }

  if (errorMessage.includes('already referred')) {
    return 'This wallet is already associated with a referrer.';
  }

  return 'Transaction failed. Please try again.';
};

// トランザクションエラーのハンドリング
export const handleTransactionError = (error: any, context: string): string => {
  const errorType = classifyError(error);

  switch (errorType) {
    case ErrorType.USER_REJECTED:
      return UI_MESSAGES.ERRORS.USER_REJECTED;

    case ErrorType.INSUFFICIENT_FUNDS:
      return UI_MESSAGES.ERRORS.INSUFFICIENT_BALANCE;

    case ErrorType.CONTRACT_ERROR:
      return parseContractError(error);

    case ErrorType.NETWORK_ERROR:
      return UI_MESSAGES.ERRORS.NETWORK_ERROR;

    case ErrorType.VALIDATION_ERROR:
      return error.message;

    default:
      console.error(`[${context}] Unhandled error:`, error);
      return 'An unexpected error occurred. Please try again.';
  }
};

// ガスエラーの特別処理
export const handleGasError = (error: any): string => {
  const errorMessage = error?.message?.toLowerCase() || '';

  if (errorMessage.includes('gas required exceeds allowance')) {
    return 'Transaction requires more gas than expected. Please try a smaller amount.';
  }

  if (errorMessage.includes('gas price too low')) {
    return 'Gas price too low. Please try again with higher gas price.';
  }

  return 'Transaction failed due to gas estimation. Please try again.';
};

// エラーのログ記録
export const logError = (error: any, context: string, additionalInfo?: any) => {
  const errorType = classifyError(error);
  const timestamp = new Date().toISOString();

  console.error({
    timestamp,
    type: errorType,
    context,
    message: error.message,
    additionalInfo,
    stack: error.stack
  });
  
  // 本番環境では適切なエラーモニタリングサービスに送信することを推奨
};

// トランザクションレシートのエラーチェック
export const checkTransactionError = (receipt: any): string | null => {
  if (!receipt) {
    return 'Transaction receipt not found';
  }

  if (!receipt.status) {
    return 'Transaction failed on the blockchain';
  }

  if (!receipt.logs || receipt.logs.length === 0) {
    return 'No events emitted from transaction';
  }

  return null;
};
