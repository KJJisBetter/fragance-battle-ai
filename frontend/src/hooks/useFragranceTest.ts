import { useState, useCallback } from 'react';
import { CategoryBattle } from '@/types/fragrance';
import api from '@/utils/api';

interface TestSelections {
  [category: string]: string[];
}

export const useFragranceTest = () => {
  const [selections, setSelections] = useState<TestSelections>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createSession = useCallback(async (sessionName?: string) => {
    try {
      setLoading(true);
      const response = await api.post('/testing/session', {
        sessionName: sessionName || `Fragrance Battle ${new Date().toLocaleDateString()}`,
        isBlindTest: true
      });
      setSessionId(response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('Failed to create test session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSelection = useCallback((category: string, selectedIds: string[]) => {
    setSelections(prev => ({
      ...prev,
      [category]: selectedIds
    }));
  }, []);

  const saveResults = useCallback(async (battleData: CategoryBattle[]) => {
    if (!sessionId) {
      throw new Error('No active session');
    }

    try {
      setLoading(true);

      // Save each category's results
      const promises = Object.entries(selections).map(([category, selectedIds]) => {
        const battleConfig = battleData.find(b => b.category === category);
        if (battleConfig && selectedIds.length > 0) {
          return api.post(`/testing/session/${sessionId}/result`, {
            category,
            selectedFragrances: selectedIds,
            maxSelections: battleConfig.maxSelections
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      await api.post(`/testing/session/${sessionId}/complete`);

      return sessionId;
    } catch (error) {
      console.error('Failed to save results:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sessionId, selections]);

  const resetTest = useCallback(() => {
    setSelections({});
    setSessionId(null);
  }, []);

  return {
    selections,
    sessionId,
    loading,
    createSession,
    updateSelection,
    saveResults,
    resetTest
  };
};
