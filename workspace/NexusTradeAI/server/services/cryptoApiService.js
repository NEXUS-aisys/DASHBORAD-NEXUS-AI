const axios = require('axios');
const crypto = require('crypto');

class CryptoApiService {
  constructor() {
    this.exchanges = {
      binance: {
        name: 'Binance',
        testEndpoint: 'https://api.binance.com/api/v3/account',
        authMethod: 'hmac'
      },
      coinbase: {
        name: 'Coinbase',
        testEndpoint: 'https://api.coinbase.com/v2/accounts',
        authMethod: 'hmac'
      },
      kraken: {
        name: 'Kraken',
        testEndpoint: 'https://api.kraken.com/0/private/Balance',
        authMethod: 'hmac'
      },
      kucoin: {
        name: 'KuCoin',
        testEndpoint: 'https://api.kucoin.com/api/v1/accounts',
        authMethod: 'hmac'
      },
      bybit: {
        name: 'Bybit',
        testEndpoint: 'https://api.bybit.com/v2/private/wallet/balance',
        authMethod: 'hmac'
      },
      okx: {
        name: 'OKX',
        testEndpoint: 'https://www.okx.com/api/v5/account/balance',
        authMethod: 'hmac'
      },
      gate: {
        name: 'Gate.io',
        testEndpoint: 'https://api.gateio.ws/api/v4/spot/accounts',
        authMethod: 'hmac'
      },
      huobi: {
        name: 'Huobi',
        testEndpoint: 'https://api.huobi.pro/v1/account/accounts',
        authMethod: 'hmac'
      }
    };
  }

  // Test API connection for a specific exchange
  async testApiConnection(exchange, apiKey, secretKey, passphrase = '') {
    try {
      const exchangeConfig = this.exchanges[exchange];
      if (!exchangeConfig) {
        throw new Error(`Unsupported exchange: ${exchange}`);
      }

      switch (exchange) {
        case 'binance':
          return await this.testBinanceApi(apiKey, secretKey);
        case 'coinbase':
          return await this.testCoinbaseApi(apiKey, secretKey);
        case 'kraken':
          return await this.testKrakenApi(apiKey, secretKey, passphrase);
        case 'kucoin':
          return await this.testKuCoinApi(apiKey, secretKey, passphrase);
        case 'bybit':
          return await this.testBybitApi(apiKey, secretKey);
        case 'okx':
          return await this.testOkxApi(apiKey, secretKey, passphrase);
        case 'gate':
          return await this.testGateApi(apiKey, secretKey);
        case 'huobi':
          return await this.testHuobiApi(apiKey, secretKey);
        default:
          throw new Error(`Exchange ${exchange} not implemented yet`);
      }
    } catch (error) {
      console.error(`Error testing ${exchange} API:`, error.message);
      return {
        success: false,
        error: error.message,
        exchange: exchange
      };
    }
  }

  // Test Binance API
  async testBinanceApi(apiKey, secretKey) {
    try {
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(queryString)
        .digest('hex');

      const response = await axios.get(
        `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`,
        {
          headers: {
            'X-MBX-APIKEY': apiKey
          },
          timeout: 10000
        }
      );

      return {
        success: true,
        data: {
          accountType: response.data.accountType,
          balances: response.data.balances.length,
          permissions: response.data.permissions
        },
        exchange: 'binance'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.msg || error.message,
        exchange: 'binance'
      };
    }
  }

  // Test Coinbase API
  async testCoinbaseApi(apiKey, secretKey) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const method = 'GET';
      const path = '/v2/accounts';
      const body = '';
      
      const message = timestamp + method + path + body;
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(message)
        .digest('hex');

      const response = await axios.get('https://api.coinbase.com/v2/accounts', {
        headers: {
          'CB-ACCESS-KEY': apiKey,
          'CB-ACCESS-SIGN': signature,
          'CB-ACCESS-TIMESTAMP': timestamp
        },
        timeout: 10000
      });

