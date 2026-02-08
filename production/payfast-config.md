# PayFast Integration Setup Guide

## 🚀 Quick Setup Steps

### 1. Sign Up for PayFast Account
- Go to https://www.payfast.co.za/registration/
- Choose account type (Individual/Business)
- Complete verification process

### 2. Get Your Credentials

#### Sandbox (Testing)
Already configured in the code:
- Merchant ID: `10000100`
- Merchant Key: `46f0cd694581a`
- Passphrase: `jt7NOE43FZPn`
- Test URL: https://sandbox.payfast.co.za/eng/process

#### Production (Live)
After PayFast approval, you'll receive:
- Merchant ID: `YOUR_MERCHANT_ID`
- Merchant Key: `YOUR_MERCHANT_KEY`
- Passphrase: `YOUR_PASSPHRASE` (set in PayFast dashboard)

### 3. Update Configuration

Edit `/js/payfast-integration.js`:

```javascript
// Change this section with your real credentials
production: {
  merchantId: 'YOUR_MERCHANT_ID',
  merchantKey: 'YOUR_MERCHANT_KEY',
  passphrase: 'YOUR_PASSPHRASE',
  url: 'https://www.payfast.co.za/eng/process',
  debug: false
}

// Change environment when ready
const ENVIRONMENT = 'production'; // Change from 'sandbox'
```

### 4. Website Requirements

#### For Testing (Sandbox):
- Can work on localhost
- Use test credit card numbers from PayFast documentation
- Test cards: https://developers.payfast.co.za/docs#test_cards

#### For Production:
✅ **Website MUST be live with:**
- HTTPS enabled (SSL certificate)
- Public domain name
- Return URLs accessible
- ITN (Instant Transaction Notification) endpoint

### 5. Required URLs

Update these in the code to match your domain:

```javascript
'return_url': 'https://yourdomain.com/thank-you.html',
'cancel_url': 'https://yourdomain.com/sponsor-a-jersey.html',
'notify_url': 'https://yourdomain.com/api/payfast-notify'
```

### 6. ITN (Instant Transaction Notification) Setup

You'll need a server endpoint to receive payment notifications. Example Node.js/Express:

```javascript
app.post('/api/payfast-notify', (req, res) => {
  // Validate ITN data
  // Update database with payment status
  // Send confirmation email
  res.send('OK');
});
```

## 📝 Deployment Options

### Option 1: GitHub Pages (Static - Limited)
- ✅ Good for: Basic payment redirect
- ❌ Cannot handle: ITN callbacks, server-side validation
- Deploy: Push to GitHub, enable Pages

### Option 2: Netlify/Vercel (Better)
- ✅ Good for: Static site + serverless functions
- ✅ Can handle: ITN with serverless functions
- Deploy: Connect GitHub repo, auto-deploy

### Option 3: Full Server (Best)
- ✅ Complete control over payment flow
- ✅ Database integration
- ✅ Full ITN handling
- Options: Heroku, DigitalOcean, AWS

## 🧪 Testing Checklist

### Sandbox Testing:
- [ ] Test single payment (R350)
- [ ] Test recurring payment
- [ ] Test different amounts
- [ ] Test cancel flow
- [ ] Test success flow
- [ ] Check thank-you page redirect

### Before Going Live:
- [ ] SSL certificate installed
- [ ] Production credentials configured
- [ ] ITN endpoint working
- [ ] Return URLs correct
- [ ] Email notifications working
- [ ] Database recording payments
- [ ] Error handling in place

## 🔒 Security Notes

1. **Never expose credentials in frontend code**
   - Use environment variables
   - Server-side configuration

2. **Validate all ITN requests**
   - Check signature
   - Verify source IP
   - Validate amounts

3. **Use HTTPS everywhere**
   - All pages
   - All API endpoints
   - All redirects

## 📞 PayFast Support

- Documentation: https://developers.payfast.co.za/
- Support: support@payfast.co.za
- Phone: 0861 PAYFAST (7293278)

## 🎯 Next Steps

1. **Test in Sandbox** ✅
   - Current code is ready for sandbox testing
   - No live domain needed

2. **Deploy to staging**
   - Choose hosting platform
   - Set up domain
   - Install SSL

3. **Apply for Production**
   - Submit to PayFast for approval
   - Complete compliance requirements
   - Get production credentials

4. **Go Live**
   - Update credentials
   - Switch to production mode
   - Monitor first transactions

---

## Quick Test URLs

### Sandbox Testing:
```
https://sandbox.payfast.co.za/eng/process
```

### Test Cards:
- Successful payment: Use sandbox interface
- Failed payment: Cancel at payment screen

### Merchant Login:
- Sandbox: https://sandbox.payfast.co.za/
- Production: https://www.payfast.co.za/