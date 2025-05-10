
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { EmotionResult, PoseResult } from './aiService';

export interface ScanHistory {
  id?: string;
  userId: string;
  imageUrl: string;
  itemName: string;
  confidence: number;
  timestamp: Timestamp;
}

export const saveToHistory = async (
userId: string, imageUrl: string, itemName: string, confidence: number, emotions: EmotionResult[], poses: PoseResult[]): Promise<string> => {
  try {
    const historyRef = collection(db, 'scanHistory');
    const docRef = await addDoc(historyRef, {
      userId,
      imageUrl,
      itemName,
      confidence,
      timestamp: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving scan to history:', error);
    throw error;
  }
};

export const getUserHistory = async (userId: string): Promise<ScanHistory[]> => {
  try {
    const historyRef = collection(db, 'scanHistory');
    const q = query(
      historyRef, 
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const history: ScanHistory[] = [];
    
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      } as ScanHistory);
    });
    
    return history;
  } catch (error) {
    console.error('Error getting user history:', error);
    throw error;
  }
};
