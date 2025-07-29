const axios = require('axios');
const { sendLLMRequest } = require('./llmService');


/**
 * Generate AI trading signals based on real-time data
 * @param {string} symbol - The symbol to analyze
 * @returns {Promise<Object>} - The AI trading signal
 */
async function generateAISignal(symbol) {
  try {
      // Demo data since Yahoo Finance is removed
  const marketData = {

    // Create a message for the LLM
    const message = `Analyze the following market data for ${symbol}: Price ${marketData.price}, Volume ${marketData.volume}, Day High ${marketData.dayHigh}, Day Low ${marketData.dayLow}. Provide a signal with direction, confidence level, and supporting analysis.`;

    // Request analysis from the LLM
    const analysis = await sendLLMRequest('openai', 'gpt-3.5-turbo', message);

    // Process LLM analysis into structured signal
    return {
      symbol: symbol.toUpperCase(),
      timestamp: new Date().toISOString(),
      analysis,  // Include raw LLM response for transparency
      signal: {
        direction: analysis.includes('BUY') ? 'BUY' : 'SELL',
        confidence: parseFloat(analysis.match(/confidence\s*:\s*(\d+(\.\d+)?)/i)?.[1] || '50'),
        analysisDetails: analysis,
      },
      marketData,
    };
  } catch (error) {
    console.error('Error generating AI signal:', error);
    throw new Error('Failed to generate AI signal');
  }
}

module.exports = {
  generateAISignal,
};
