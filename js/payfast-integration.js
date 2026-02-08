/**
 * PayFast Payment Integration for Fudumala
 * Handles secure payment processing for jersey sponsorships
 */

// PayFast Configuration
const PAYFAST_CONFIG = {
  // SANDBOX SETTINGS (for testing)
  sandbox: {
    merchantId: '10000100',
    merchantKey: '46f0cd694581a',
    passphrase: 'jt7NOE43FZPn', // Default sandbox passphrase
    url: 'https://sandbox.payfast.co.za/eng/process',
    debug: true
  },
  
  // PRODUCTION SETTINGS (update with your real credentials)
  production: {
    merchantId: 'YOUR_MERCHANT_ID', // Replace with your PayFast Merchant ID
    merchantKey: 'YOUR_MERCHANT_KEY', // Replace with your PayFast Merchant Key
    passphrase: 'YOUR_PASSPHRASE', // Replace with your PayFast passphrase
    url: 'https://www.payfast.co.za/eng/process',
    debug: false
  }
};

// Set environment (change to 'production' when going live)
const ENVIRONMENT = 'sandbox'; // Change to 'production' when ready
const config = PAYFAST_CONFIG[ENVIRONMENT];

/**
 * Generate MD5 signature for PayFast
 * @param {Object} data - Payment data object
 * @returns {string} - MD5 signature
 */
function generateSignature(data) {
  // Create parameter string
  let paramString = '';
  for (let key in data) {
    if (data.hasOwnProperty(key) && data[key] !== '') {
      paramString += `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, '+')}&`;
    }
  }
  
  // Remove last ampersand
  paramString = paramString.slice(0, -1);
  
  // Add passphrase if exists
  if (config.passphrase) {
    paramString += `&passphrase=${config.passphrase}`;
  }
  
  // Generate MD5 hash (you'll need an MD5 library for production)
  // For now, return empty string (PayFast sandbox doesn't require signature)
  if (ENVIRONMENT === 'sandbox') {
    return ''; // Sandbox doesn't validate signatures
  }
  
  // In production, you'd use: return md5(paramString);
  console.log('Signature string:', paramString);
  return '';
}

/**
 * Create PayFast payment form
 * @param {number} amount - Payment amount
 * @param {string} itemName - Item description
 * @param {boolean} isRecurring - Whether this is a recurring payment
 * @param {Object} customerInfo - Customer information
 * @returns {HTMLFormElement} - PayFast form element
 */
function createPayFastForm(amount, itemName, isRecurring = false, customerInfo = {}) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = config.url;
  form.acceptCharset = 'utf-8';
  
  // Payment data
  const paymentData = {
    // Merchant details
    'merchant_id': config.merchantId,
    'merchant_key': config.merchantKey,
    
    // Buyer details
    'name_first': customerInfo.firstName || '',
    'name_last': customerInfo.lastName || '',
    'email_address': customerInfo.email || '',
    'cell_number': customerInfo.cellNumber || '',
    
    // Transaction details
    'm_payment_id': generatePaymentId(),
    'amount': amount.toFixed(2),
    'item_name': itemName,
    'item_description': `Fudumala School Jersey Sponsorship - ${itemName}`,
    
    // Transaction options
    'email_confirmation': '1',
    'confirmation_address': customerInfo.email || '',
    
    // Return URLs (update these to your actual domain)
    'return_url': `${window.location.origin}/thank-you.html`,
    'cancel_url': `${window.location.origin}/sponsor-a-jersey.html`,
    'notify_url': `${window.location.origin}/api/payfast-notify`, // You'll need a server endpoint for this
  };
  
  // Add recurring billing fields if needed
  if (isRecurring) {
    Object.assign(paymentData, {
      'subscription_type': '1', // Subscription
      'recurring_amount': amount.toFixed(2),
      'frequency': '3', // Monthly
      'cycles': '0', // Indefinite
    });
  }
  
  // Generate signature
  const signature = generateSignature(paymentData);
  if (signature) {
    paymentData['signature'] = signature;
  }
  
  // Add all fields to form
  Object.keys(paymentData).forEach(key => {
    if (paymentData[key] !== '') {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = paymentData[key];
      form.appendChild(input);
    }
  });
  
  return form;
}

/**
 * Generate unique payment ID
 * @returns {string} - Unique payment ID
 */
function generatePaymentId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `FUDUMALA_${timestamp}_${random}`;
}

/**
 * Process PayFast payment
 * @param {Object} paymentDetails - Payment details object
 */
function processPayFastPayment(paymentDetails) {
  const {
    amount,
    packageType,
    isRecurring,
    customerInfo
  } = paymentDetails;
  
  // Validate amount
  if (!amount || amount <= 0) {
    alert('Invalid payment amount');
    return;
  }
  
  // Create item name
  const itemName = `${packageType} Jersey${amount >= 350 ? ' Pack' : ''}${isRecurring ? ' (Monthly)' : ''}`;
  
  // Show loading state
  const submitButton = document.querySelector('.sponsor-btn.active');
  if (submitButton) {
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;
  }
  
  // Create and submit form
  const form = createPayFastForm(amount, itemName, isRecurring, customerInfo);
  
  // Add form to body and submit
  document.body.appendChild(form);
  
  if (config.debug) {
    console.log('PayFast Form Data:');
    const formData = new FormData(form);
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    // In debug mode, ask for confirmation
    if (confirm('Submit to PayFast sandbox?')) {
      form.submit();
    } else {
      document.body.removeChild(form);
      if (submitButton) {
        submitButton.textContent = 'Sponsor Now';
        submitButton.disabled = false;
      }
    }
  } else {
    form.submit();
  }
}

/**
 * Initialize PayFast integration
 */
function initPayFast() {
  console.log(`PayFast Integration initialized in ${ENVIRONMENT} mode`);
  
  // Update sponsor buttons to use PayFast
  document.querySelectorAll('.sponsor-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get payment details from button
      const packageElement = this.closest('.layout240_item');
      const priceElement = packageElement.querySelector('.text-style-eyebrow');
      const packageTitle = packageElement.querySelector('.heading-style-h4').textContent;
      
      // Extract price
      const priceText = priceElement.textContent;
      const amount = parseFloat(priceText.replace(/[^0-9]/g, ''));
      
      // Check if recurring is selected
      const isRecurring = packageElement.querySelector('.payment-option.recurring.active') !== null;
      
      // Get package type
      let packageType = 'Single';
      if (packageTitle.includes('School')) {
        packageType = 'School';
      } else if (packageTitle.includes('Community')) {
        packageType = 'Community';
      }
      
      // You could add a form to collect customer info here
      // For now, we'll use empty customer info
      const customerInfo = {
        firstName: '',
        lastName: '',
        email: '',
        cellNumber: ''
      };
      
      // Process payment
      processPayFastPayment({
        amount: amount,
        packageType: packageType,
        isRecurring: isRecurring,
        customerInfo: customerInfo
      });
    });
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPayFast);
} else {
  initPayFast();
}

// Export for use in other scripts
window.PayFastIntegration = {
  processPayment: processPayFastPayment,
  setEnvironment: function(env) {
    if (PAYFAST_CONFIG[env]) {
      ENVIRONMENT = env;
      config = PAYFAST_CONFIG[env];
      console.log(`PayFast environment changed to ${env}`);
    }
  },
  getConfig: function() {
    return config;
  }
};