"use client";

import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useAccount } from "~~/hooks/useAccount";

interface CounterDisplayProps {
  className?: string;
}

export const CounterDisplay = ({ className = "" }: CounterDisplayProps) => {
  const { address, isConnected, status } = useAccount();
  
  const { data: counterValue, isLoading, error } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "get_counter",
  });

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-error">Error loading counter</div>
        <div className="text-sm text-base-content/60">{error.message}</div>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="text-6xl font-bold text-secondary mb-2">
        {counterValue?.toString() || "0"}
      </div>
      <div className="text-sm text-base-content/60">
        Current Counter Value
      </div>
      {isConnected && address ? (
        <div className="text-xs text-base-content/40 mt-1">
          <span className="badge badge-success badge-sm mr-2">Connected</span>
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
      ) : (
        <div className="text-xs text-base-content/40 mt-1">
          <span className="badge badge-error badge-sm mr-2">Not Connected</span>
          Please connect your wallet
        </div>
      )}
    </div>
  );
};
