"use client";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useScaffoldMultiWriteContract, createContractCall } from "~~/hooks/scaffold-stark/useScaffoldMultiWriteContract";
import { useAccount } from "~~/hooks/useAccount";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useDeployedContractInfo } from "~~/hooks/scaffold-stark/useDeployedContractInfo";
import useScaffoldStrkBalance from "~~/hooks/scaffold-stark/useScaffoldStrkBalance";
import { RESET_PAYMENT_AMOUNT, STRK_TOKEN_ADDRESS, formatStrk } from "~~/utils/counterUtils";
import { notification } from "~~/utils/scaffold-stark";

interface CounterActionsProps {
  className?: string;
}

export const CounterActions = ({ className = "" }: CounterActionsProps) => {
  const { address, isConnected, status } = useAccount();


  const { data: counterValue } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "get_counter",
  });

  // STRK balance
  const { value: strkBalance, formatted: formattedBalance } = useScaffoldStrkBalance({
    address: address,
  });

  // Contract write hooks
  const { sendAsync: increaseCounter, status: increaseStatus } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "increase_counter",
  });

  const { sendAsync: decreaseCounter, status: decreaseStatus } = useScaffoldWriteContract({
    contractName: "CounterContract", 
    functionName: "decrease_counter",
  });


  // Get contract address for approval
  const { data: deployedContractData } = useDeployedContractInfo("CounterContract");

  // Multi-contract for reset (approve + reset)
  const { sendAsync: executeReset, status: resetStatus } = useScaffoldMultiWriteContract({
    calls: [
      createContractCall("Strk", "approve", [deployedContractData?.address, RESET_PAYMENT_AMOUNT]),
      createContractCall("CounterContract", "reset_counter", []),
    ],
  });

  const hasEnoughBalance = strkBalance && strkBalance >= RESET_PAYMENT_AMOUNT;
  const canReset = hasEnoughBalance && deployedContractData?.address;

  const handleIncrease = async () => {
    if (!isConnected || !address) {
      notification.error("Please connect your wallet first");
      return;
    }

    if (status === "connecting") {
      notification.error("Wallet is still connecting, please wait...");
      return;
    }

    if (!deployedContractData?.address) {
      notification.error("Contract not deployed or not found. Please refresh the page.");
      return;
    }

    try {
      console.log("Attempting to increase counter...", {
        contractAddress: deployedContractData.address,
        userAddress: address,
        isConnected,
        status
      });
      
      await increaseCounter();
      notification.success("Counter increased successfully!");
    } catch (error: any) {
      console.error("Increase counter error:", error);
      
      let errorMessage = "Failed to increase counter";
      
      if (error.message?.includes("Cannot access account")) {
        errorMessage = "Wallet connection issue. Please refresh and reconnect your wallet.";
      } else if (error.message?.includes("Contract not found") || error.message?.includes("NOT_FOUND")) {
        errorMessage = "Contract not deployed. Please deploy the contract first.";
      } else if (error.message?.includes("insufficient balance")) {
        errorMessage = "Insufficient balance to pay for transaction fees.";
      } else if (error.message?.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user.";
      } else if (error.message) {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
      
      notification.error(errorMessage);
    }
  };

  const handleDecrease = async () => {
    if (!isConnected || !address) {
      notification.error("Please connect your wallet first");
      return;
    }

    if (status === "connecting") {
      notification.error("Wallet is still connecting, please wait...");
      return;
    }

    if (!deployedContractData?.address) {
      notification.error("Contract not deployed or not found. Please refresh the page.");
      return;
    }

    // Check if counter is already at 0
    if (counterValue !== undefined && Number(counterValue) <= 0) {
      notification.error("Counter cannot be decreased below 0");
      return;
    }

    try {
      console.log("Attempting to decrease counter...", {
        contractAddress: deployedContractData.address,
        userAddress: address,
        isConnected,
        status,
        currentCounterValue: counterValue
      });
      
      await decreaseCounter();
      notification.success("Counter decreased successfully!");
    } catch (error: any) {
      console.error("Decrease counter error:", error);
      
      let errorMessage = "Failed to decrease counter";
      
      if (error.message?.includes("Cannot access account")) {
        errorMessage = "Wallet connection issue. Please refresh and reconnect your wallet.";
      } else if (error.message?.includes("Contract not found") || error.message?.includes("NOT_FOUND")) {
        errorMessage = "Contract not deployed. Please deploy the contract first.";
      } else if (error.message?.includes("insufficient balance")) {
        errorMessage = "Insufficient balance to pay for transaction fees.";
      } else if (error.message?.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user.";
      } else if (error.message?.includes("Counter cannot be less than 0")) {
        errorMessage = "Counter cannot be decreased below 0";
      } else if (error.message) {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
      
      notification.error(errorMessage);
    }
  };


  const handleReset = async () => {
    if (!isConnected || !address) {
      notification.error("Please connect your wallet first");
      return;
    }

    if (status === "connecting") {
      notification.error("Wallet is still connecting, please wait...");
      return;
    }

    if (!canReset) {
      if (!hasEnoughBalance) {
        notification.error("Insufficient STRK balance. You need at least 1 STRK to reset.");
      } else if (!deployedContractData?.address) {
        notification.error("Contract not found. Please refresh the page.");
      }
      return;
    }

    try {
      await executeReset();
      notification.success("Counter reset successfully! 1 STRK transferred to owner.");
    } catch (error: any) {
      console.error("Reset counter error:", error);
      if (error.message?.includes("Cannot access account")) {
        notification.error("Wallet connection issue. Please refresh and reconnect your wallet.");
      } else {
        notification.error(`Failed to reset counter: ${error.message || "Unknown error"}`);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Contract Deployment Status */}
      {!deployedContractData && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>
            Contract not found or not deployed. Please deploy the contract first.
          </span>
        </div>
      )}

      {/* Wallet Connection Status */}
      {!isConnected && (
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>
            {status === "connecting" 
              ? "Connecting to wallet..." 
              : "Please connect your wallet to interact with the counter"
            }
          </span>
        </div>
      )}

      {/* Basic Actions */}
      <div className="flex gap-4 justify-center">
        <button
          className="btn btn-primary btn-lg"
          onClick={handleIncrease}
          disabled={increaseStatus === "pending" || !isConnected || status === "connecting" || !deployedContractData?.address}
        >
          {increaseStatus === "pending" ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            "Increase +"
          )}
        </button>

        <button
          className="btn btn-secondary btn-lg"
          onClick={handleDecrease}
          disabled={decreaseStatus === "pending" || !isConnected || status === "connecting" || !deployedContractData?.address || (counterValue && Number(counterValue) <= 0)}
        >
          {decreaseStatus === "pending" ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            "Decrease -"
          )}
        </button>
      </div>


      {/* Reset Action */}
      <div className="card bg-warning/10 border border-warning/20 p-4">
        <h3 className="text-lg font-semibold mb-2 text-warning">Reset Counter</h3>
        <div className="text-sm text-base-content/70 mb-3">
          Reset the counter to 0 by paying 1 STRK to the contract owner.
          <br />
          <span className="text-xs text-base-content/50">
            This will: 1) Approve the contract to spend 1 STRK, 2) Reset counter to 0, 3) Transfer 1 STRK to owner
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm">
            <div>Your STRK Balance: <span className="font-mono">{formattedBalance}</span></div>
            <div>Required: <span className="font-mono">1.0000 STRK</span></div>
            <div>Contract: <span className="font-mono text-xs">{deployedContractData?.address?.slice(0, 6)}...{deployedContractData?.address?.slice(-4)}</span></div>
          </div>
          <div className={`badge ${canReset ? 'badge-success' : 'badge-error'}`}>
            {canReset ? 'Ready' : 'Not Ready'}
          </div>
        </div>

        <button
          className="btn btn-warning btn-block"
          onClick={handleReset}
          disabled={resetStatus === "pending" || !canReset || !isConnected || status === "connecting"}
        >
          {resetStatus === "pending" ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Resetting...
            </>
          ) : (
            <>
              💰 Reset Counter (1 STRK)
            </>
          )}
        </button>
      </div>

      {/* Status Info */}
      <div className="text-center text-sm text-base-content/60">
        <div>Current value: {counterValue?.toString() || "0"}</div>
      </div>
    </div>
  );
};
