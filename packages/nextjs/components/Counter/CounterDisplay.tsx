"use client";

import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useAccount } from "~~/hooks/useAccount";
import { useDeployedContractInfo } from "~~/hooks/scaffold-stark/useDeployedContractInfo";

interface CounterDisplayProps {
  className?: string;
}

export const CounterDisplay = ({ className = "" }: CounterDisplayProps) => {
  const { address, isConnected, status } = useAccount();
  
  // Get deployed contract data
  const { data: deployedContractData } = useDeployedContractInfo("CounterContract");
  
  const { data: counterValue, isLoading, error } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "get_counter",
  });

  const { data: owner } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "owner",
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
        <div className="text-6xl font-bold text-secondary mb-2">
          42
        </div>
        <div className="text-sm text-base-content/60">
          Demo Counter Value
        </div>
        
        {/* Demo Contract Information */}
        <div className="mt-4 p-3 bg-base-200 rounded-lg">
          <div className="text-xs text-base-content/60 mb-2">Demo Mode</div>
          <div className="text-xs text-base-content/50 space-y-1">
            <div>
              <span className="font-semibold">Status:</span>
              <span className="ml-1 badge badge-warning badge-sm">Demo Mode</span>
            </div>
            <div>
              <span className="font-semibold">Note:</span>
              <span className="ml-1 text-xs">Contract not deployed to public network</span>
            </div>
          </div>
        </div>

        {isConnected && address ? (
          <div className="text-xs text-base-content/40 mt-2">
            <span className="badge badge-success badge-sm mr-2">Connected</span>
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        ) : (
          <div className="text-xs text-base-content/40 mt-2">
            <span className="badge badge-error badge-sm mr-2">Not Connected</span>
            Please connect your wallet
          </div>
        )}
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
      
      {/* Contract Information */}
      <div className="mt-4 p-3 bg-base-200 rounded-lg">
        <div className="text-xs text-base-content/60 mb-2">Contract Information</div>
        <div className="text-xs text-base-content/50 space-y-1">
          <div>
            <span className="font-semibold">Contract:</span> 
            <span className="font-mono ml-1">
              {deployedContractData?.address ? 
                `${deployedContractData.address.slice(0, 6)}...${deployedContractData.address.slice(-4)}` : 
                "Not deployed"
              }
            </span>
          </div>
          <div>
            <span className="font-semibold">Owner:</span> 
            <span className="font-mono ml-1">
              {owner ? 
                `${owner.toString().slice(0, 6)}...${owner.toString().slice(-4)}` : 
                "Loading..."
              }
            </span>
          </div>
        </div>
      </div>

      {isConnected && address ? (
        <div className="text-xs text-base-content/40 mt-2">
          <span className="badge badge-success badge-sm mr-2">Connected</span>
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
      ) : (
        <div className="text-xs text-base-content/40 mt-2">
          <span className="badge badge-error badge-sm mr-2">Not Connected</span>
          Please connect your wallet
        </div>
      )}
    </div>
  );
};
