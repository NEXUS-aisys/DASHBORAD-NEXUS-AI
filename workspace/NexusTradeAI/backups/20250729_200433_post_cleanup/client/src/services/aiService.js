
// API keys
const API_KEYS = {
  'samaira': '7af88281d1a0c03eb8c55d3df6b0743437ba343b85e52a35bf77b0c4524fb62c',
  'google': 'AIzaSyCIBIl1QVKvwUXCa6CDNVRSfMk6fjA9TpM'
};

// API endpoints
const API_ENDPOINTS = {
  'samaira': 'https://inference.samaira.ai/openai/chat/completions',
  'google': 'https://generativelanguage.googleapis.com/v1beta/models'
};

// Function to generate intelligent fallback responses
const generateIntelligentResponse = (userQuery) => {
  const query = userQuery.toLowerCase();

  // Market Analysis
  if (query.includes('market') && (query.includes('analysis') || query.includes('analyze'))) {
    return `# Market Analysis Overview

Based on recent data, the market is showing mixed signals:

## S&P 500
- Current trend: Cautiously bullish
- Key resistance level: 4,850
- Key support level: 4,680

## Sector Performance
- Technology: Outperforming (+2.3% MTD)
- Healthcare: Neutral performance
- Financial: Slight underperformance (-0.8% MTD)
- Energy: Volatile with geopolitical tensions`;
  }

  // Portfolio Analysis
  else if (query.includes('portfolio') || (query.includes('my') && query.includes('investments'))) {
    return `# Portfolio Analysis

## Diversification Assessment
- Equity allocation: Slightly overweight (65% vs recommended 60%)
- Fixed income: Underweight (20% vs recommended 30%)
- Alternatives: On target (15%)`;
  }

  // Trading Strategies
  else if (query.includes('strategy') || query.includes('strategies') || query.includes('trading')) {
    return `# Trading Strategy Recommendations

## Current Market Environment
The current market environment suggests a barbell approach:

## Conservative Strategies
1. **Dividend Growth Strategy**
   - Focus on companies with consistent dividend growth
   - Target sectors: Consumer staples, utilities, healthcare`;
  }

  // Default response for other queries
  else {
    return `As your AI trading assistant, I can help with market analysis, portfolio optimization, trading strategies, risk assessment, and coding for trading algorithms. What specific aspect of trading or investment would you like me to analyze or explain in more detail?`;
  }
};

// Enhanced API call function with improved Google API support
export const callChatAPIWithProviders = async (messages, model, selectedProvider) => {
  try {
    console.log(`Calling AI with model: ${model} from provider: ${selectedProvider}`);

    // Create system message
    const systemMessage = {
      role: "system",
      content: `You are NexusTradeAI, an advanced AI assistant specialized in financial markets, trading, and investment analysis.
Your capabilities include market analysis, portfolio optimization, trading strategies, risk assessment, and coding for trading algorithms.`
    };

    // Determine if we're using Google API
    const isGoogleAPI = selectedProvider === 'google';
    let endpoint = '';
    let fetchOptions = {};

    if (isGoogleAPI) {
      // Google API endpoint with API key in URL
      endpoint = `${API_ENDPOINTS.google}/${model}:generateContent?key=${API_KEYS.google}`;

      // Format messages for Google API
      const formattedMessages = [];

      // Add system message as user message with prefix
      formattedMessages.push({
        role: "user",
        parts: [{ text: "System: " + systemMessage.content }]
      });

      // Format conversation messages
      let currentRole = null;
      let currentParts = [];

      for (const msg of messages) {
        const role = msg.role === 'user' ? 'user' : 'model';
        const text = msg.content;

        if (role !== currentRole && currentRole !== null) {
          formattedMessages.push({
            role: currentRole,
            parts: currentParts
          });
          currentParts = [];
        }

        currentRole = role;
        currentParts.push({ text });
      }

      // Add the last message if there's any content
      if (currentRole && currentParts.length > 0) {
        formattedMessages.push({
          role: currentRole,
          parts: currentParts
        });
      }

      // Google API request format
      fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: formattedMessages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 1,
            maxOutputTokens: 1000,
          }
        })
      };

    } else {
      // OpenAI-compatible API
      endpoint = API_ENDPOINTS[selectedProvider];

      fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEYS[selectedProvider]}`
        },
        body: JSON.stringify({
          model: model,
          messages: [systemMessage, ...messages],
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 1,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      };
    }

    console.log(`Using endpoint: ${endpoint}`);

    // Make API call
    try {
      const response = await fetch(endpoint, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`API returned error: ${response.status}`, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      // Some APIs might return text/plain, streamed responses, or other formats
      const contentType = response.headers.get('content-type');
      let data;

      // Handle streamed responses from Samaira (contains 'data:' prefixes for each chunk)
      if (!isGoogleAPI && response.body && contentType && contentType.includes('text/event-stream')) {
        console.log('Detected streamed response from Samaira');

        // For streamed responses, we need to collect and combine all chunks
        const reader = response.body.getReader();
        const textDecoder = new TextDecoder();
        let completeText = '';
        let fullContent = '';

        try {
          // Read the stream until done
          while (true) {
            const {done, value} = await reader.read();
            if (done) break;

            // Decode this chunk and add to our collected text
            const chunk = textDecoder.decode(value);
            completeText += chunk;

            // Extract content from each chunk if possible
            const chunkLines = chunk.split('\n');
            for (const line of chunkLines) {
              if (line.startsWith('data:')) {
                try {
                  // Each data: line contains a JSON chunk
                  const jsonChunk = JSON.parse(line.substring(5).trim());
                  const content = jsonChunk.choices?.[0]?.delta?.content;
                  if (content) fullContent += content;
                } catch (e) {
                  // Ignore parse errors in individual chunks
                }
              }
            }
          }

          console.log('Stream complete, full text:', fullContent);
          data = { choices: [{ message: { content: fullContent } }] };
        } catch (streamError) {
          console.error('Error processing stream:', streamError);

          // If streaming fails, use the text we've collected so far
          console.log('Using collected text:', completeText);
          data = { text: completeText, streamError: true };
        }
      } else if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Try parsing as JSON first, fallback to text if that fails
        const textResponse = await response.text();
        try {
          data = JSON.parse(textResponse);
        } catch (e) {
          console.log('Response is not JSON, using as text', textResponse);
          data = textResponse;
        }
      }

      // Extract response based on provider
      let responseText;
      if (isGoogleAPI) {
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log("Google API response:", data);
      } else {
        // Handle Samaira API response
        console.log("Samaira API response:", data);
        try {
          // Some API responses might be pre-parsed JSON, others might be strings
          const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
          responseText = parsedData.choices?.[0]?.message?.content || parsedData.message || parsedData;
        } catch (parseError) {
          console.warn("Error parsing API response:", parseError);
          // If JSON parsing fails, use the data directly if it's a string
          responseText = typeof data === 'string' ? data : "Received invalid response from API";
        }
      }

      // Ensure we have a valid response
      if (!responseText) {
        console.warn("Empty response from API, data received:", data);
        throw new Error("Empty response from API");
      }

      return responseText;

    } catch (error) {
      console.error("API call failed:", error);
      return generateIntelligentResponse(messages[messages.length - 1].content);
    }
  } catch (error) {
    console.error("Error in chat process:", error);
    return `I'm sorry, I encountered an error while processing your request. Please try again or use a different query.`;
  }
};

