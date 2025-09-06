
import React, { useState, useEffect } from 'react';
import { fetchTransactions } from '@/services/transactionService';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTransactions() {
      try {
        setLoading(true);
        const data = await fetchTransactions();
        setTransactions(data);
      } catch (err) {
        setError('Failed to fetch transactions');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, []);

  if (loading) {
    return <div className="transaction-history">Loading...</div>;
  }

  if (error) {
    return <div className="transaction-history error">{error}</div>;
  }

  return (
    <div className="transaction-history">
      <h2>Transaction History</h2>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul>
          {transactions.map(tx => (
            <li key={tx.hash} className="transaction-item">
              <div className="transaction-date">{tx.date}</div>
              <div className="transaction-details">
                <span className="transaction-amount">{tx.amount} {tx.currency}</span>
                <span className={`transaction-status ${tx.status.toLowerCase()}`}>{tx.status}</span>
              </div>
              <div className="transaction-hash">Hash: {tx.hash}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
