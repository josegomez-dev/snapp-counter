"use client";

import { useScaffoldEventHistory } from "~~/hooks/scaffold-stark/useScaffoldEventHistory";
import { CHANGE_REASON_LABELS, ChangeReason } from "~~/utils/counterUtils";
import { useState, useMemo, useCallback } from "react";
import { extractReason } from "~~/utils/extractReason";

interface CounterChangedEvent {
  caller: string;
  old_value: number;
  new_value: number;
  reason: ChangeReason;
  block_hash?: string;
  transaction_hash?: string;
}

interface EventData {
  parsedArgs: CounterChangedEvent;
  block?: { block_number: number };
  transaction_hash?: string;
}

export const EventsList = () => {
  const [fromBlock, setFromBlock] = useState<bigint>(0n);

  const { data: events, isLoading, error } = useScaffoldEventHistory({
    contractName: "CounterContract",
    eventName: "CounterChanged",
    fromBlock,
    blockData: true,
    transactionData: true,
    watch: true,
  });

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (blockNumber?: number) => {
    if (!blockNumber) return "Unknown";
    return `Block #${blockNumber}`;
  };

  const getReasonColor = (reason: ChangeReason) => {
    switch (reason) {
      case "Increase":
        return "badge-success";
      case "Decrease":
        return "badge-warning";
      case "Reset":
        return "badge-error";
      case "Set":
        return "badge-info";
      default:
        return "badge-neutral";
    }
  };

  // Memoized filtered events
  const validEvents = useMemo(() => {
    return events || [];
  }, [events]);

  // Memoized stats calculation
  const stats = useMemo(() => {
    // Ensure counts has these keys
    const counts = {
      increase: 0,
      decrease: 0,
      reset: 0,
      set: 0,
    };

    validEvents.forEach((event) => {
      const reasonName = extractReason(event.parsedArgs?.reason);

      switch (reasonName) {
        case 'Increase':
          counts.increase++;
          break;
        case 'Decrease':
          counts.decrease++;
          break;
        case 'Reset':
          counts.reset++;
          break;
        case 'Set':
          counts.set++;
          break;
        default:
          // Unknown/unsupported variant; ignore or log
          // console.warn('Unknown reason variant', event.parsedArgs?.reason);
          break;
      }
    });

    return counts;
  }, [validEvents]);

  return (
    <div className="card bg-base-200/50 shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-secondary h-10">Counter Events History
            {isLoading && (
              <span className="loading loading-spinner loading-lg text-secondary ml-2"></span>
            )}
          </h3>

          {validEvents && (
            <p className="text-sm text-base-content/60 mt-1">
              {validEvents.length} CounterChanged events found
              {events && events.length > validEvents.length && (
                <span className="text-warning ml-2">
                  ({events.length - validEvents.length} invalid events filtered)
                </span>
              )}
              <span className="ml-2 inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                Live
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="label">
            <span className="label-text text-sm">From Block:</span>
          </label>
          <input
            type="number"
            className="input input-bordered input-sm w-24"
            value={fromBlock.toString()}
            onChange={(e) => setFromBlock(BigInt(e.target.value || 0))}
            placeholder="0"
          />
        </div>
      </div>

      {/* Fixed height container to prevent content jumping */}
      <div className="min-h-[400px] flex flex-col">

        {error && (
          <div className="alert alert-error">
            <span>Error loading events: {error}</span>
          </div>
        )}

        {validEvents.length === 0 && !isLoading && (
          <div className="flex flex-col justify-center items-center flex-1 text-center text-base-content/60">
            <div className="text-4xl mb-2">📋</div>
            <div>No CounterChanged events found</div>
            <div className="text-sm mt-1">Events will appear here when the counter is modified</div>
            {events && events.length > 0 && (
              <div className="text-warning text-xs mt-2">
                Note: {events.length} events were found but filtered due to invalid data
              </div>
            )}
          </div>
        )}

        {validEvents.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto" role="list" aria-label="Counter events history">
          {validEvents.map((event, index) => {
            const eventData = event.parsedArgs;
            const reason = extractReason(eventData.reason);

            return (
              <div 
                key={`${event.block?.block_number}-${index}`} 
                className="card bg-base-100 border border-base-300 p-4 hover:shadow-md transition-shadow"
                role="listitem"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className={`badge ${getReasonColor((reason as ChangeReason) || 'Increase')} badge-lg`}>
                        {reason ? CHANGE_REASON_LABELS[reason as ChangeReason] : 'Unknown'}
                      </span>
                      <span className="text-sm text-base-content/60">
                        {formatTimestamp(event.block?.block_number)}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-base-content/50">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        #{validEvents.length - index}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex flex-col">
                        <span className="font-semibold text-base-content/70">From</span>
                        <span className="text-lg font-mono">{eventData.old_value}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-base-content/70">To</span>
                        <span className="text-lg font-mono">{eventData.new_value}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-base-content/70">Caller</span>
                        <span className="font-mono text-xs" title={eventData.caller}>
                          {formatAddress(eventData.caller)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-base-content/70">Reason</span>
                        <span className="font-mono text-xs" title={event.transaction_hash || 'N/A'}>
                          {reason}
                        </span>
                      </div>
                    </div>

                    {/* Change indicator */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        eventData.new_value > eventData.old_value ? 'bg-success' : 
                        eventData.new_value < eventData.old_value ? 'bg-warning' : 'bg-info'
                      }`}></div>
                      <span className="text-xs text-base-content/60">
                        {eventData.new_value > eventData.old_value ? '+' : ''}
                        {eventData.new_value - eventData.old_value} change
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Debug Stats Info - Development Only */}
      {validEvents.length > 0 && (
        <div className="mt-4 p-3 bg-base-300 rounded-lg text-xs">
          <div className="font-semibold mb-2">Debug: Event Data Validation</div>
          <div className="grid grid-cols-2 gap-2">
            <div>Total Events: {events?.length || 0}</div>
            <div>Validation Rate: {validEvents.length > 0 ? Math.round((validEvents.length / (events?.length || 1)) * 100) : 0}%</div>
          </div>
          <div className="mt-3 pt-2 border-t border-base-400">
            <div className="font-semibold mb-1">Calculated Stats:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Increases: {stats.increase}</div>
              <div>Decreases: {stats.decrease}</div>
              <div>Resets: {stats.reset}</div>
              <div>Sets: {stats.set}</div>
            </div>

          </div>
        </div>
      )}

      {/* Summary Stats */}
      {validEvents.length > 0 && (
        <div className="mt-6 pt-4 border-t border-base-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-success">
                {stats.increase}
              </div>
              <div className="text-sm text-base-content/60">Increases</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">
                {stats.decrease}
              </div>
              <div className="text-sm text-base-content/60">Decreases</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-error">
                {stats.reset}
              </div>
              <div className="text-sm text-base-content/60">Resets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-info">
                {stats.set}
              </div>
              <div className="text-sm text-base-content/60">Owner Sets</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

