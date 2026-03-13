import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorHandler } from './ErrorHandler';

describe('ErrorHandler', () => {
  let errorHandler: any;

  beforeEach(() => {
    // Access private constructor for testing if needed, or just use getInstance
    errorHandler = ErrorHandler.getInstance();
    // Clear listeners
    (errorHandler as any).errorListeners = [];
  });

  it('should notify listeners when an error occurs', () => {
    const listener = vi.fn();
    errorHandler.addListener(listener);

    const testError = new Error('Test error');
    errorHandler.handleError(testError, 'test_context');

    expect(listener).toHaveBeenCalledWith(testError, 'test_context');
  });

  it('should wrap a function and catch errors', () => {
    const errorFn = () => {
      throw new Error('Inner error');
    };

    const listener = vi.fn();
    errorHandler.addListener(listener);

    const wrapped = errorHandler.wrap(errorFn, 'wrap_context');
    const result = wrapped();

    expect(result).toBeUndefined();
    expect(listener).toHaveBeenCalled();
  });

  it('should wrap an async function and catch errors', async () => {
    const errorAsyncFn = async () => {
      throw new Error('Async error');
    };

    const listener = vi.fn();
    errorHandler.addListener(listener);

    const wrapped = errorHandler.wrapAsync(errorAsyncFn, 'async_context');
    const result = await wrapped();

    expect(result).toBeUndefined();
    expect(listener).toHaveBeenCalled();
  });
});
