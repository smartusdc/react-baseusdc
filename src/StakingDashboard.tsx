import React, { useState } from 'react';
import { useStakingOperations, useStakingInfo, useUSDCBalance } from '../hooks/useStaking';
import { useReferralSystem } from '../hooks/useReferral';
import { useWeb3Connection } from '../hooks/useWeb3';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { MIN_STAKE_AMOUNT } from '../constants';

export default function StakingDashboard() {
  const { isContractReady, error: connectionError } = useWeb3Connection();
  const { stakingStats, refetchUserInfo } = useStakingInfo();
  const { handleStake, handleWithdraw, handleClaimRewards, isProcessing, error: stakingError } = useStakingOperations();
  const { balance, allowance, refetchBalance } = useUSDCBalance();
  const { 
    handleGenerateCode, 
    handleApplyCode, 
    handleClaimReferralRewards,
    isProcessing: isReferralProcessing,
    error: referralError,
    referralCode,
    hasReferrer
  } = useReferralSystem();

  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState('');

  const handleStakeSubmit = async () => {
    if (!stakeAmount) return;

    const success = await handleStake(stakeAmount);
    if (success) {
      setStakeAmount('');
      await Promise.all([refetchUserInfo(), refetchBalance()]);
    }
  };

  const handleWithdrawSubmit = async () => {
    if (!withdrawAmount) return;

    const success = await handleWithdraw(withdrawAmount);
    if (success) {
      setWithdrawAmount('');
      await Promise.all([refetchUserInfo(), refetchBalance()]);
    }
  };

  if (!isContractReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Connecting to smart contract...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* エラー表示 */}
      {(connectionError || stakingError || referralError) && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {connectionError || stakingError || referralError}
          </AlertDescription>
        </Alert>
      )}

      {/* 統計情報 */}
      <Card>
        <CardHeader>
          <CardTitle>Your Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Available USDC</p>
              <p className="text-2xl font-bold">{balance}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Staked USDC</p>
              <p className="text-2xl font-bold">{stakingStats.depositAmount}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Pending Rewards</p>
              <p className="text-2xl font-bold">{stakingStats.pendingRewards}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ステーキングアクション */}
      <Card>
        <CardHeader>
          <CardTitle>Stake USDC</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder={`Min. ${MIN_STAKE_AMOUNT} USDC`}
                min={MIN_STAKE_AMOUNT}
                step="0.000001"
                disabled={isProcessing}
              />
              <Button
                variant="outline"
                onClick={() => setStakeAmount(balance)}
                disabled={isProcessing}
              >
                MAX
              </Button>
            </div>
            <Button
              onClick={handleStakeSubmit}
              disabled={isProcessing || !stakeAmount}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : Number(allowance) < Number(stakeAmount) ? (
                'Approve USDC'
              ) : (
                'Stake USDC'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 引き出しアクション */}
      <Card>
        <CardHeader>
          <CardTitle>Withdraw USDC</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Amount to withdraw"
                min={MIN_STAKE_AMOUNT}
                step="0.000001"
                disabled={isProcessing}
              />
              <Button
                variant="outline"
                onClick={() => setWithdrawAmount(stakingStats.depositAmount)}
                disabled={isProcessing}
              >
                MAX
              </Button>
            </div>
            <Button
              onClick={handleWithdrawSubmit}
              disabled={isProcessing || !withdrawAmount}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Withdraw USDC'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 報酬請求 */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Staking Rewards</p>
                <p className="text-xl font-semibold mb-4">{stakingStats.pendingRewards} USDC</p>
                <Button
                  onClick={() => handleClaimRewards()}
                  disabled={isProcessing || Number(stakingStats.pendingRewards) === 0}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    'Claim Staking Rewards'
                  )}
                </Button>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Referral Rewards</p>
                <p className="text-xl font-semibold mb-4">{stakingStats.referralRewards} USDC</p>
                <Button
                  onClick={() => handleClaimReferralRewards()}
                  disabled={isReferralProcessing || Number(stakingStats.referralRewards) === 0}
                  className="w-full"
                >
                  {isReferralProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    'Claim Referral Rewards'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* リファラルシステム */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!hasReferrer && (
              <div className="space-y-4">
                <Input
                  value={referralCodeInput}
                  onChange={(e) => setReferralCodeInput(e.target.value)}
                  placeholder="Enter referral code"
                  disabled={isReferralProcessing}
                />
                <Button
                  onClick={() => handleApplyCode(referralCodeInput)}
                  disabled={isReferralProcessing || !referralCodeInput}
                  className="w-full"
                >
                  {isReferralProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    'Apply Referral Code'
                  )}
                </Button>
              </div>
            )}

            <div>
              {referralCode === '0' ? (
                <Button
                  onClick={handleGenerateCode}
                  disabled={isReferralProcessing}
                  className="w-full"
                >
                  {isReferralProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate My Referral Code'
                  )}
                </Button>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Your Referral Code</p>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <span className="text-lg font-semibold">{referralCode}</span>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(referralCode);
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Total Referrals: {stakingStats.totalReferrals}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
