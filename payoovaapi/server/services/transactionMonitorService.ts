import { storage } from '../storage';
import { BlockchainService } from './blockchainService';
import { EmailService } from './emailService';
import { ErrorHandlingService } from './errorHandlingService';

export class TransactionMonitorService {
  private static monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private static readonly MONITORING_INTERVAL = 30000; // 30 seconds
  private static readonly MAX_MONITORING_TIME = 3600000; // 1 hour

  static async startMonitoring(transactionId: string): Promise<void> {
    try {
      // Don't start multiple monitors for the same transaction
      if (this.monitoringIntervals.has(transactionId)) {
        return;
      }

      console.log(`🔍 Starting transaction monitoring for: ${transactionId}`);

      const interval = setInterval(async () => {
        await this.checkTransactionStatus(transactionId);
      }, this.MONITORING_INTERVAL);

      this.monitoringIntervals.set(transactionId, interval);

      // Auto-cleanup after max monitoring time
      setTimeout(() => {
        this.stopMonitoring(transactionId);
      }, this.MAX_MONITORING_TIME);

    } catch (error) {
      console.error('Failed to start transaction monitoring:', error);
    }
  }

  static stopMonitoring(transactionId: string): void {
    const interval = this.monitoringIntervals.get(transactionId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(transactionId);
      console.log(`⏹️ Stopped monitoring transaction: ${transactionId}`);
    }
  }

  private static async checkTransactionStatus(transactionId: string): Promise<void> {
    try {
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction || !transaction.transactionHash) {
        this.stopMonitoring(transactionId);
        return;
      }

      // Skip if already confirmed or failed
      if (transaction.status !== 'pending') {
        this.stopMonitoring(transactionId);
        return;
      }

      // Check blockchain status
      const statusUpdate = await BlockchainService.checkTransactionStatus(
        transaction.transactionHash,
        transaction.network
      );

      if (statusUpdate.status !== 'pending') {
        console.log(`📝 Transaction ${transactionId} status changed to: ${statusUpdate.status}`);
        
        // Update transaction in database
        await storage.updateTransactionStatus(
          transactionId,
          statusUpdate.status,
          statusUpdate.blockNumber,
          statusUpdate.gasUsed
        );

        // Send notification email if user email is available
        await this.sendTransactionNotification(transaction, statusUpdate.status);

        // Sync wallet balances after confirmed transaction
        if (statusUpdate.status === 'confirmed') {
          const wallet = await storage.getWallet(transaction.walletId);
          if (wallet) {
            await BlockchainService.syncWalletBalances(
              wallet.id,
              wallet.address,
              wallet.network
            );
          }
        }

        // Stop monitoring
        this.stopMonitoring(transactionId);
      }

    } catch (error) {
      const handledError = ErrorHandlingService.categorizeAndHandleError(error, 'transaction-monitoring');
      console.error('Transaction monitoring error:', handledError);
    }
  }

  private static async sendTransactionNotification(
    transaction: any,
    finalStatus: string
  ): Promise<void> {
    try {
      const user = await storage.getUser(transaction.userId);
      if (!user || !user.email) {
        return;
      }

      const isConfirmed = finalStatus === 'confirmed';
      const notificationData = {
        type: transaction.type as 'send' | 'receive',
        amount: transaction.amount,
        currency: transaction.currency,
        network: transaction.network,
        transactionHash: transaction.transactionHash,
        toAddress: transaction.toAddress,
        fromAddress: transaction.fromAddress,
      };

      if (isConfirmed) {
        await EmailService.sendTransactionNotificationEmail(
          user.email,
          notificationData,
          user.firstName || undefined
        );
      }

      console.log(`📧 Transaction notification sent to ${user.email}: ${finalStatus}`);
    } catch (error) {
      console.error('Failed to send transaction notification:', error);
    }
  }

  static async monitorAllPendingTransactions(): Promise<void> {
    try {
      // This would typically be called on server startup
      const pendingTransactions = await this.getPendingTransactions();
      
      for (const transaction of pendingTransactions) {
        if (transaction.transactionHash) {
          await this.startMonitoring(transaction.id);
        }
      }

      console.log(`🔄 Started monitoring ${pendingTransactions.length} pending transactions`);
    } catch (error) {
      console.error('Failed to monitor pending transactions:', error);
    }
  }

  private static async getPendingTransactions(): Promise<any[]> {
    try {
      // This is a simplified query - in production you'd want a more efficient approach
      return [];
    } catch (error) {
      console.error('Failed to get pending transactions:', error);
      return [];
    }
  }

  static getMonitoringStats(): {
    activeMonitors: number;
    monitoredTransactions: string[];
  } {
    return {
      activeMonitors: this.monitoringIntervals.size,
      monitoredTransactions: Array.from(this.monitoringIntervals.keys()),
    };
  }

  static async forceCheckTransaction(transactionId: string): Promise<{
    success: boolean;
    status?: string;
    error?: string;
  }> {
    try {
      await this.checkTransactionStatus(transactionId);
      return { success: true };
    } catch (error) {
      const handledError = ErrorHandlingService.categorizeAndHandleError(error, 'force-transaction-check');
      return {
        success: false,
        error: handledError.userFriendlyMessage,
      };
    }
  }
}