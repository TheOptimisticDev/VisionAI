import React, { createContext, useContext, useState, useEffect } from 'react';

type SubscriptionStatus = 'none' | 'trial' | 'subscribed';

type SubscriptionContextType = {
  hasValidSubscription: boolean;
  remainingScans: number;
  subscriptionStatus: SubscriptionStatus;
  startTrial: () => Promise<void>;
  subscribe: () => Promise<void>;
  setShouldShowSubscription: (show: boolean) => void;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasValidSubscription, setHasValidSubscription] = useState(false);
  const [remainingScans, setRemainingScans] = useState(5);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('none');

  const startTrial = async () => {
    setSubscriptionStatus('trial');
    setHasValidSubscription(true);
    setRemainingScans(100);
  };

  const subscribe = async () => {
    setSubscriptionStatus('subscribed');
    setHasValidSubscription(true);
    setRemainingScans(Infinity);
  };

  const setShouldShowSubscription = (show: boolean) => {
    console.log('Toggle subscription modal:', show);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        hasValidSubscription,
        remainingScans,
        subscriptionStatus,
        startTrial,
        subscribe,
        setShouldShowSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
