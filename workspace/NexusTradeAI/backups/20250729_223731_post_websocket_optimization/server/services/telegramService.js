const axios = require('axios');
const config = require('../utils/config');

class TelegramService {
  constructor() {
    this.baseUrl = 'https://api.telegram.org/bot';
    this.adminConfig = {
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID,
      isEnabled: process.env.TELEGRAM_ENABLED === 'true'
    };
    this.activatedUsers = new Map(); // In production, use database
  }

  /**
   * Send a message via Telegram bot
   * @param {string} botToken - Telegram bot token
   * @param {string} chatId - Chat ID or channel username
   * @param {string} message - Message to send
   * @param {object} options - Additional options (parse_mode, etc.)
   */
  async sendMessage(botToken, chatId, message, options = {}) {
    try {
      const url = `${this.baseUrl}${botToken}/sendMessage`;
      const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        ...options
      };

      const response = await axios.post(url, payload);
      
      if (response.data.ok) {
        console.log(`Telegram message sent successfully to ${chatId}`);
        return { success: true, messageId: response.data.result.message_id };
      } else {
        console.error('Telegram API error:', response.data);
        return { success: false, error: response.data.description };
      }
    } catch (error) {
      console.error('Telegram send message error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test Telegram bot connection
   * @param {string} botToken - Telegram bot token
   * @param {string} chatId - Chat ID or channel username
   */
  async testConnection(botToken, chatId) {
    try {
      const testMessage = `🤖 <b>NexusTrade Bot Test</b>\n\n✅ Connection successful!\n⏰ ${new Date().toLocaleString()}\n\nYour Telegram notifications are now configured.`;
      
      const result = await this.sendMessage(botToken, chatId, testMessage);
      return result;
    } catch (error) {
      console.error('Telegram test connection error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send trading signal notification to all activated users
   * @param {object} signal - Trading signal object
   */
  async sendTradingSignal(signal) {
    if (!this.adminConfig.isEnabled || !this.adminConfig.botToken) {
      return { success: false, error: 'Telegram system not configured' };
    }

    const message = this.formatTradingSignal(signal);
    const results = [];

    // Send to admin first
    if (this.adminConfig.adminChatId) {
      const adminResult = await this.sendMessage(this.adminConfig.botToken, this.adminConfig.adminChatId, message);
      results.push({ type: 'admin', ...adminResult });
    }

    // Send to all activated users
    for (const [userId, userData] of this.activatedUsers) {
      if (userData.phoneNumber && userData.tradeSignals) {
        // In production, you'd use a phone-to-chat mapping service
        // For now, we'll simulate sending to users
        const userResult = await this.sendToUserByPhone(userData.phoneNumber, message);
        results.push({ type: 'user', userId, ...userResult });
      }
    }

    return { success: true, results };
  }

  /**
   * Activate user notifications
   * @param {string} userId - User ID
   * @param {string} phoneNumber - User's phone number
   */
  async activateUserNotifications(userId, phoneNumber) {
    try {
      this.activatedUsers.set(userId, {
        phoneNumber,
        tradeSignals: true,
        marketAlerts: true,
        portfolioUpdates: false,
        systemUpdates: false,
        activatedAt: new Date().toISOString()
      });

      console.log(`User ${userId} activated Telegram notifications with phone ${phoneNumber}`);
      return { success: true, message: 'Notifications activated successfully' };
    } catch (error) {
      console.error('Error activating user notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user activation status
   * @param {string} userId - User ID
   */
  async getUserActivationStatus(userId) {
    const userData = this.activatedUsers.get(userId);
    return {
      activated: !!userData,
      phoneNumber: userData?.phoneNumber || null,
      settings: userData || null
    };
  }

  /**
   * Send message to user by phone number
   * @param {string} phoneNumber - User's phone number
   * @param {string} message - Message to send
   */
  async sendToUserByPhone(phoneNumber, message) {
    // In production, you'd have a mapping service to convert phone numbers to Telegram chat IDs
    // For now, we'll simulate this
    try {
      // This is a placeholder - in reality you'd:
      // 1. Look up the user's Telegram chat ID from your database
      // 2. Send the message to that chat ID
      console.log(`Simulating sending message to phone ${phoneNumber}: ${message.substring(0, 100)}...`);
      
      return { success: true, messageId: 'simulated' };
    } catch (error) {
      console.error(`Error sending to phone ${phoneNumber}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send market alert notification
   * @param {object} alert - Market alert object
   * @param {object} userSettings - User notification settings
   */
  async sendMarketAlert(alert, userSettings) {
    if (!userSettings.telegram?.enabled || !userSettings.telegram?.marketAlerts) {
      return { success: false, error: 'Telegram notifications not enabled for market alerts' };
    }

    const { botToken, chatId } = userSettings.telegram;
    if (!botToken || !chatId) {
      return { success: false, error: 'Telegram bot not configured' };
    }

    const message = this.formatMarketAlert(alert);
    return await this.sendMessage(botToken, chatId, message);
  }

  /**
   * Send portfolio update notification
   * @param {object} portfolio - Portfolio update object
   * @param {object} userSettings - User notification settings
   */
  async sendPortfolioUpdate(portfolio, userSettings) {
    if (!userSettings.telegram?.enabled || !userSettings.telegram?.portfolioUpdates) {
      return { success: false, error: 'Telegram notifications not enabled for portfolio updates' };
    }

    const { botToken, chatId } = userSettings.telegram;
    if (!botToken || !chatId) {
      return { success: false, error: 'Telegram bot not configured' };
    }

    const message = this.formatPortfolioUpdate(portfolio);
    return await this.sendMessage(botToken, chatId, message);
  }

  /**
   * Format trading signal for Telegram
   * @param {object} signal - Trading signal object
   */
  formatTradingSignal(signal) {
    const { symbol, signal: signalType, confidence, price, target, stopLoss, strategy, timestamp } = signal;
    
    const signalEmoji = signalType === 'BUY' ? '🚀' : signalType === 'SELL' ? '📉' : '⚠️';
    const confidenceColor = confidence >= 80 ? '🟢' : confidence >= 60 ? '🟡' : '🔴';
    
    return `
${signalEmoji} <b>Trade Signal: ${symbol}</b>

📊 <b>Signal:</b> ${signalType}
💰 <b>Current Price:</b> $${price}
🎯 <b>Target:</b> $${target}
🛑 <b>Stop Loss:</b> $${stopLoss}
📈 <b>Strategy:</b> ${strategy}
${confidenceColor} <b>Confidence:</b> ${confidence}%
⏰ <b>Time:</b> ${new Date(timestamp).toLocaleString()}

<i>This is an automated trading signal. Always do your own research.</i>
    `.trim();
  }

  /**
   * Format market alert for Telegram
   * @param {object} alert - Market alert object
   */
  formatMarketAlert(alert) {
    const { symbol, type, message, price, change, timestamp } = alert;
    
    const alertEmoji = type === 'price_drop' ? '📉' : type === 'price_spike' ? '📈' : '⚠️';
    
    return `
${alertEmoji} <b>Market Alert: ${symbol}</b>

📢 <b>Alert:</b> ${message}
💰 <b>Current Price:</b> $${price}
📊 <b>Change:</b> ${change > 0 ? '+' : ''}${change}%
⏰ <b>Time:</b> ${new Date(timestamp).toLocaleString()}

<i>Market conditions may change rapidly.</i>
    `.trim();
  }

  /**
   * Format portfolio update for Telegram
   * @param {object} portfolio - Portfolio update object
   */
  formatPortfolioUpdate(portfolio) {
    const { totalValue, dailyPnL, dailyPnLPercent, topPerformers, timestamp } = portfolio;
    
    const pnlEmoji = dailyPnL >= 0 ? '📈' : '📉';
    const pnlColor = dailyPnL >= 0 ? '🟢' : '🔴';
    
    let topPerformersText = '';
    if (topPerformers && topPerformers.length > 0) {
      topPerformersText = '\n🏆 <b>Top Performers:</b>\n';
      topPerformers.forEach((performer, index) => {
        topPerformersText += `${index + 1}. ${performer.symbol}: ${performer.change > 0 ? '+' : ''}${performer.change}%\n`;
      });
    }
    
    return `
💼 <b>Portfolio Update</b>

💰 <b>Total Value:</b> $${totalValue.toLocaleString()}
${pnlEmoji} <b>Daily P&L:</b> ${pnlColor}${dailyPnL > 0 ? '+' : ''}$${dailyPnL.toLocaleString()} (${dailyPnLPercent > 0 ? '+' : ''}${dailyPnLPercent}%)
⏰ <b>Time:</b> ${new Date(timestamp).toLocaleString()}${topPerformersText}

<i>Daily portfolio performance summary</i>
    `.trim();
  }

  /**
   * Send system notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {object} userSettings - User notification settings
   */
  async sendSystemNotification(title, message, userSettings) {
    if (!userSettings.telegram?.enabled || !userSettings.telegram?.systemUpdates) {
      return { success: false, error: 'Telegram notifications not enabled for system updates' };
    }

    const { botToken, chatId } = userSettings.telegram;
    if (!botToken || !chatId) {
      return { success: false, error: 'Telegram bot not configured' };
    }

    const formattedMessage = `
🔧 <b>${title}</b>

${message}

⏰ <b>Time:</b> ${new Date().toLocaleString()}
    `.trim();

    return await this.sendMessage(botToken, chatId, formattedMessage);
  }

  /**
   * Get bot information
   * @param {string} botToken - Telegram bot token
   */
  async getBotInfo(botToken) {
    try {
      const url = `${this.baseUrl}${botToken}/getMe`;
      const response = await axios.get(url);
      
      if (response.data.ok) {
        return { success: true, bot: response.data.result };
      } else {
        return { success: false, error: response.data.description };
      }
    } catch (error) {
      console.error('Telegram get bot info error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if chat ID is valid
   * @param {string} botToken - Telegram bot token
   * @param {string} chatId - Chat ID to validate
   */
  async validateChatId(botToken, chatId) {
    try {
      const testMessage = '🔍 Validating chat ID...';
      const result = await this.sendMessage(botToken, chatId, testMessage);
      
      if (result.success) {
        // Delete the test message
        await this.deleteMessage(botToken, chatId, result.messageId);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a message
   * @param {string} botToken - Telegram bot token
   * @param {string} chatId - Chat ID
   * @param {number} messageId - Message ID to delete
   */
  async deleteMessage(botToken, chatId, messageId) {
    try {
      const url = `${this.baseUrl}${botToken}/deleteMessage`;
      await axios.post(url, { chat_id: chatId, message_id: messageId });
    } catch (error) {
      console.error('Telegram delete message error:', error);
    }
  }
}

module.exports = new TelegramService(); 