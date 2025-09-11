"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useAccount } from "~~/hooks/useAccount";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
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

  // Contract write hook
  const { sendAsync: setCounter, isLoading: isSetting } = useScaffoldWriteContract({
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
                disabled={isSetting}
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
              disabled={isSetting || !customValue || !isConnected || status === "connecting"}
            >
              {isSetting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Set"
              )}
            </button>
          </div>
        </div>

        {/* Owner Info */}
        <div className="text-xs text-base-content/50 bg-base-200 rounded p-2">
          <div>Owner Address: {owner?.toString().slice(0, 6)}...{owner?.toString().slice(-4)}</div>
          <div>Your Address: {address?.slice(0, 6)}...{address?.slice(-4)}</div>
        </div>
      </div>
    </div>
  );
};
