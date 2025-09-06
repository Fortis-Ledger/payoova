export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
  userFriendlyMessage: string;
}

export class ErrorHandlingService {
  static handleBlockchainError(error: any): ErrorResponse {
    console.error('Blockchain error:', error);

    // Network connection errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
      return {
        code: 'NETWORK_ERROR',
        message: error.message,
        userFriendlyMessage: 'Network connection failed. Please check your internet connection and try again.',
      };
    }

    // Insufficient funds
    if (error.message?.includes('insufficient funds') || error.code === 'INSUFFICIENT_FUNDS') {
      return {
        code: 'INSUFFICIENT_FUNDS',
        message: error.message,
        userFriendlyMessage: 'Insufficient balance to complete this transaction. Please check your wallet balance.',
      };
    }

    // Gas estimation errors
    if (error.message?.includes('gas') || error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      return {
        code: 'GAS_ERROR',
        message: error.message,
        userFriendlyMessage: 'Unable to estimate transaction fees. The transaction may fail or the network may be congested.',
      };
    }

    // Invalid address
    if (error.message?.includes('invalid address') || error.code === 'INVALID_ARGUMENT') {
      return {
        code: 'INVALID_ADDRESS',
        message: error.message,
        userFriendlyMessage: 'Invalid wallet address. Please check the recipient address and try again.',
      };
    }

    // Transaction reverted
    if (error.message?.includes('reverted') || error.code === 'CALL_EXCEPTION') {
      return {
        code: 'TRANSACTION_REVERTED',
        message: error.message,
        userFriendlyMessage: 'Transaction was rejected by the blockchain. This may be due to smart contract conditions or network issues.',
      };
    }

    // Rate limiting
    if (error.message?.includes('rate limit') || error.status === 429) {
      return {
        code: 'RATE_LIMITED',
        message: error.message,
        userFriendlyMessage: 'Too many requests. Please wait a moment before trying again.',
      };
    }

    // Generic blockchain error
    return {
      code: 'BLOCKCHAIN_ERROR',
      message: error.message || 'Unknown blockchain error',
      userFriendlyMessage: 'A blockchain error occurred. Please try again later or contact support if the problem persists.',
    };
  }

  static handleWalletError(error: any): ErrorResponse {
    console.error('Wallet error:', error);

    if (error.message?.includes('Wallet not found')) {
      return {
        code: 'WALLET_NOT_FOUND',
        message: error.message,
        userFriendlyMessage: 'Wallet not found. Please ensure you have created a wallet first.',
      };
    }

    if (error.message?.includes('private key')) {
      return {
        code: 'PRIVATE_KEY_ERROR',
        message: 'Private key access error',
        userFriendlyMessage: 'Unable to access wallet credentials. Please try again or contact support.',
      };
    }

    return {
      code: 'WALLET_ERROR',
      message: error.message || 'Unknown wallet error',
      userFriendlyMessage: 'A wallet error occurred. Please try again later.',
    };
  }

  static handleAuthError(error: any): ErrorResponse {
    console.error('Auth error:', error);

    if (error.message?.includes('Unauthorized')) {
      return {
        code: 'UNAUTHORIZED',
        message: error.message,
        userFriendlyMessage: 'Authentication required. Please log in and try again.',
      };
    }

    if (error.message?.includes('token')) {
      return {
        code: 'INVALID_TOKEN',
        message: error.message,
        userFriendlyMessage: 'Invalid or expired verification token. Please request a new one.',
      };
    }

    return {
      code: 'AUTH_ERROR',
      message: error.message || 'Authentication error',
      userFriendlyMessage: 'Authentication failed. Please try logging in again.',
    };
  }

  static handleValidationError(error: any): ErrorResponse {
    console.error('Validation error:', error);

    return {
      code: 'VALIDATION_ERROR',
      message: error.message || 'Validation failed',
      details: error.errors || error.details,
      userFriendlyMessage: 'Invalid data provided. Please check your input and try again.',
    };
  }

  static handleDatabaseError(error: any): ErrorResponse {
    console.error('Database error:', error);

    if (error.code === '23505') { // PostgreSQL unique violation
      return {
        code: 'DUPLICATE_ERROR',
        message: 'Duplicate entry',
        userFriendlyMessage: 'This item already exists. Please try with different information.',
      };
    }

    if (error.code === '23503') { // PostgreSQL foreign key violation
      return {
        code: 'REFERENCE_ERROR',
        message: 'Referenced item not found',
        userFriendlyMessage: 'Referenced item not found. Please check your data and try again.',
      };
    }

    return {
      code: 'DATABASE_ERROR',
      message: 'Database operation failed',
      userFriendlyMessage: 'A database error occurred. Please try again later.',
    };
  }

  static handleGenericError(error: any): ErrorResponse {
    console.error('Generic error:', error);

    return {
      code: 'INTERNAL_ERROR',
      message: error.message || 'Internal server error',
      userFriendlyMessage: 'An unexpected error occurred. Please try again later or contact support.',
    };
  }

  static categorizeAndHandleError(error: any, context: string): ErrorResponse {
    // Log error with context
    console.error(`Error in ${context}:`, {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status,
    });

    // Categorize error based on context and error properties
    if (context.includes('blockchain') || context.includes('transaction')) {
      return this.handleBlockchainError(error);
    }

    if (context.includes('wallet')) {
      return this.handleWalletError(error);
    }

    if (context.includes('auth') || context.includes('verification')) {
      return this.handleAuthError(error);
    }

    if (context.includes('validation') || error.name === 'ZodError') {
      return this.handleValidationError(error);
    }

    if (error.code && typeof error.code === 'string' && error.code.startsWith('23')) {
      return this.handleDatabaseError(error);
    }

    return this.handleGenericError(error);
  }

  static createUserFriendlyResponse(error: ErrorResponse, includeDetails = false) {
    const response: any = {
      success: false,
      message: error.userFriendlyMessage,
      code: error.code,
    };

    if (includeDetails && error.details) {
      response.details = error.details;
    }

    return response;
  }

  static logError(error: any, context: string, userId?: string) {
    const logData = {
      timestamp: new Date().toISOString(),
      context,
      userId,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        status: error.status,
      },
    };

    // In production, you might want to send this to a logging service
    console.error('Structured error log:', JSON.stringify(logData, null, 2));
  }
}