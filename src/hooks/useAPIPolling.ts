import { useState, useEffect } from 'react';
import { interval, Observable, Subscription, EMPTY } from 'rxjs';
import { switchMap, startWith, catchError } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

/**
 * Defines the shape of the data returned by the hook.
 */
interface UseApiPollingResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook to poll an API every specified interval and return the data stream.
 *
 * @param apiUrl - The API endpoint to fetch data from.
 * @param intervalMs - Polling interval in milliseconds. Defaults to 10000ms (10 seconds).
 * @returns An object containing the latest data, loading state, and any error encountered.
 */
function useApiPolling<T = unknown>(apiUrl: string, intervalMs: number = 10000): UseApiPollingResult<T> {
  const [data, setData] = useState<T | null>(null);        // Holds the latest data from the API
  const [loading, setLoading] = useState<boolean>(true);  // Indicates if the data is being loaded
  const [error, setError] = useState<Error | null>(null);  // Holds any error encountered during fetching

  useEffect(() => {
    // Create an observable that emits every 'intervalMs' milliseconds
    const polling$: Observable<T> = interval(intervalMs).pipe(
      // Start immediately without waiting for the first interval
      startWith(0),
      // For each emission, switch to a new AJAX request
      switchMap(() =>
        ajax.getJSON<T>(apiUrl).pipe(
          catchError((err) => {
            // Handle errors and pass them down the stream
            setError(err instanceof Error ? err : new Error('Unknown error'));
            // Return EMPTY to keep the stream alive
            return EMPTY;
          })
        )
      )
    );

    // Subscribe to the polling observable
    const subscription: Subscription = polling$.subscribe({
      next: (response: T) => {
        setData(response);
        setLoading(false);
        setError(null); // Reset error on successful fetch
      },
      error: (err: Error | string) => {
        // This block will rarely be called because errors are caught above
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      },
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, [apiUrl, intervalMs]); // Re-run effect if apiUrl or intervalMs changes

  return { data, loading, error };
}

export default useApiPolling;