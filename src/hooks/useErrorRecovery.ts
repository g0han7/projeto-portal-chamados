import { useState, useCallback, useEffect } from 'react';

interface ErrorRecoveryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  isRecovering: boolean;
}

interface UseErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onRecovery?: () => void;
}

/**
 * Hook for handling error recovery in components
 */
export function useErrorRecovery(options: UseErrorRecoveryOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onRecovery
  } = options;

  const [state, setState] = useState<ErrorRecoveryState>({
    hasError: false,
    error: null,
    retryCount: 0,
    isRecovering: false
  });

  const handleError = useCallback((error: Error) => {
    console.error('Error caught by useErrorRecovery:', error);
    
    setState(prev => ({
      ...prev,
      hasError: true,
      error,
      retryCount: prev.retryCount + 1
    }));

    onError?.(error);
  }, [onError]);

  const retry = useCallback(async () => {
    if (state.retryCount >= maxRetries) {
      console.warn('Max retries exceeded');
      return false;
    }

    setState(prev => ({
      ...prev,
      isRecovering: true
    }));

    // Wait for retry delay
    await new Promise(resolve => setTimeout(resolve, retryDelay));

    setState(prev => ({
      ...prev,
      hasError: false,
      error: null,
      isRecovering: false
    }));

    onRecovery?.();
    return true;
  }, [state.retryCount, maxRetries, retryDelay, onRecovery]);

  const reset = useCallback(() => {
    setState({
      hasError: false,
      error: null,
      retryCount: 0,
      isRecovering: false
    });
  }, []);

  const canRetry = state.retryCount < maxRetries;

  return {
    ...state,
    handleError,
    retry,
    reset,
    canRetry
  };
}

/**
 * Hook for wrapping async operations with error recovery
 */
export function useAsyncWithRecovery<T>(
  asyncFn: () => Promise<T>,
  dependencies: any[] = [],
  options: UseErrorRecoveryOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const errorRecovery = useErrorRecovery(options);

  const execute = useCallback(async () => {
    if (errorRecovery.isRecovering) return;

    setLoading(true);
    try {
      const result = await asyncFn();
      setData(result);
      errorRecovery.reset();
    } catch (error) {
      errorRecovery.handleError(error as Error);
    } finally {
      setLoading(false);
    }
  }, [asyncFn, errorRecovery]);

  const retryExecution = useCallback(async () => {
    const canRetry = await errorRecovery.retry();
    if (canRetry) {
      execute();
    }
  }, [errorRecovery.retry, execute]);

  useEffect(() => {
    execute();
  }, dependencies);

  return {
    data,
    loading,
    error: errorRecovery.error,
    hasError: errorRecovery.hasError,
    retryCount: errorRecovery.retryCount,
    isRecovering: errorRecovery.isRecovering,
    canRetry: errorRecovery.canRetry,
    retry: retryExecution,
    reset: errorRecovery.reset
  };
}

export default useErrorRecovery;