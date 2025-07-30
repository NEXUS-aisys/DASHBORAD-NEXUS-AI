import apiClient from '../utils/api.js';

class LogsService {
  // Get application logs
  async getLogs() {
    try {
      return await apiClient.get('/api/logs');
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      throw error;
    }
  }

  // Check logs service health
  async checkLogsHealth() {
    try {
      return await apiClient.get('/api/logs/health');
    } catch (error) {
      console.error('Failed to check logs health:', error);
      throw error;
    }
  }

  // Get logs with retry mechanism
  async getLogsWithRetry(maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.getLogs();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        console.warn(`Logs fetch attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  // Stream logs (for real-time updates)
  async streamLogs(callback, interval = 5000) {
    let isStreaming = true;
    
    const fetchAndUpdate = async () => {
      if (!isStreaming) return;
      
      try {
        const logs = await this.getLogs();
        callback(logs);
      } catch (error) {
        console.error('Error streaming logs:', error);
        callback(null, error);
      }
      
      if (isStreaming) {
        setTimeout(fetchAndUpdate, interval);
      }
    };
    
    // Start streaming
    fetchAndUpdate();
    
    // Return stop function
    return () => {
      isStreaming = false;
    };
  }
}

// Create and export singleton instance
const logsService = new LogsService();
export default logsService;
