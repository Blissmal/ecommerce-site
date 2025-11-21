// // services/mpesaService.js

// const MPESA_BASE_URL = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke'; // Use production URL for live
// const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE;
// const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
// const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
// const PASSKEY = process.env.MPESA_PASSKEY;

// class MpesaService {
//   async getAccessToken() {
//     const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
//     try {
//       const response = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Basic ${credentials}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       const data = await response.json();
//       return data.access_token;
//     } catch (error) {
//       console.error('Error getting access token:', error);
//       throw error;
//     }
//   }

//   async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
//     try {
//       const accessToken = await this.getAccessToken();
//       const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
//       const password = Buffer.from(`${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`).toString('base64');

//       const payload = {
//         BusinessShortCode: BUSINESS_SHORT_CODE,
//         Password: password,
//         Timestamp: timestamp,
//         TransactionType: 'CustomerPayBillOnline',
//         Amount: amount,
//         PartyA: phoneNumber,
//         PartyB: BUSINESS_SHORT_CODE,
//         PhoneNumber: phoneNumber,
//         CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback`,
//         AccountReference: accountReference,
//         TransactionDesc: transactionDesc
//       };

//       const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error('Error initiating STK push:', error);
//       throw error;
//     }
//   }

//   async checkTransactionStatus(checkoutRequestID) {
//     try {
//       const accessToken = await this.getAccessToken();
//       const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
//       const password = Buffer.from(`${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`).toString('base64');

//       const payload = {
//         BusinessShortCode: BUSINESS_SHORT_CODE,
//         Password: password,
//         Timestamp: timestamp,
//         CheckoutRequestID: checkoutRequestID
//       };

//       const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error('Error checking transaction status:', error);
//       throw error;
//     }
//   }
// }

// export const mpesaService = new MpesaService();

// services/mpesaService.js

// const MPESA_BASE_URL = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';
// const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE;
// const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
// const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
// const PASSKEY = process.env.MPESA_PASSKEY;

// class MpesaService {
//   constructor() {
//     // Validate required environment variables
//     const requiredVars = {
//       BUSINESS_SHORT_CODE,
//       CONSUMER_KEY,
//       CONSUMER_SECRET,
//       PASSKEY
//     };

//     for (const [key, value] of Object.entries(requiredVars)) {
//       if (!value) {
//         throw new Error(`Missing required environment variable: MPESA_${key}`);
//       }
//     }
//   }

//   async getAccessToken() {
//     const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
//     try {
//       const response = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Basic ${credentials}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       if (!data.access_token) {
//         throw new Error('Failed to get access token from M-Pesa API');
//       }
      
//       return data.access_token;
//     } catch (error) {
//       console.error('Error getting access token:', error);
//       throw new Error(`Failed to get M-Pesa access token: ${error.message}`);
//     }
//   }

//   async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
//     try {
//       const accessToken = await this.getAccessToken();
//       const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
//       const password = Buffer.from(`${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`).toString('base64');

//       const payload = {
//         BusinessShortCode: BUSINESS_SHORT_CODE,
//         Password: password,
//         Timestamp: timestamp,
//         TransactionType: 'CustomerPayBillOnline',
//         Amount: Math.ceil(amount), // Ensure integer
//         PartyA: phoneNumber,
//         PartyB: BUSINESS_SHORT_CODE,
//         PhoneNumber: phoneNumber,
//         CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback`,
//         AccountReference: accountReference,
//         TransactionDesc: transactionDesc
//       };

//       console.log('STK Push Payload:', JSON.stringify(payload, null, 2));

//       const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();
//       console.log('STK Push Response:', JSON.stringify(data, null, 2));
      
//       return data;
//     } catch (error) {
//       console.error('Error initiating STK push:', error);
//       throw new Error(`Failed to initiate STK push: ${error.message}`);
//     }
//   }

//   async checkTransactionStatus(checkoutRequestID) {
//     try {
//       const accessToken = await this.getAccessToken();
//       const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
//       const password = Buffer.from(`${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`).toString('base64');

//       const payload = {
//         BusinessShortCode: BUSINESS_SHORT_CODE,
//         Password: password,
//         Timestamp: timestamp,
//         CheckoutRequestID: checkoutRequestID
//       };

//       const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(payload)
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('Transaction Status Response:', JSON.stringify(data, null, 2));
      
//       return data;
//     } catch (error) {
//       console.error('Error checking transaction status:', error);
//       throw new Error(`Failed to check transaction status: ${error.message}`);
//     }
//   }

