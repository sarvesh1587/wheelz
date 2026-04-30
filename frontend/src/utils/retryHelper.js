// Utility function to retry failed requests
export const retryRequest = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// Check internet connection
export const isOnline = () => {
  return navigator.onLine;
};

// Show connection status
export const showConnectionStatus = () => {
  if (!navigator.onLine) {
    toast.error("No internet connection. Please check your network.");
    return false;
  }
  return true;
};
