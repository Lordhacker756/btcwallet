import {useState, useCallback} from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';

const useSecureStorage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const storeData = useCallback(async (key: string, value: string) => {
    setLoading(true);
    setError(null);
    try {
      await EncryptedStorage.setItem(key, value);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to store data');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getData = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const value = await EncryptedStorage.getItem(key);
      return value;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeData = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      await EncryptedStorage.removeItem(key);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove data');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    storeData,
    getData,
    removeData,
  };
};

export default useSecureStorage;
