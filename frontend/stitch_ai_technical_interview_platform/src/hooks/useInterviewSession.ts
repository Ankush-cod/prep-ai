// src/hooks/useInterviewSession.ts
import { useApp } from '../context/AppContext';

export const useInterviewSession = () => {
  const { activeInterviewConfig, setActiveInterviewConfig } = useApp();
  return {
    config: activeInterviewConfig,
    setConfig: setActiveInterviewConfig,
  };
};
