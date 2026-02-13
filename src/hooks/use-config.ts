import { useState, useCallback } from 'react';
import { loadConfig, saveConfig, type BigoctoConfig } from '../core/config.js';

interface UseConfigResult {
  config: BigoctoConfig;
  updateConfig: (updater: (config: BigoctoConfig) => BigoctoConfig) => void;
  reload: () => void;
}

export function useConfig(): UseConfigResult {
  const [config, setConfig] = useState<BigoctoConfig>(() => loadConfig());

  const updateConfig = useCallback((updater: (config: BigoctoConfig) => BigoctoConfig) => {
    setConfig(prev => {
      const next = updater(prev);
      saveConfig(next);
      return next;
    });
  }, []);

  const reload = useCallback(() => {
    setConfig(loadConfig());
  }, []);

  return { config, updateConfig, reload };
}
