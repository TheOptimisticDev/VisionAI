
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

type SubscriptionStatus = 'none' | 'trial' | 'subscribed';

type SubscriptionContextType = {
  subscriptionStatus: SubscriptionStatus;
  remainingScans: number;
  isSubscriptionLoading: boolean;
  decrementScans: () => void;
  startTrial: () => Promise<void>;
  subscribe: () => Promise<void>;
  shouldShowSubscription: boolean;
  setShouldShowSubscription: (value: boolean) => void;
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscriptionStatus: 'none',
  remainingScans: 2,
  isSubscriptionLoading: true,
  decrementScans: () => {},
  startTrial: async () => {},
  subscribe: async () => {},
  shouldShowSubscription: false,
  setShouldShowSubscription: () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('none');
  const [remainingScans, setRemainingScans] = useState(2);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const [shouldShowSubscription, setShouldShowSubscription] = useState(false);

  // Fetch subscription status when user changes
  useEffect(() => {
    const fetchSubscriptionStatus = async (user: User) => {
      setIsSubscriptionLoading(true);
      try {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          
          if (userData.subscriptionStatus) {
            setSubscriptionStatus(userData.subscriptionStatus);
            
            // Check if trial period has expired
            if (userData.subscriptionStatus === 'trial' && userData.trialEndDate) {
              const trialEndDate = userData.trialEndDate.toDate();
              if (trialEndDate < new Date()) {
                // Trial expired, update to none
                setSubscriptionStatus('none');
                await setDoc(userRef, { subscriptionStatus: 'none' }, { merge: true });
              }
            }
          }
          
          if (userData.remainingScans !== undefined) {
            setRemainingScans(userData.remainingScans);
          } else if (!userData.subscriptionStatus || userData.subscriptionStatus === 'none') {
            // Initialize remaining scans for non-subscribed users
            setRemainingScans(2);
            await setDoc(userRef, { remainingScans: 2 }, { merge: true });
          }
        } else {
          // Create user document if it doesn't exist
          await setDoc(userRef, {
            email: user.email,
            subscriptionStatus: 'none',
            remainingScans: 2,
            createdAt: Timestamp.now()
          });
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription status",
          variant: "destructive",
        });
      } finally {
        setIsSubscriptionLoading(false);
      }
    };

    if (currentUser) {
      fetchSubscriptionStatus(currentUser);
    } else {
      setSubscriptionStatus('none');
      setRemainingScans(2);
      setIsSubscriptionLoading(false);
    }
  }, [currentUser, toast]);

  const decrementScans = async () => {
    if (subscriptionStatus !== 'none' || !currentUser) {
      return; // Only decrement for non-subscribed users
    }
    
    const newRemainingScans = remainingScans - 1;
    setRemainingScans(newRemainingScans);
    
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { remainingScans: newRemainingScans }, { merge: true });
        
        if (newRemainingScans <= 0) {
          setShouldShowSubscription(true);
        }
      } catch (error) {
        console.error('Error updating remaining scans:', error);
      }
    }
  };

  const startTrial = async () => {
    if (!currentUser) return;
    
    try {
      setIsSubscriptionLoading(true);
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial
      
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        subscriptionStatus: 'trial',
        trialStartDate: Timestamp.now(),
        trialEndDate: Timestamp.fromDate(trialEndDate),
      }, { merge: true });
      
      setSubscriptionStatus('trial');
      setShouldShowSubscription(false);
      
      toast({
        title: "Trial Started",
        description: "Your 14-day free trial has been activated!",
      });
    } catch (error) {
      console.error('Error starting trial:', error);
      toast({
        title: "Error",
        description: "Failed to start trial",
        variant: "destructive",
      });
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  const subscribe = async () => {
    if (!currentUser) return;
    
    try {
      setIsSubscriptionLoading(true);
      
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        subscriptionStatus: 'subscribed',
        subscriptionDate: Timestamp.now(),
      }, { merge: true });
      
      setSubscriptionStatus('subscribed');
      setShouldShowSubscription(false);
      
      toast({
        title: "Subscription Activated",
        description: "You now have unlimited scans!",
      });
    } catch (error) {
      console.error('Error processing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to process subscription",
        variant: "destructive",
      });
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  const value = {
    subscriptionStatus,
    remainingScans,
    isSubscriptionLoading,
    decrementScans,
    startTrial,
    subscribe,
    shouldShowSubscription,
    setShouldShowSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
