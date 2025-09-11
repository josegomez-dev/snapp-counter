import { useCallback } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import {
  useDeployedContractInfo,
  useTransactor,
} from "~~/hooks/scaffold-stark";
import {
  ContractAbi,
  ContractName,
  ExtractAbiFunctionNamesScaffold,
  UseScaffoldWriteConfig,
} from "~~/utils/scaffold-stark/contract";
import { useSendTransaction, useNetwork, Abi } from "@starknet-react/core";
import { notification } from "~~/utils/scaffold-stark";
import { Contract as StarknetJsContract } from "starknet";

/**
 * Provides a function to write (send transactions) to a contract method.
 * This hook creates a transaction function that can be called to execute
 * external (write) functions on a deployed contract, with built-in validation
 * for contract deployment, wallet connection, and network compatibility.
 *
 * @param config - Configuration object for the hook
 * @param config.contractName - The deployed contract name to interact with
 * @param config.functionName - The contract method to call (must be an external function)
 * @param config.args - Arguments for the method call
 * @returns {Object} An object containing:
 *   - sendAsync: (params?: { args?: any[] }) => Promise<string | undefined> - Function to execute the transaction with optional override arguments
 *   - isLoading: boolean - Boolean indicating if the transaction is in progress
 *   - error: Error | null - Any error encountered during the transaction
 *   - status: "idle" | "loading" | "success" | "error" - The transaction status
 *   - All other properties from sendTransactionInstance
 * @see {@link https://scaffoldstark.com/docs/hooks/useScaffoldWriteContract}
 */
export const useScaffoldWriteContract = <
  TAbi extends Abi,
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNamesScaffold<
    ContractAbi<TContractName>,
    "external"
  >,
>({
  contractName,
  functionName,
  args,
}: UseScaffoldWriteConfig<TAbi, TContractName, TFunctionName>) => {
  const { data: deployedContractData } = useDeployedContractInfo(contractName);
  const { chain } = useNetwork();
  const { writeTransaction: sendTxnWrapper, sendTransactionInstance } =
    useTransactor();
  const { targetNetwork } = useTargetNetwork();

  const sendContractWriteTx = useCallback(
    async (params?: {
      args?: UseScaffoldWriteConfig<TAbi, TContractName, TFunctionName>["args"];
    }) => {
      // if no args supplied, use the one supplied from hook
      let newArgs = params?.args;
      if (Object.keys(newArgs || {}).length <= 0) {
        newArgs = args;
      }

      if (!deployedContractData) {
        const errorMsg = `Target Contract "${contractName}" is not deployed, did you forget to run \`yarn deploy\`?`;
        console.error(errorMsg, { contractName, targetNetwork: targetNetwork.id });
        throw new Error(errorMsg);
      }
      if (!chain?.id) {
        const errorMsg = "Please connect your wallet";
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      if (chain?.id !== targetNetwork.id) {
        const errorMsg = `You are on the wrong network. Expected: ${targetNetwork.id}, Current: ${chain.id}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      // we convert to starknetjs contract instance here since deployed data may be undefined if contract is not deployed
      const contractInstance = new StarknetJsContract(
        deployedContractData.abi,
        deployedContractData.address,
      );

      console.log("Preparing contract call:", {
        contractName,
        functionName,
        contractAddress: deployedContractData.address,
        args: newArgs,
        chainId: chain.id
      });

      const newCalls = deployedContractData
        ? [contractInstance.populate(functionName, newArgs as any[])]
        : [];

      try {
        return await sendTxnWrapper(newCalls as any[]);
      } catch (e: any) {
        console.error("Contract call failed:", {
          contractName,
          functionName,
          error: e.message,
          contractAddress: deployedContractData.address
        });
        throw e;
      }
    },
    [
      args,
      chain?.id,
      deployedContractData,
      functionName,
      sendTransactionInstance,
      sendTxnWrapper,
      targetNetwork.id,
    ],
  );

  return {
    ...sendTransactionInstance,
    sendAsync: sendContractWriteTx,
  };
};