//   // Helper method to format M-Pesa response for easier handling
//   parseTransactionStatus(mpesaResponse) {
//     if (mpesaResponse.ResponseCode === '0') {
//       return {
//         status: 'SUCCESS',
//         resultCode: mpesaResponse.ResultCode,
//         resultDesc: mpesaResponse.ResultDesc,
//         amount: null, // Will be populated from CallbackMetadata
//         mpesaReceiptNumber: null, // Will be populated from CallbackMetadata
//         transactionDate: null // Will be populated from CallbackMetadata
//       };
//     } else {
//       return {
//         status: 'FAILED',
//         resultCode: mpesaResponse.ResponseCode,
//         resultDesc: mpesaResponse.ResponseDescription || 'Transaction failed',
//         error: mpesaResponse.errorMessage
//       };
//     }
//   }
// }

// export const mpesaService = new MpesaService();

// services/mpesaService.js

const MPESA_BASE_URL = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';
const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE;
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const PASSKEY = process.env.MPESA_PASSKEY;

class MpesaService {
  constructor() {
    // Validate required environment variables
    const requiredVars = {
      BUSINESS_SHORT_CODE,
      CONSUMER_KEY,
      CONSUMER_SECRET,
      PASSKEY
    };

    for (const [key, value] of Object.entries(requiredVars)) {
      if (!value) {
        throw new Error(`Missing required environment variable: MPESA_${key}`);
      }
    }
  }

  async getAccessToken() {
    const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    try {
      const response = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('Failed to get access token from M-Pesa API');
      }
      
      return data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error(`Failed to get M-Pesa access token: ${error.message}`);
    }
  }

  getCallbackUrl() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    // For development, check if URL is accessible
    if (baseUrl && (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1'))) {
      console.warn('⚠️  Using localhost URL. M-Pesa callbacks will not work. Consider using ngrok.');
      console.warn('   Run: ngrok http 3000');
      console.warn('   Then update NEXT_PUBLIC_BASE_URL with the ngrok HTTPS URL');
      
      // For development testing, you might want to use a test webhook URL
      // Uncomment the line below if you want to use a webhook testing service
      // return 'https://webhook.site/your-unique-id';
    }
    
    return `${baseUrl}/api/mpesa/callback`;
  }

  async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
      const password = Buffer.from(`${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`).toString('base64');

      const callbackUrl = this.getCallbackUrl();

      const payload = {
        BusinessShortCode: BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount), // Ensure integer
        PartyA: phoneNumber,
        PartyB: BUSINESS_SHORT_CODE,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc
      };

      console.log('STK Push Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('STK Push Response:', JSON.stringify(data, null, 2));
      
      // Check for specific callback URL error
      if (data.errorCode === '400.002.02' || data.errorMessage?.includes('CallBackURL')) {
        throw new Error(
          `Invalid CallBackURL: ${callbackUrl}\n` +
          'For local development, use ngrok to expose your localhost:\n' +
          '1. Install ngrok: npm install -g ngrok\n' +
          '2. Run: ngrok http 3000\n' +
          '3. Copy the HTTPS URL and update NEXT_PUBLIC_BASE_URL in your .env.local'
        );
      }
      
      return data;
    } catch (error) {
      console.error('Error initiating STK push:', error);
      throw error; // Re-throw the original error with context
    }
  }

  async checkTransactionStatus(checkoutRequestID) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
      const password = Buffer.from(`${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`).toString('base64');

      const payload = {
        BusinessShortCode: BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID
      };

      const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Transaction Status Response:', JSON.stringify(data, null, 2));
      
      return data;
    } catch (error) {
      console.error('Error checking transaction status:', error);
      throw new Error(`Failed to check transaction status: ${error.message}`);
    }
  }

  // Helper method to format M-Pesa response for easier handling
  parseTransactionStatus(mpesaResponse) {
    if (mpesaResponse.ResponseCode === '0') {
      return {
        status: 'SUCCESS',
        resultCode: mpesaResponse.ResultCode,
        resultDesc: mpesaResponse.ResultDesc,
        amount: null, // Will be populated from CallbackMetadata
        mpesaReceiptNumber: null, // Will be populated from CallbackMetadata
        transactionDate: null // Will be populated from CallbackMetadata
      };
    } else {
      return {
        status: 'FAILED',
        resultCode: mpesaResponse.ResponseCode,
        resultDesc: mpesaResponse.ResponseDescription || 'Transaction failed',
        error: mpesaResponse.errorMessage
      };
    }
  }
}

export const mpesaService = new MpesaService();