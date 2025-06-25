import { useState, useEffect } from 'react';
import { UseJsonDataReturn } from '@/types/nico-dashboard';

/**
 * Custom hook for loading JSON data files with proper error handling and loading states
 * @param filename - Name of the JSON file (without extension) in src/data/
 * @returns Object containing data, loading state, and error state
 */
export const useJsonData = <T>(filename: string): UseJsonDataReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Dynamic import of JSON file
        const response = await import(`../data/${filename}.json`);
        
        // Validate that we got data
        if (!response.default) {
          throw new Error(`No data found in ${filename}.json`);
        }
        
        setData(response.default as T);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : `Failed to load ${filename}.json`;
        setError(new Error(errorMessage));
        console.error(`Error loading ${filename}.json:`, err);
      } finally {
        setLoading(false);
      }
    };

    if (filename) {
      loadData();
    }
  }, [filename]);

  return { data, loading, error };
}; 