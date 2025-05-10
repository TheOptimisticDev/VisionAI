
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { getUserHistory, ScanHistory } from '@/services/historyService';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const History = () => {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser) return;
      
      try {
        const userHistory = await getUserHistory(currentUser.uid);
        setHistory(userHistory);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser]);

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Scan History</h1>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    <Skeleton className="w-16 h-16 rounded-md" />
                    <div className="ml-4 flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : history.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-medium">No scan history</h3>
              <p className="text-muted-foreground mt-2">
                Your scan history will appear here once you've scanned some items.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-20 h-20 flex-shrink-0">
                      <img 
                        src={item.imageUrl} 
                        alt={item.itemName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex-1">
                      <h3 className="font-medium">{item.itemName}</h3>
                      <div className="flex items-center justify-between mt-1 text-sm text-muted-foreground">
                        <span>
                          {format(item.timestamp.toDate(), 'MMM dd, yyyy - HH:mm')}
                        </span>
                        <span>
                          {Math.round(item.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default History;
