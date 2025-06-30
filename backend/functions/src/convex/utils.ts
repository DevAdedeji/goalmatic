import { ConvexHttpClient } from 'convex/browser';
import { is_dev } from '../init';

// Initialize Convex client based on environment
export const getConvexClient = () => {
  const convexUrl = is_dev 
    ? process.env.CONVEX_DEV_URL 
    : process.env.CONVEX_PROD_URL;
  
  console.log('Environment:', { 
    NODE_ENV: process.env.NODE_ENV, 
    is_dev, 
    CONVEX_DEV_URL: process.env.CONVEX_DEV_URL ? 'configured' : 'not configured',
    CONVEX_PROD_URL: process.env.CONVEX_PROD_URL ? 'configured' : 'not configured'
  });
  
  if (!convexUrl) {
    throw new Error(`Convex URL not configured for environment: ${process.env.NODE_ENV}. Please set ${is_dev ? 'CONVEX_DEV_URL' : 'CONVEX_PROD_URL'}`);
  }
  
  return new ConvexHttpClient(convexUrl);
};

// Convert Firebase Timestamp to Unix timestamp
export const convertTimestamp = (timestamp: any): number => {
  if (timestamp && timestamp._seconds) {
    return timestamp._seconds * 1000;
  }
  if (timestamp && timestamp.toMillis) {
    return timestamp.toMillis();
  }
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }
  return Date.now();
}; 