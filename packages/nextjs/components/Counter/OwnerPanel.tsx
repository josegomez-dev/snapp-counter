"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useAccount } from "~~/hooks/useAccount";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useDeployedContractInfo } from "~~/hooks/scaffold-stark/useDeployedContractInfo";
import { notification } from "~~/utils/scaffold-stark";

interface OwnerPanelProps {
  className?: string;
}

export const OwnerPanel = ({ className = "" }: OwnerPanelProps) => {
  const { address, isConnected, status } = useAccount();
  const [setValue, setSetValue] = useState<string>("");
  const [customValue, setCustomValue] = useState<string>("");

  // Read contract data
  const { data: owner } = useScaffoldReadContract({
    contractName: "CounterContract", 
    functionName: "owner",
  });

  const { data: counterValue } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "get_counter",
  });

  const { data: deployedContractData } = useDeployedContractInfo("CounterContract");

  // Contract write hook
  const { sendAsync: setCounter, status: setCounterStatus } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "set_counter",
    args: [setValue ? parseInt(setValue) : 0],
  });

  const isOwner = address && owner && address.toLowerCase() === owner.toString().toLowerCase();

  const handleSetValue = async (value: number) => {
    if (!isConnected || !address) {
      notification.error("Please connect your wallet first");
      return;
    }

    if (status === "connecting") {
      notification.error("Wallet is still connecting, please wait...");
      return;
    }

    try {
      // Update the args for the hook
      setSetValue(value.toString());
      
      // Wait a bit for the hook to update, then call
      setTimeout(async () => {
        try {
          await setCounter();
          notification.success(`Counter set to ${value} successfully!`);
          setCustomValue("");
        } catch (error: any) {
          console.error("Set counter error:", error);
          if (error.message?.includes("Cannot access account")) {
            notification.error("Wallet connection issue. Please refresh and reconnect your wallet.");
          } else {
            notification.error(`Failed to set counter: ${error.message || "Unknown error"}`);
          }
        }
      }, 100);
    } catch (error: any) {
      console.error("Set counter error:", error);
      notification.error(`Failed to set counter: ${error.message || "Unknown error"}`);
    }
  };

  const handleCustomSet = async () => {
    if (!customValue || isNaN(parseInt(customValue))) {
      notification.error("Please enter a valid number");
      return;
    }

    const value = parseInt(customValue);
    if (value < 0) {
      notification.error("Counter value cannot be negative");
      return;
    }

    await handleSetValue(value);
  };

  // Quick set buttons for common values
  const quickValues = [0, 1, 5, 10, 25, 50, 100];

  if (!isOwner) {
    return null; // Don't render if not owner
  }

  return (
    <div className={`card bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30 ${className}`}>
      <div className="card-body">
        <div className="flex items-center gap-2 mb-4">
          <div className="badge badge-accent badge-lg">👑</div>
          <h3 className="text-xl font-bold text-accent">Owner Panel</h3>
          <div className="badge badge-outline">Set Counter Value</div>
        </div>

        <div className="text-sm text-base-content/70 mb-4">
          As the contract owner, you can set the counter to any value instantly.
        </div>

        {/* Current Value Display */}
        <div className="bg-base-200 rounded-lg p-3 mb-4">
          <div className="text-sm text-base-content/60">Current Counter Value</div>
          <div className="text-2xl font-bold text-primary">{counterValue?.toString() || "0"}</div>
        </div>

        {/* Quick Set Buttons */}
        <div className="mb-4">
          <div className="text-sm font-semibold mb-2">Quick Set Values:</div>
          <div className="flex flex-wrap gap-2">
            {quickValues.map((value) => (
              <button
                key={value}
                className="btn btn-sm btn-outline btn-accent"
                onClick={() => handleSetValue(value)}
                disabled={setCounterStatus === "pending"}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Value Input */}
        <div className="mb-4">
          <div className="text-sm font-semibold mb-2">Custom Value:</div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Enter custom value"
              className="input input-bordered flex-1"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              min="0"
            />
            <button
              className="btn btn-accent"
              onClick={handleCustomSet}
              disabled={setCounterStatus === "pending" || !customValue || !isConnected || status === "connecting"}
            >
              {setCounterStatus === "pending" ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Set"
              )}
            </button>
          </div>
        </div>

        {/* Contract & Owner Info */}
        <div className="text-xs text-base-content/50 bg-base-200 rounded p-3">
          <div className="font-semibold mb-2 text-base-content/70">Contract Details</div>
          <div className="space-y-1">
            <div>
              <span className="font-semibold">Contract Address:</span>
              <div className="font-mono text-xs break-all">
                {deployedContractData?.address || "Not deployed"}
              </div>
            </div>
            <div>
              <span className="font-semibold">Owner Address:</span>
              <div className="font-mono text-xs break-all">
                {owner?.toString() || "Loading..."}
              </div>
            </div>
            <div>
              <span className="font-semibold">Your Address:</span>
              <div className="font-mono text-xs break-all">
                {address || "Not connected"}
              </div>
            </div>
            <div className="pt-1 border-t border-base-content/20">
              <span className="font-semibold">Status:</span>
              <span className={`ml-1 badge badge-sm ${isOwner ? 'badge-success' : 'badge-warning'}`}>
                {isOwner ? 'You are the owner' : 'You are not the owner'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
