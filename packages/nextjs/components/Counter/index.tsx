"use client";

import { CounterDisplay } from "./CounterDisplay";
import { CounterActions } from "./CounterActions";
import { OwnerPanel } from "./OwnerPanel";
import { EventsList } from "./EventsList";

export const Counter = () => {
  return (
    <div className="min-h-screen bg-black/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-secondary mb-2">
            <span className="text-white">SNAPP Foundry</span> Counter Contract
          </h1>
          <p className="text-base-content/70">
            Interact with the <span className="text-secondary">Starknet Counter Contract</span>
          </p>
        </div>

        {/* Main Counter Display */}
        <div className="max-w-4xl mx-auto">
          <div className="card bg-base-100 shadow-xl p-8 mb-8">
            <CounterDisplay />
          </div>

          {/* Counter Actions */}
          <div className="card bg-base-100 shadow-xl p-8 mb-8">
            <CounterActions />
          </div>

          {/* Owner Panel */}
          <div className="mb-8">
            <OwnerPanel />
          </div>

          {/* Events List */}
          <EventsList />
        </div>

      </div>
    </div>
  );
};
