export const convertTimestamp = (timestamp: any): number => {
  if (timestamp && timestamp._seconds) {
    return timestamp._seconds * 1000;
  }
  if (timestamp && typeof timestamp.toMillis === 'function') {
    return timestamp.toMillis();
  }
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }
  return Date.now();
};

