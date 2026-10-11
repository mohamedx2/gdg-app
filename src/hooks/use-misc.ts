import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Best-effort connectivity flag for the offline banner. */
export function useOnlineStatus(): boolean | null {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return unsubscribe;
  }, []);

  return online;
}