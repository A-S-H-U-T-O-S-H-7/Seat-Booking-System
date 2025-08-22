# CCAvenue "Invalid Request - Encrypted request invalid/not present" - Debug Checklist

## ✅ Status Overview
- **Credentials**: ✅ All set correctly (verified via troubleshoot script)
- **Encryption**: ✅ Working properly (verified)
- **Working Key**: ✅ Correct length and format
- **APIs**: ✅ Generating encrypted data correctly

## 🎯 Most Likely Issues & Solutions

### 1. **FIXED: Form Submission Method**
- ✅ **Issue**: Form method was "POST" (uppercase), should be "post" (lowercase)
- ✅ **Fix Applied**: Updated PaymentProcess.jsx with proper form attributes
- ✅ **Added**: Better logging for form submission debugging

### 2. **Domain Configuration (CHECK THIS FIRST!)**
- ❗ **Action Required**: Verify in CCAvenue dashboard that your domain is whitelisted
- **Domain to verify**: `https://donate.svsamiti.com`
- **Check locations in dashboard**:
  - Account Settings > Domain Management
  - Security Settings > Allowed Domains/URLs
  - URL Configuration section

### 3. **Environment Variables**
✅ **Current Status**: All properly set
```
Merchant ID: 116662
Access Code: AVYS83MH27BT31SYTB  
Working Key: 32 characters, hex format ✅
Base URL: https://donate.svsamiti.com ✅
```

### 4. **Test Protocol**

#### Step 1: Use the Test Form
1. Open: `http://localhost:3000` (ensure your Next.js server is running)
2. Navigate to the test form: Place `test-ccavenue-form.html` in your `public/` folder
3. Access: `http://localhost:3000/test-ccavenue-form.html`
4. Click "Create Test Payment" and observe the console

#### Step 2: Test with Minimal Data
```bash
# Test the debug API directly
Invoke-WebRequest -Uri "http://localhost:3000/api/debug-ccavenue" -Method POST -Headers @{"Content-Type" = "application/json"} -Body '{"orderId":"MINIMAL_TEST","amount":"1","billingName":"Test","billingEmail":"test@test.com","billingTel":"9999999999"}'
```

#### Step 3: Check Console Logs
Look for these logs in browser console during payment:
```
🚀 Submitting to CCAvenue with:
  - encRequest length: [should be > 500]
  - access_code: AVYS83MH27BT31SYTB
📋 Form created successfully, submitting...
```

### 5. **Common CCAvenue Error Causes**

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid Request" | Domain not whitelisted | Add domain to CCAvenue dashboard |
| "Encrypted request invalid" | Wrong working key | Verify working key matches dashboard |
| "Request not present" | Form submission failed | Check form encoding & method |
| "Merchant not found" | Wrong merchant ID | Verify merchant ID |

### 6. **Immediate Action Plan**

#### Priority 1: Domain Verification ⚠️
1. Log into CCAvenue merchant dashboard
2. Go to Account Settings → Domain Configuration
3. Ensure `https://donate.svsamiti.com` is listed and active
4. If not, add it and wait for approval (can take 24-48 hours)

#### Priority 2: Test the Fixes
1. Test with the updated PaymentProcess.jsx
2. Use the test form (test-ccavenue-form.html) for isolated testing
3. Check browser console for detailed logs

#### Priority 3: Validate Workflow
1. Ensure your Next.js server is running on the correct domain
2. Test payment flow end-to-end
3. Monitor server logs for any API errors

### 7. **Emergency Debugging Steps**

If still facing issues:

1. **Check Production Environment**:
   ```bash
   # Verify production environment variables are loaded
   echo $CCAVENUE_INDIA_WORKING_KEY  # Should show your working key
   echo $CCAVENUE_INDIA_ACCESS_CODE  # Should show your access code
   ```

2. **Test with CCAvenue Test Credentials** (if you have them):
   - Temporarily switch to test credentials
   - If test works, issue is with production credentials/domain

3. **Contact CCAvenue Support**:
   - Merchant ID: 116662
   - Domain: https://donate.svsamiti.com
   - Error: "Invalid Request - Encrypted request invalid/not present"
   - Mention you've verified working key and domain configuration

### 8. **Files Modified**
✅ **PaymentProcess.jsx**: Fixed form submission method and added logging
✅ **create-payment/route.js**: Added comprehensive error handling
✅ **test-ccavenue-form.html**: Created for isolated testing

### 9. **Next Steps After Domain Verification**

1. If domain is properly configured:
   - Test payment with small amount (₹1)
   - Monitor CCAvenue dashboard for transaction logs
   - Check your server logs during payment attempts

2. If domain needs to be added:
   - Submit domain whitelist request to CCAvenue
   - Wait for approval (24-48 hours)
   - Test again after approval

### 10. **Success Indicators**
You'll know it's working when:
- ✅ Payment redirects to CCAvenue payment page (not error page)
- ✅ You can see transaction in CCAvenue merchant dashboard
- ✅ Payment success/failure properly redirects back to your site
- ✅ No "Invalid Request" errors

---

**Remember**: The most common cause of this error is domain not being whitelisted in CCAvenue dashboard. Check this first! 🎯
