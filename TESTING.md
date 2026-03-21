# Testing Guide for Apex AI Assistant

## Overview
This guide covers testing strategies for functionality, reliability, and edge cases.

## Unit Testing with Jest

### Running Tests
\`\`\`bash
npm test                 # Run all tests
npm test -- --watch     # Watch mode
npm test -- --coverage  # Coverage report
\`\`\`

### Test Files
- `__tests__/encryption.test.ts` - Encryption/decryption tests
- `__tests__/vault.test.ts` - Vault functionality tests

### Writing New Tests
\`\`\`typescript
import { describe, it, expect } from "@jest/globals"

describe("Feature Name", () => {
  it("should do something", () => {
    expect(true).toBe(true)
  })
})
\`\`\`

## E2E Testing with Cypress

### Setup
\`\`\`bash
npm install -D cypress
npx cypress open  # Interactive mode
npx cypress run   # Headless mode
\`\`\`

### Test Scenarios
1. **Onboarding Flow** - Create vault, set up profile, add hobbies
2. **Login Flow** - Unlock vault with password
3. **Insights Generation** - Navigate to Strategy, generate Prime Path
4. **Error Handling** - Wrong password, API failures
5. **Offline Mode** - Disconnect network, verify fallbacks

### Running E2E Tests
\`\`\`bash
npm run cypress:open   # Interactive
npm run cypress:run    # CI/CD
\`\`\`

## Browser Testing

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Testing Checklist
- [ ] Test in Chrome (primary)
- [ ] Test in Firefox
- [ ] Test in Safari (macOS/iOS)
- [ ] Test in Edge
- [ ] Test on mobile (responsive)

### Browser-Specific Issues
- **Safari**: Web Crypto API requires HTTPS
- **Firefox**: Service Worker may need manual enable
- **Mobile**: Touch gestures, viewport sizing

## Performance Testing

### Low Bandwidth Simulation
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Select throttling: "Slow 3G" or "Fast 3G"
4. Test all features

### Performance Metrics
- **Target**: < 3s initial load
- **Target**: < 1s page transitions
- **Target**: 60fps animations
- **Target**: < 100ms interaction response

### Tools
\`\`\`bash
# Lighthouse audit
npm run lighthouse

# Bundle analysis
npm run analyze
\`\`\`

## Offline Testing

### Steps
1. Load app while online
2. Open DevTools → Application → Service Workers
3. Check "Offline" checkbox
4. Test features:
   - [ ] Vault unlock
   - [ ] View existing data
   - [ ] Add new entries (should queue)
   - [ ] AI features (should use fallbacks)

### Expected Behavior
- ✅ Vault data accessible
- ✅ Offline banner appears
- ✅ AI uses local fallbacks
- ⚠️ New data syncs when online

## Error Scenarios

### Test Cases
1. **API Rate Limit**
   - Make 10+ rapid AI requests
   - Should show rate limit error modal
   - Should suggest retry after delay

2. **Network Failure**
   - Disconnect during API call
   - Should show network error
   - Should offer retry option

3. **Invalid Data**
   - Corrupt localStorage
   - Should handle gracefully
   - Should offer vault reset

4. **Password Loss**
   - Clear localStorage
   - Try to login
   - Should show "vault not found"

## Automated Testing

### CI/CD Pipeline
\`\`\`yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
      - run: npm run cypress:run
\`\`\`

### Pre-commit Hooks
\`\`\`bash
# Install husky
npm install -D husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test"
\`\`\`

## Security Testing

### Checklist
- [ ] Vault encryption (PBKDF2 + AES-GCM)
- [ ] No plaintext passwords in localStorage
- [ ] No sensitive data in network requests
- [ ] HTTPS only in production
- [ ] CSP headers configured

### Tools
- Chrome DevTools → Application → Storage
- Network tab → Check request payloads
- Security tab → Check HTTPS/certificates

## Load Testing

### Scenarios
1. **Large Vault** - 1000+ entries
2. **Multiple Tabs** - 5+ tabs open
3. **Long Session** - 8+ hours active
4. **Memory Leaks** - Monitor over time

### Tools
\`\`\`bash
# Memory profiling
Chrome DevTools → Memory → Take heap snapshot
\`\`\`

## Bug Reporting

### Template
\`\`\`markdown
**Bug**: [Brief description]
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected**: [What should happen]
**Actual**: [What actually happens]
**Browser**: Chrome 120
**Console Errors**: [Paste errors]
**Screenshots**: [Attach if relevant]
\`\`\`

## Success Criteria

### Phase 1 Goals
- ✅ 0 crashes in core flows
- ✅ All unit tests passing
- ✅ E2E tests covering main flows
- ✅ Works offline
- ✅ < 3s load time
- ✅ Handles all error scenarios gracefully

## Resources
- [Jest Documentation](https://jestjs.io/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
