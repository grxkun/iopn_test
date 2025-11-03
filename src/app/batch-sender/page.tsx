'use client';

import { useState } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther } from 'viem';

interface Transaction {
  to: string;
  amount: string;
}

export default function BatchSender() {
  const [transactions, setTransactions] = useState<Transaction[]>([{ to: '', amount: '' }]);
  const [currentTxIndex, setCurrentTxIndex] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const { address } = useAccount();
  const { sendTransaction, data: hash } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const addTransaction = () => {
    setTransactions([...transactions, { to: '', amount: '' }]);
  };

  const updateTransaction = (index: number, field: keyof Transaction, value: string) => {
    const newTxs = [...transactions];
    newTxs[index][field] = value;
    setTransactions(newTxs);
  };

  const removeTransaction = (index: number) => {
    setTransactions(transactions.filter((_, i) => i !== index));
  };

  const sendBatch = async () => {
    if (!address) return;

    setIsSending(true);
    setCurrentTxIndex(0);

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      if (!tx.to || !tx.amount) continue;

      try {
        await sendTransaction({
          to: tx.to as `0x${string}`,
          value: parseEther(tx.amount),
        });
        setCurrentTxIndex(i + 1);
        // Wait for confirmation before next
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simple delay
      } catch (error) {
        console.error('Error sending transaction:', error);
        break;
      }
    }

    setIsSending(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Batch Sender</h1>
        {!address && <p className="text-red-500 mb-4">Please connect your wallet first.</p>}
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                placeholder="Recipient Address"
                value={tx.to}
                onChange={(e) => updateTransaction(index, 'to', e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount (OPN)"
                value={tx.amount}
                onChange={(e) => updateTransaction(index, 'amount', e.target.value)}
                className="w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {transactions.length > 1 && (
                <button
                  onClick={() => removeTransaction(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addTransaction}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Transaction
          </button>
          <button
            onClick={sendBatch}
            disabled={isSending || !address || transactions.some(tx => !tx.to || !tx.amount)}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSending ? `Sending... (${currentTxIndex}/${transactions.length})` : 'Send Batch'}
          </button>
          {hash && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Transaction Hash: {hash}</p>
              {isConfirming && <p className="text-sm text-yellow-600">Confirming...</p>}
              {isConfirmed && <p className="text-sm text-green-600">Transaction confirmed!</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}