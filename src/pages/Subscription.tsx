import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check, CreditCard, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createContext, useContext } from 'react';

// Define the subscription context type with hasValidSubscription
type SubscriptionContextType = {
  hasValidSubscription: boolean;
  remainingScans: number;
  subscriptionStatus: 'none' | 'trial' | 'subscribed';
  startTrial: () => Promise<void>;
  subscribe: () => Promise<void>;
  setShouldShowSubscription: (show: boolean) => void;
};

// Create the context with default values
const SubscriptionContext = createContext<SubscriptionContextType>({
  hasValidSubscription: false,
  remainingScans: 0,
  subscriptionStatus: 'none',
  startTrial: async () => {},
  subscribe: async () => {},
  setShouldShowSubscription: () => {}
});

// Export the hook with proper typing
export const useSubscription = () => useContext(SubscriptionContext);

const Subscription = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    subscriptionStatus,
    startTrial,
    subscribe,
    setShouldShowSubscription,
    hasValidSubscription // Now properly included in the context
  } = useSubscription();

  const [showCloseButton, setShowCloseButton] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCloseButton(true);
    }, 60000); // Show close button after 60 seconds

    return () => clearTimeout(timer);
  }, []);

  const handlePricingAction = async (action: 'trial' | 'subscribe') => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);
    try {
      if (action === 'trial') {
        await startTrial();
      } else {
        await subscribe();
      }
      navigate('/');
    } catch (error) {
      console.error('Subscription action failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShouldShowSubscription(false);
    navigate('/');
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl font-bold">Upgrade Your VisionAI Experience</h1>
          <p className="text-muted-foreground mt-2">
            Unlock unlimited scanning capabilities with our premium plans
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Trial Plan */}
          <Card className="border-2 border-brand-200 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl">Free Trial</CardTitle>
              <CardDescription>Perfect for trying out VisionAI</CardDescription>
              <div className="mt-4 text-3xl font-bold">
                Free <span className="text-base text-muted-foreground">/14 days</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  'Unlimited scans for 14 days',
                  'Basic item information',
                  'Scan history',
                ].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check size={18} className="text-green-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handlePricingAction('trial')}
                disabled={isSubmitting || subscriptionStatus !== 'none'}
                className="w-full hover:scale-105 hover:shadow-md transition-all"
              >
                {subscriptionStatus === 'trial'
                  ? 'Active'
                  : isSubmitting
                  ? 'Processing...'
                  : 'Start Free Trial'}
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-brand-600 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <CardHeader>
              <CardTitle className="text-xl">Premium</CardTitle>
              <CardDescription>For unlimited scanning capabilities</CardDescription>
              <div className="mt-4 text-3xl font-bold">
                R189.99 <span className="text-base text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  'Unlimited scans',
                  'Detailed item information',
                  'Priority processing',
                  'Advanced analytics',
                  'Cloud storage for scans',
                ].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check size={18} className="text-green-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handlePricingAction('subscribe')}
                disabled={isSubmitting || subscriptionStatus === 'subscribed'}
                className="w-full bg-brand-600 hover:bg-brand-700 hover:scale-105 hover:shadow-md transition-all text-white"
              >
                <CreditCard className="mr-2" size={18} />
                {subscriptionStatus === 'subscribed'
                  ? 'Active'
                  : isSubmitting
                  ? 'Processing...'
                  : 'Subscribe Now'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {showCloseButton && (
          <div className="mt-10 text-center animate-fade-in">
            <Button
              variant="outline"
              onClick={handleClose}
              className="hover:scale-105 transition-all"
            >
              <X className="mr-2" size={16} />
              Maybe Later
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Subscription;
