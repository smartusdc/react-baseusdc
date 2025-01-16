// src/constants/index.ts

// Contract and Network Configuration
export const CONTRACT_ADDRESS = '0x2Bd38bD63D66b360dE91E2F8CAEe48AA0B159a00';
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const BASE_CHAIN_ID = 8453;

// Platform Configuration
export const SITE_CONFIG = {
  name: 'BASE USDC Staking',
  description: 'Stake your USDC on BASE Network with institutional-grade security',
  domain: 'baseusdc.com',
  supportEmail: 'support@baseusdc.com'
};

// USDC Configuration
export const USDC_DECIMALS = 6;
export const MIN_STAKE_AMOUNT = 0.01;
export const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

// Platform Statistics
export const PLATFORM_STATS = {
  defaultAPR: 74,          // 74%
  referrerReward: 5,       // 5%
  referredReward: 70,      // 70%
};

// UI Text and Messages
export const UI_MESSAGES = {
  WALLET: {
    CONNECT: 'Connect Wallet',
    CONNECTING: 'Connecting...',
    SWITCH_NETWORK: 'Switch to BASE Network',
    DISCONNECT: 'Disconnect',
    WRONG_NETWORK: 'Please switch to BASE Network to continue'
  },
  TRANSACTIONS: {
    STAKE: {
      TITLE: 'Stake USDC',
      APPROVING: 'Approving USDC...',
      STAKING: 'Staking...',
      SUCCESS: 'Successfully staked USDC',
      FAILED: 'Failed to stake USDC'
    },
    WITHDRAW: {
      TITLE: 'Withdraw USDC',
      PROCESSING: 'Processing withdrawal...',
      SUCCESS: 'Successfully withdrawn USDC',
      FAILED: 'Failed to withdraw USDC'
    },
    CLAIM: {
      TITLE: 'Claim Rewards',
      PROCESSING: 'Processing claim...',
      SUCCESS: 'Successfully claimed rewards',
      FAILED: 'Failed to claim rewards'
    }
  },
  REFERRAL: {
    GENERATE: 'Generate Referral Code',
    APPLY: 'Apply Referral Code',
    SUCCESS: 'Referral code applied successfully',
    GENERATING: 'Generating code...',
    ALREADY_HAS_CODE: 'You already have a referral code'
  },
  ERRORS: {
    INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
    MINIMUM_AMOUNT: `Minimum amount is ${MIN_STAKE_AMOUNT} USDC`,
    NETWORK_ERROR: 'Network connection error. Please try again',
    CONTRACT_PAUSED: 'This function is temporarily paused',
    USER_REJECTED: 'Transaction was cancelled by user'
  }
};

// Types
export interface StakingStats {
  depositAmount: string;
  pendingRewards: string;
  referralRewards: string;
  totalReferrals: number;
  hasReferrer: boolean;
  referralCode: string;
}

export interface TransactionState {
  isProcessing: boolean;
  error: string | null;
  status: 'idle' | 'processing' | 'success' | 'error';
}

export interface PlatformInfo {
  currentAPR: number;
  referrerRewardRate: number;
  referredRewardRate: number;
  totalStaked: string;
  totalUsers: number;
  isStakingPaused: boolean;
  isWithdrawalPaused: boolean;
  isRewardClaimPaused: boolean;
}

// Theme Configuration - TailwindCSS classes
export const THEME = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  card: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors',
    disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed font-medium py-2 px-4 rounded-lg'
  },
  input: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  heading: {
    h1: 'text-3xl font-bold text-gray-900',
    h2: 'text-2xl font-semibold text-gray-900',
    h3: 'text-xl font-medium text-gray-900'
  }
};