      return {
        success: true,
        data: {
          accounts: response.data.data.length,
          currency: response.data.data[0]?.currency || 'Unknown'
        },
        exchange: 'coinbase'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message,
        exchange: 'coinbase'
      };
    }
  }

  // Test Kraken API
  async testKrakenApi(apiKey, secretKey, passphrase) {
    try {
      const endpoint = '/0/private/Balance';
      const nonce = Date.now().toString();
      const postData = `nonce=${nonce}`;
      
      const signature = crypto
        .createHmac('sha256', Buffer.from(secretKey, 'base64'))
        .update(endpoint + crypto.createHash('sha256').update(postData, 'utf8').digest('binary'), 'binary')
        .digest('base64');

      const response = await axios.post('https://api.kraken.com/0/private/Balance', postData, {
        headers: {
          'API-Key': apiKey,
          'API-Sign': signature,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      });

      return {
        success: true,
        data: {
          balances: Object.keys(response.data.result || {}).length,
          currency: Object.keys(response.data.result || {})[0] || 'Unknown'
        },
        exchange: 'kraken'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.[0] || error.message,
        exchange: 'kraken'
      };
    }
  }

  // Test KuCoin API
  async testKuCoinApi(apiKey, secretKey, passphrase) {
    try {
      const timestamp = Date.now().toString();
      const method = 'GET';
      const endpoint = '/api/v1/accounts';
      const strToSign = timestamp + method + endpoint;
      
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(strToSign)
        .digest('base64');

      const passphraseSignature = crypto
        .createHmac('sha256', secretKey)
        .update(passphrase)
        .digest('base64');

      const response = await axios.get('https://api.kucoin.com/api/v1/accounts', {
        headers: {
          'KC-API-KEY': apiKey,
          'KC-API-SIGN': signature,
          'KC-API-TIMESTAMP': timestamp,
          'KC-API-PASSPHRASE': passphraseSignature
        },
        timeout: 10000
      });

      return {
        success: true,
        data: {
          accounts: response.data.data?.length || 0,
          currency: response.data.data?.[0]?.currency || 'Unknown'
        },
        exchange: 'kucoin'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.msg || error.message,
        exchange: 'kucoin'
      };
    }
  }

  // Test Bybit API
  async testBybitApi(apiKey, secretKey) {
    try {
      const timestamp = Date.now().toString();
      const recvWindow = '5000';
      const queryString = `api_key=${apiKey}&recv_window=${recvWindow}&timestamp=${timestamp}`;
      
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(queryString)
        .digest('hex');

      // Try the newer v5 API endpoint first
      const response = await axios.get(
        `https://api.bybit.com/v5/account/wallet-balance?${queryString}&sign=${signature}`,
        {
          timeout: 10000
        }
      );

      return {
        success: true,
        data: {
          result: response.data.result,
          currency: response.data.result?.list?.[0]?.coin || 'Unknown'
        },
        exchange: 'bybit'
      };
    } catch (error) {
      // If v5 fails, try v2 as fallback
      try {
        const timestamp = Date.now().toString();
        const recvWindow = '5000';
        const queryString = `api_key=${apiKey}&recv_window=${recvWindow}&timestamp=${timestamp}`;
        
        const signature = crypto
          .createHmac('sha256', secretKey)
          .update(queryString)
          .digest('hex');

        const response = await axios.get(
          `https://api.bybit.com/v2/private/wallet/balance?${queryString}&sign=${signature}`,
          {
            timeout: 10000
          }
        );

        return {
          success: true,
          data: {
            result: response.data.result,
            currency: response.data.result?.[0]?.coin || 'Unknown'
          },
          exchange: 'bybit'
        };
      } catch (fallbackError) {
        return {
          success: false,
          error: fallbackError.response?.data?.ret_msg || fallbackError.message,
          exchange: 'bybit'
        };
      }
    }
  }

  // Test OKX API
  async testOkxApi(apiKey, secretKey, passphrase) {
    try {
      const timestamp = new Date().toISOString();
      const method = 'GET';
      const requestPath = '/api/v5/account/balance';
      const body = '';
      
      const message = timestamp + method + requestPath + body;
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(message)
        .digest('base64');

      const response = await axios.get('https://www.okx.com/api/v5/account/balance', {
        headers: {
          'OK-ACCESS-KEY': apiKey,
          'OK-ACCESS-SIGN': signature,
          'OK-ACCESS-TIMESTAMP': timestamp,
          'OK-ACCESS-PASSPHRASE': passphrase
        },
        timeout: 10000
      });

      return {
        success: true,
        data: {
          result: response.data.data?.length || 0,
          currency: response.data.data?.[0]?.ccy || 'Unknown'
        },
        exchange: 'okx'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.msg || error.message,
        exchange: 'okx'
      };
    }
  }

  // Test Gate.io API
  async testGateApi(apiKey, secretKey) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const method = 'GET';
      const path = '/api/v4/spot/accounts';
      const queryString = '';
      const hashedPayload = crypto.createHash('sha512').update('').digest('hex');
      
      const signString = `${method}\n${path}\n${queryString}\n${hashedPayload}\n${timestamp}`;
      const signature = crypto
        .createHmac('sha512', secretKey)
        .update(signString)
        .digest('hex');

      const response = await axios.get('https://api.gateio.ws/api/v4/spot/accounts', {
        headers: {
          'KEY': apiKey,
          'SIGN': signature,
          'Timestamp': timestamp.toString()
        },
        timeout: 10000
      });

      return {
        success: true,
        data: {
          accounts: response.data.length,
          currency: response.data[0]?.currency || 'Unknown'
        },
        exchange: 'gate'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        exchange: 'gate'
      };
    }
  }

  // Test Huobi API
  async testHuobiApi(apiKey, secretKey) {
    try {
      const timestamp = new Date().toISOString();
      const method = 'GET';
      const host = 'api.huobi.pro';
      const path = '/v1/account/accounts';
      
      const signString = `${method}\n${host}\n${path}\n`;
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(signString)
        .digest('base64');

      const response = await axios.get('https://api.huobi.pro/v1/account/accounts', {
        headers: {
          'AccessKeyId': apiKey,
          'Signature': signature,
          'SignatureMethod': 'HmacSHA256',
          'SignatureVersion': '2',
          'Timestamp': timestamp
        },
        timeout: 10000
      });

      return {
        success: true,
        data: {
          accounts: response.data.data?.length || 0,
          type: response.data.data?.[0]?.type || 'Unknown'
        },
        exchange: 'huobi'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.err_msg || error.message,
        exchange: 'huobi'
      };
    }
  }

  // Get supported exchanges
  getSupportedExchanges() {
    return Object.keys(this.exchanges).map(key => ({
      id: key,
      name: this.exchanges[key].name,
      authMethod: this.exchanges[key].authMethod
    }));
  }
}

module.exports = new CryptoApiService(); 