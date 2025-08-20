# 🚀 Production Deployment Checklist for CCAvenue

## ✅ Required Changes for Production

### 1. Environment Variables
- [x] Update `NEXT_PUBLIC_BASE_URL` to `https://donate.svsamiti.com`
- [x] Update `NEXT_PUBLIC_APP_URL` to `https://donate.svsamiti.com`
- [x] Create `.env.production` file

### 2. CCAvenue Merchant Account Configuration
**⚠️ CRITICAL: You MUST configure these in your CCAvenue merchant dashboard:**

#### A. Domain Whitelisting
1. Login to CCAvenue Merchant Dashboard
2. Go to **Account Settings** → **Domain Configuration**
3. Add your production domain: `donate.svsamiti.com`
4. Ensure HTTPS is enabled
5. Save and wait for activation (may take 1-2 hours)

#### B. Callback URLs Configuration
In CCAvenue dashboard, configure these URLs:
- **Redirect URL**: `https://donate.svsamiti.com/api/ccavenue/payment-response`
- **Cancel URL**: `https://donate.svsamiti.com/api/ccavenue/payment-response`
- **Webhook URL** (if using): `https://donate.svsamiti.com/api/ccavenue/webhook`

#### C. Account Verification
1. Ensure your merchant account is **ACTIVE**
2. Verify business documents are approved
3. Check if there are any transaction limits
4. Confirm your account supports INR transactions

### 3. SSL Certificate
- [x] Ensure `https://donate.svsamiti.com` has valid SSL certificate
- [x] Verify SSL is properly configured
- [x] Test HTTPS redirect from HTTP

### 4. DNS Configuration
- [x] Ensure domain points to your production server
- [x] Verify subdomain `donate.svsamiti.com` resolves correctly

### 5. Build Configuration
Update your build process:
```bash
# For production build
npm run build

# Set environment
export NODE_ENV=production

# Start production server
npm start
```

### 6. Testing Checklist

#### Before Going Live:
1. **Test with small amount** (₹1-10) first
2. **Verify email notifications** work
3. **Check database updates** after payment
4. **Test payment failure scenarios**
5. **Verify seat booking/releasing logic**
6. **Test on different devices/browsers**

#### Domain-Specific Tests:
```bash
# Test from production domain
curl -X GET https://donate.svsamiti.com/api/validate-ccavenue

# Test payment creation
curl -X POST https://donate.svsamiti.com/api/debug-ccavenue \
  -H "Content-Type: application/json" \
  -d '{"orderId":"TEST123","amount":"10","billingName":"Test User","billingEmail":"test@example.com","billingTel":"9999999999","isIndia":true}'
```

### 7. Monitoring Setup
- Set up error monitoring (Sentry, etc.)
- Configure payment success/failure alerts
- Monitor CCAvenue transaction reports
- Set up uptime monitoring

### 8. Security Considerations
- Keep working keys secure
- Use environment variables (never commit to git)
- Enable rate limiting for APIs
- Set up CORS properly
- Implement proper input validation

## 🚨 Common Production Issues to Avoid

### Issue 1: Domain Not Whitelisted
**Symptom**: Error 1001 - Invalid Request
**Solution**: Add `donate.svsamiti.com` to CCAvenue merchant dashboard

### Issue 2: HTTP vs HTTPS Mismatch
**Symptom**: Mixed content errors, payment failures
**Solution**: Ensure all URLs use HTTPS in production

### Issue 3: Callback URL Issues
**Symptom**: Payments succeed but booking not confirmed
**Solution**: Verify callback URLs in CCAvenue dashboard match your API routes

### Issue 4: Working Key Issues
**Symptom**: Encryption/decryption errors
**Solution**: Ensure production working key is exactly 32 hex characters

## 📞 Support Contacts

### CCAvenue Support
- **Email**: support@ccavenue.com
- **Phone**: +91-22-6131-1555
- **Documentation**: https://www.ccavenue.com/shopzone/

### Emergency Checklist
If payments fail in production:
1. Check CCAvenue merchant dashboard for error codes
2. Verify domain is whitelisted
3. Check server logs for encryption errors
4. Verify SSL certificate is valid
5. Test with minimal transaction amount
6. Contact CCAvenue support with merchant ID: 116662

## 🎯 Post-Deployment Verification

After deployment, verify these URLs work:
- ✅ `https://donate.svsamiti.com/api/validate-ccavenue`
- ✅ `https://donate.svsamiti.com/api/debug-ccavenue`
- ✅ `https://donate.svsamiti.com/api/ccavenue/payment-response`
- ✅ Payment flow end-to-end

## 📝 Notes
- Keep this checklist updated
- Document any production-specific issues
- Maintain backup of working environment variables
- Regular monitoring of payment success rates
