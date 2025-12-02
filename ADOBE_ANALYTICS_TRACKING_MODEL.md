# Adobe Analytics Multi-Step Attribution Tracking Model
## Credit Card Application Journey (List eVar Approach)

**Document Version:** 2.0 (Updated with List Variable Attribution)
**Last Updated:** December 2, 2025  
**Scope:** Complete tracking model for 4-step credit card application with **multi-touch attribution using Adobe Analytics list variables (eVar)**

---

## Executive Summary

This document outlines a complete Adobe Analytics tracking implementation for a multi-step credit card application journey using **list eVars for true multi-touch attribution**. The model captures ALL pre-conversion touchpoints as a persistent array in the browser, and sends them together at conversion time.

**Key Goals:**
- **Capture all 4 touchpoints** (Choose Card, Confirm Details, Employment, Submit) as persistent list in browser
- **True multi-touch attribution:** ALL pre-conversion events tied to final Submit Application conversion via single list eVar
- **Cross-session persistence:** Journey list survives abandonment and session boundaries (90-day retention)
- **Email re-entry support:** Returning users' prior touchpoints preserved; new touchpoints appended
- **Single attribution hit:** All touchpoints sent in one Analytics beacon at conversion (not separate hits)
- **Identify drop-off points:** Analyze which touchpoint combinations lead to abandonment vs. conversion

**Core Approach: List eVar (eVar50 – Journey Touchpoints)**
- **Type:** List variable (one eVar, multiple values)
- **Delimiter:** `~` (tilde)
- **Format:** `touchpointName|touchpointValue|timestamp~touchpointName|touchpointValue|timestamp~...`
- **Persistence:** 90 days in browser localStorage; sent to Analytics at conversion
- **Result:** Single Analytics hit contains complete journey path (e.g., "choose_card|MoneyBack|2025-12-02T10:05Z~confirm_details|completed|2025-12-02T10:06Z~employment_step|FullTime|2025-12-02T10:07Z~application_submit|ORD-123|2025-12-02T10:09Z")

---

## Part 1: Data Layer Schema

### 1.1 Global Data Layer Structure

```javascript
window.appDataLayer = {
  // Visitor context (set once per session)
  visitor: {
    visitorId: 'unique-user-id',           // persistent identifier
    sessionId: 'session-uuid-12345',       // session identifier
    sessionStartTime: '2025-12-02T10:00:00Z',
    userSegment: 'NEW' | 'EXISTING',       // new or returning customer
    campaignId: 'email-link-dec-2025',     // campaign/source if from email
  },

  // Current form state
  form: {
    selectedCard: null,                    // MoneyBack, PixelPlay, Swiggy
    fullName: null,
    address: null,
    pincode: null,
    employmentType: null,
    company: null,
  },

  // Events array (chronological log)
  events: [],

  // Journey tracking
  journey: {
    entryPoint: 'choose_card' | 'confirm_details',  // where user entered
    currentStep: 0,
    stepHistory: [],                       // array of steps visited in order
    abandonment: {
      reason: null,                        // 'incomplete', 'timeout', 'manual_exit'
      lastActiveStep: null,
      lastActiveTime: null,
    },
  },
};
```

### 1.2 Event Schema (appDataLayer.events)

Each event object follows this structure:

```javascript
{
  // Core event metadata
  eventId: 'uuid-unique-per-event',
  eventName: string,                       // 'choose_card', 'confirm_details', etc.
  eventType: 'step' | 'action' | 'error',
  eventTimestamp: string,                  // ISO 8601
  eventSequence: number,                   // 1, 2, 3, ... (chronological order)

  // User context
  userId: string,
  sessionId: string,
  visitorId: string,

  // Business context
  productDetails: {
    selectedCard: string,                  // card name or null
    cardCategory: string,                  // 'premium', 'standard', etc.
  },

  // Step-specific metadata
  step: {
    stepIndex: number,                     // 0-3
    stepName: string,                      // 'Choose Card', 'Confirm Details', etc.
    stepStatus: 'entered' | 'completed' | 'skipped' | 'abandoned',
    timeOnStep: number,                    // milliseconds
  },

  // Form field data (sanitized, no sensitive PII)
  formData: {
    fullNameProvided: boolean,
    addressProvided: boolean,
    employmentTypeSelected: string | null,
    companyNameProvided: boolean,
  },

  // Journey context
  entryPoint: string,                      // 'choose_card', 'email_link_confirm', etc.
  previousStep: number | null,
  isReturnUser: boolean,
  campaignId: string | null,

  // Error context (if applicable)
  error: {
    errorCode: string | null,
    errorMessage: string | null,
    fieldWithError: string | null,
  },

  // Additional attributes (extensible)
  customAttributes: {},
}
```

### 1.3 Event Payload Examples

#### Example 1: Choose Card (Step 0)

```javascript
{
  eventId: 'evt-001-choose-card',
  eventName: 'choose_card',
  eventType: 'step',
  eventTimestamp: '2025-12-02T10:05:30.123Z',
  eventSequence: 1,
  userId: 'user-12345',
  sessionId: 'sess-abc123def456',
  visitorId: 'visitor-uid-001',
  productDetails: {
    selectedCard: 'MoneyBack',
    cardCategory: 'rewards',
  },
  step: {
    stepIndex: 0,
    stepName: 'Choose Card',
    stepStatus: 'completed',
    timeOnStep: 45000,  // 45 seconds
  },
  formData: {
    fullNameProvided: false,
    addressProvided: false,
    employmentTypeSelected: null,
    companyNameProvided: false,
  },
  entryPoint: 'choose_card',
  previousStep: null,
  isReturnUser: false,
  campaignId: null,
  error: null,
  customAttributes: {},
}
```

#### Example 2: Confirm Details (Step 1)

```javascript
{
  eventId: 'evt-002-confirm-details',
  eventName: 'confirm_details',
  eventType: 'step',
  eventTimestamp: '2025-12-02T10:06:15.456Z',
  eventSequence: 2,
  userId: 'user-12345',
  sessionId: 'sess-abc123def456',
  visitorId: 'visitor-uid-001',
  productDetails: {
    selectedCard: 'MoneyBack',
    cardCategory: 'rewards',
  },
  step: {
    stepIndex: 1,
    stepName: 'Confirm Details',
    stepStatus: 'completed',
    timeOnStep: 120000,  // 2 minutes
  },
  formData: {
    fullNameProvided: true,
    addressProvided: true,
    employmentTypeSelected: null,
    companyNameProvided: false,
  },
  entryPoint: 'choose_card',
  previousStep: 0,
  isReturnUser: false,
  campaignId: null,
  error: null,
  customAttributes: {},
}
```

#### Example 3: Employment (Step 2)

```javascript
{
  eventId: 'evt-003-employment',
  eventName: 'employment_step',
  eventType: 'step',
  eventTimestamp: '2025-12-02T10:07:45.789Z',
  eventSequence: 3,
  userId: 'user-12345',
  sessionId: 'sess-abc123def456',
  visitorId: 'visitor-uid-001',
  productDetails: {
    selectedCard: 'MoneyBack',
    cardCategory: 'rewards',
  },
  step: {
    stepIndex: 2,
    stepName: 'Employment',
    stepStatus: 'completed',
    timeOnStep: 80000,  // ~1.3 minutes
  },
  formData: {
    fullNameProvided: true,
    addressProvided: true,
    employmentTypeSelected: 'Full Time',
    companyNameProvided: true,
  },
  entryPoint: 'choose_card',
  previousStep: 1,
  isReturnUser: false,
  campaignId: null,
  error: null,
  customAttributes: { companyIndustry: 'Technology' },
}
```

#### Example 4: Submit Application (Step 3 - CONVERSION)

```javascript
{
  eventId: 'evt-004-submit',
  eventName: 'application_submit',
  eventType: 'step',
  eventTimestamp: '2025-12-02T10:09:00.000Z',
  eventSequence: 4,
  userId: 'user-12345',
  sessionId: 'sess-abc123def456',
  visitorId: 'visitor-uid-001',
  productDetails: {
    selectedCard: 'MoneyBack',
    cardCategory: 'rewards',
  },
  step: {
    stepIndex: 3,
    stepName: 'Submit Application',
    stepStatus: 'completed',
    timeOnStep: 5000,
  },
  formData: {
    fullNameProvided: true,
    addressProvided: true,
    employmentTypeSelected: 'Full Time',
    companyNameProvided: true,
  },
  entryPoint: 'choose_card',
  previousStep: 2,
  isReturnUser: false,
  campaignId: null,
  error: null,
  customAttributes: {
    conversionId: 'conv-12345-001',
    applicationStatus: 'submitted',
  },
}
```

#### Example 5: Re-Entry from Email (Return User, Skip Card Selection)

```javascript
{
  eventId: 'evt-005-reentry-confirm',
  eventName: 'confirm_details',
  eventType: 'step',
  eventTimestamp: '2025-12-02T15:30:00.000Z',
  eventSequence: 1,  // Reset for new session
  userId: 'user-12345',
  sessionId: 'sess-xyz789uvw012',  // New session ID
  visitorId: 'visitor-uid-001',
  productDetails: {
    selectedCard: 'MoneyBack',
    cardCategory: 'rewards',
  },
  step: {
    stepIndex: 1,
    stepName: 'Confirm Details',
    stepStatus: 'entered',
    timeOnStep: 0,
  },
  formData: {
    fullNameProvided: true,  // Pre-populated from previous session
    addressProvided: true,
    employmentTypeSelected: null,
    companyNameProvided: false,
  },
  entryPoint: 'confirm_details',  // DIRECT ENTRY (email link)
  previousStep: null,
  isReturnUser: true,  // KEY: Returning customer
  campaignId: 'email-reengagement-dec-2025',  // Traffic source
  error: null,
  customAttributes: {
    referralSource: 'email',
    previousSessionId: 'sess-abc123def456',
  },
}
```

---

## Part 2: Data Layer Push Implementation (List Variable Support)

### 2.1 Global pushEvent Function with List Variable Support

Update `window.pushEvent()` in `scripts/aem.js` to support list variable persistence:

```javascript
window.pushEvent = function(eventName, data = {}) {
  const eventObj = {
    // Auto-generated metadata
    eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    eventName: eventName,
    eventType: data.eventType || 'step',
    eventTimestamp: new Date().toISOString(),
    eventSequence: (window.appDataLayer.events || []).length + 1,

    // User context
    userId: window.appDataLayer.visitor?.userId || null,
    sessionId: window.appDataLayer.visitor?.sessionId || null,
    visitorId: window.appDataLayer.visitor?.visitorId || null,

    // Business context
    productDetails: {
      selectedCard: window.appDataLayer.form?.selectedCard || null,
      cardCategory: window.appDataLayer.form?.selectedCard 
        ? getCategoryForCard(window.appDataLayer.form.selectedCard)
        : null,
    },

    // Merge custom data
    ...data,
  };

  // Push to data layer array
  window.appDataLayer.push(eventObj);

  // **LIST VARIABLE SUPPORT:** Append touchpoint to localStorage journey list
  try {
    const existingList = localStorage.getItem('journeyList') || '';
    const timestamp = new Date().toISOString();
    const touchpointValue = 
      data.productDetails?.selectedCard ||
      data.step?.stepName ||
      data.campaignId ||
      'unknown';
    
    const newTouchpoint = `${eventName}|${touchpointValue}|${timestamp}`;
    const updatedList = existingList 
      ? `${existingList}~${newTouchpoint}` 
      : newTouchpoint;
    
    localStorage.setItem('journeyList', updatedList);
    
    console.debug('[Journey List] Updated:', {
      touchpoint: newTouchpoint,
      totalTouchpoints: updatedList.split('~').length,
      fullList: updatedList
    });
  } catch (e) {
    console.warn('localStorage journeyList unavailable (CSP?):', e);
  }

  // Dispatch custom event for Launch to listen
  document.dispatchEvent(new CustomEvent('app-event', { detail: eventObj }));

  console.debug('pushEvent:', eventObj);
};

// Helper to map card to category
function getCategoryForCard(cardName) {
  const categoryMap = {
    'MoneyBack': 'rewards',
    'PixelPlay': 'digital',
    'Swiggy': 'cashback',
  };
  return categoryMap[cardName] || 'standard';
}
```

### 2.2 Block Implementation: Updated showStep with List Variable Context

Modify `blocks/credit-step/credit-step.js` showStep function:

```javascript
function showStep(step) {
  panels.forEach((p, i) => p.classList.toggle('identity-block__panel--active', i === step));
  tabs.forEach((t, i) => t.classList.toggle('identity-block__tab--active', i === step));
  currentStep = step;

  // Core tracking
  trackIdentityStep(step, stepNames[step]);

  // Enhanced data-layer push with rich context
  const eventMap = {
    0: 'choose_card',
    1: 'confirm_details',
    2: 'employment_step',
    3: 'submit_application',
  };

  const eventName = eventMap[step];
  
  // Calculate time on previous step
  const timeOnCurrentStep = step === 0 ? 0 : Date.now() - (window.stepTimestamp || Date.now());
  window.stepTimestamp = Date.now();

  // Get current journey list length for reporting
  let touchpointCount = 0;
  try {
    const journeyList = localStorage.getItem('journeyList') || '';
    touchpointCount = journeyList ? journeyList.split('~').length : 0;
  } catch (e) {
    console.warn('Could not read journeyList:', e);
  }

  if (window.pushEvent) {
    window.pushEvent(eventName, {
      eventType: 'step',
      step: {
        stepIndex: step,
        stepName: stepNames[step],
        stepStatus: 'entered',
        timeOnStep: timeOnCurrentStep,
      },
      formData: {
        fullNameProvided: !!root.querySelector('#fullName')?.value,
        addressProvided: !!root.querySelector('#address')?.value,
        employmentTypeSelected: root.querySelector('#empType')?.value || null,
        companyNameProvided: !!root.querySelector('#company')?.value,
      },
      entryPoint: window.appDataLayer?.journey?.entryPoint || 'choose_card',
      previousStep: step > 0 ? step - 1 : null,
      isReturnUser: window.appDataLayer?.visitor?.userSegment === 'EXISTING',
      campaignId: getURLParam('utm_campaign') || window.appDataLayer?.visitor?.campaignId,
      journeyListLength: touchpointCount,  // For Launch rule access
    });
  }

  if (step === 3) fillReview();
}
```

### 2.3 Conversion Handler with List Variable Cleanup

When user submits application, call this function:

```javascript
function handleApplicationSubmit() {
  // Generate order ID
  const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  
  if (window.pushEvent) {
    window.pushEvent('application_submit', {
      eventType: 'conversion',
      step: {
        stepIndex: 3,
        stepName: 'Submit Application',
        stepStatus: 'completed',
      },
      orderId: orderId,
      // Launch rule will append this to journey list AND clear it after sending
    });
  }
  
  // Show success message, redirect, etc.
  console.log('Application submitted. Order ID:', orderId);
}
```

### 2.4 Re-Entry Handler with List Variable Persistence

Add this to `scripts/aem.js` setup():

```javascript
// Detect and handle re-entry (e.g., from email link)
function handleReEntry() {
  const currentStep = getURLParam('step');
  const journeyListExists = !!localStorage.getItem('journeyList');
  
  if (journeyListExists) {
    // User has a prior journey: returning customer
    window.appDataLayer.visitor.userSegment = 'EXISTING';
    window.appDataLayer.journey.entryPoint = currentStep || 'confirm_details';
    
    if (window.pushEvent) {
      window.pushEvent('session_reentry', {
        eventType: 'action',
        entryPoint: currentStep || 'direct',
        referralSource: getURLParam('utm_source') || 'email',
        campaignId: getURLParam('utm_campaign'),
        // Journey list continues: NOT reset; re-entry appended by Launch rule
      });
    }
  }
}

function getURLParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
```

**Key Difference:** Journey list is **NOT cleared** on re-entry—it persists and continues to build. Only cleared after conversion (by Launch rule).

---

## Part 3: Adobe Launch Rules & Analytics Variable Mapping (List Variable Approach)

### 3.1 Analytics Variable Configuration for List Variables

#### eVar Configuration (Conversion Variables)

| eVar # | Name | **Type** | Delimiter | Expiration | Allocation | Purpose |
|--------|------|---------|-----------|------------|-----------|---------|
| **eVar50** | **Journey Touchpoints** | **List** | **~** (tilde) | **90 days** | **Original Value** | **All pre-conversion touchpoints as array** |
| eVar01 | Selected Card | String | N/A | 30 days | Last Touch | Current card selected |
| eVar02 | Step Progression | String | N/A | Session | Last Touch | Current step name |
| eVar04 | Order ID | String | N/A | Purchase | Last Touch | Conversion order ID |
| eVar51 | Journey Count | String | N/A | Session | Last Touch | Number of touchpoints in journey |
| eVar99 | Re-entry Source | String | N/A | Session | Last Touch | Re-entry campaign/source |

#### prop Configuration (Traffic Variables – Real-Time Visibility)

| prop # | Name | Type | Purpose |
|--------|------|------|---------|
| prop50 | Journey List (real-time) | List (same as eVar50) | Real-time view of journey in progress |
| prop04 | Order ID | String | Order confirmation for real-time monitoring |

#### event Configuration (Success Events)

| Event # | Name | Type | Purpose |
|---------|------|------|---------|
| event04 | Application Submitted | Order (Revenue) | **CONVERSION EVENT** – primary metric |
| event99 | Touchpoint Recorded | Counter | Tracks each touchpoint added to journey |

---

### 3.2 Launch Rule #1: Append Touchpoints to List eVar

**Rule Name:** Journey – Append Touchpoints to List  
**Event Type:** Custom Event: `app-event`

**Condition:**
```javascript
['choose_card', 'confirm_details', 'employment_step', 'session_reentry'].includes(event.detail.eventName)
```

**Action #1: Custom Code (Before Analytics)**
```javascript
// Get existing journey list from localStorage
const existingList = localStorage.getItem('journeyList') || '';

// Extract touchpoint details
const touchpointName = event.detail.eventName;
const touchpointValue = 
  event.detail.productDetails?.selectedCard ||
  event.detail.step?.stepName ||
  event.detail.campaignId ||
  'unknown';

// Add timestamp
const timestamp = new Date().toISOString();
const newTouchpoint = `${touchpointName}|${touchpointValue}|${timestamp}`;

// Build updated list (append with delimiter)
const updatedList = existingList 
  ? `${existingList}~${newTouchpoint}` 
  : newTouchpoint;

// Persist to localStorage (survives page navigation)
localStorage.setItem('journeyList', updatedList);

// Set Launch variable for use in Analytics action
_satellite.setVar('journeyList', updatedList);
_satellite.setVar('touchpointCount', updatedList.split('~').length);

console.log('[Analytics] Journey touchpoint added:', {
  touchpoint: newTouchpoint,
  totalTouchpoints: updatedList.split('~').length,
  fullJourney: updatedList
});
```

**Action #2: Adobe Analytics – Set Variables**
```
eVar50 = %journeyList%           (List eVar with all touchpoints)
prop50 = %journeyList%           (Real-time visibility)
eVar99 = %touchpointCount%       (Number of touchpoints)
event99 = 1                      (Touchpoint recorded)
```

**Action #3: Send Beacon**
- Type: `Link` (s.tl)
- Name: `journey-touchpoint`
- Link type: `o` (Other)

**Result:** Each touchpoint appended to persistent list; stored in browser; sent to Analytics.

---

### 3.3 Launch Rule #2: Record Conversion with Full Journey

**Rule Name:** Conversion – Submit Application with Complete Journey  
**Event Type:** Custom Event: `app-event`

**Condition:**
```javascript
event.detail.eventName === 'application_submit'
```

**Action #1: Custom Code (Phase 1 – Build Final List)**
```javascript
// Retrieve journey list with all prior touchpoints
const journeyList = localStorage.getItem('journeyList') || '';

// Generate unique order ID
const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

// Add conversion as final touchpoint
const timestamp = new Date().toISOString();
const conversionTouchpoint = `application_submit|${orderId}|${timestamp}`;

// Build final list (includes all prior touchpoints + conversion)
const finalList = journeyList 
  ? `${journeyList}~${conversionTouchpoint}` 
  : conversionTouchpoint;

// Count total touchpoints
const touchpointCount = finalList.split('~').length;

// Set Launch variables
_satellite.setVar('journeyList', finalList);
_satellite.setVar('orderId', orderId);
_satellite.setVar('touchpointCount', touchpointCount);

console.log('[Analytics] Conversion recorded:', {
  orderId: orderId,
  totalTouchpoints: touchpointCount,
  fullJourney: finalList
});
```

**Action #2: Adobe Analytics – Set Variables**
```
eVar50 = %journeyList%              (Complete journey list)
eVar04 = %orderId%                  (Order ID)
eVar51 = %touchpointCount%          (Total touchpoints for reporting)
prop04 = %orderId%                  (Order ID for real-time)
event04 = 1                         (Conversion event)
eventCurrency = INR
```

**Action #3: Send Beacon**
- Type: `Page View` (s.t)
- Page Name: `Application Complete`

**Action #4: Custom Code (Phase 2 – Clear for Next Customer)**
```javascript
// Clear journey list after conversion
localStorage.removeItem('journeyList');

console.log('[Analytics] Journey list cleared for next customer');
```

**Result:** Full journey sent in single eVar50 at conversion; all touchpoints attributed to order; list cleared.

---

### 3.4 Launch Rule #3: Detect & Mark Re-Entry

**Rule Name:** Journey – Session Re-entry Detection  
**Event Type:** Custom Event: `app-event`

**Condition:**
```javascript
event.detail.eventName === 'session_reentry'
```

**Action #1: Custom Code**
```javascript
// Re-entry detection
const reentrySource = event.detail.campaignId || 'direct_reentry';
const isReturning = event.detail.isReturnUser === true;

// Get existing journey
const existingList = localStorage.getItem('journeyList') || '';

// If journey list exists: user is returning; append re-entry marker
// If NO journey list: user is new (should not happen with this rule, but safe)
const timestamp = new Date().toISOString();
const reentryTouchpoint = `session_reentry|${reentrySource}|${timestamp}`;

// Append re-entry (journey continues, NOT reset)
const updatedList = existingList 
  ? `${existingList}~${reentryTouchpoint}` 
  : reentryTouchpoint;

localStorage.setItem('journeyList', updatedList);

_satellite.setVar('journeyList', updatedList);
_satellite.setVar('reentrySource', reentrySource);
_satellite.setVar('isReturningUser', isReturning ? 'yes' : 'no');

console.log('[Analytics] Re-entry detected:', {
  source: reentrySource,
  isReturning: isReturning,
  updatedJourney: updatedList
});
```

**Action #2: Adobe Analytics – Set Variables**
```
eVar50 = %journeyList%           (Journey continues with re-entry marker)
eVar99 = %reentrySource%         (Email, direct, etc.)
event99 = 1                      (Re-entry recorded)
```

**Action #3: Send Beacon**
- Type: `Link` (s.tl)
- Name: `session-reentry`

**Result:** Re-entry touchpoint appended; journey persists; returning user flagged.

---

### 3.5 Launch Rules Summary Table

| # | Rule Name | Trigger | Condition | Primary eVar | Action | Result |
|---|-----------|---------|-----------|--------------|--------|--------|
| **1** | Journey – Append Touchpoints | app-event | choose_card, confirm_details, employment_step, session_reentry | eVar50 (list) | Append to list via localStorage | Each step added to persistent array |
| **2** | Conversion – Submit Application | app-event | application_submit | eVar50 (list) + eVar04 (orderId) | Generate Order ID; send full list + conversion | All touchpoints sent in one hit |
| **3** | Journey – Re-entry Detection | app-event | session_reentry | eVar50 (list) + eVar99 | Append re-entry marker; continue list | Returning users' prior journey preserved |

2. **Set Variables (Adobe Analytics Extension)**
   - eVar04 = `%orderId%`
   - eVar50 = `%event.detail.sessionId%`
   - prop04 = `%event.detail.productDetails.selectedCard%`
   - event04 = 1  // Mark as revenue event
   - eventCurrency = `INR`

3. **Send Beacon**
   - Type: `Page View` (s.t)
   - Use Page Name: `CheckOut Complete`

---

## Part 4: Multi-Touch Attribution Strategy with List Variables

### 4.1 Attribution Model Overview: List Variable Approach

**Goal:** Capture ALL pre-conversion touchpoints as a persistent array and tie them all to the final conversion.

**Model:** **Multi-Touch Attribution with List eVar (Recommended)**

```
List eVar50 (Journey Touchpoints - Persists across sessions until conversion):
├── Entry 1: choose_card|MoneyBack|2025-12-02T10:05:30Z
├── Entry 2: confirm_details|step1|2025-12-02T10:06:15Z
├── Entry 3: employment_step|Full Time|2025-12-02T10:07:45Z
└── Entry 4: application_submit|ORDER-123456|2025-12-02T10:09:00Z [CONVERSION]
    └── ALL 4 touchpoints stored as array in single eVar50
       └── Single Analytics hit reports all touchpoints at conversion
```

**Key Advantages:**
- ✅ All touchpoints captured in ONE variable
- ✅ Persists across sessions (browser storage)
- ✅ Sent as array to Adobe Analytics on conversion hit
- ✅ No need for separate sessions/visitor tracking for attribution
- ✅ Cleaner implementation (fewer variables needed)
- ✅ Works with email re-entry (list continues to build)
- ✅ Abandonment tracking (check list when user re-enters)

### 4.2 List eVar Technical Implementation

#### Variable Configuration in Adobe Analytics Admin

| Variable | Type | Delimiter | Expiration | Allocation | Purpose |
|----------|------|-----------|------------|-----------|---------|
| **eVar50** | **List** | `~` (tilde) | **90 days** | **Original Value** | Journey touchpoints (list of all steps taken) |
| eVar01 | String | N/A | Session | Last Touch | Current card selected |
| eVar02 | String | N/A | Session | Last Touch | Current step name |
| eVar04 | String | N/A | Purchase | Last Touch | Order ID (conversion) |

**Why these settings:**
- **List type:** Allows multiple values in single eVar
- **Delimiter `~`:** Standard delimiter; separates touchpoints
- **90-day expiration:** Captures full customer journey even with long delays
- **Original Value:** Preserves first touchpoint (not overwritten by later ones)

#### List eVar Data Format

Each touchpoint is appended to the list as:
```
touchpointName|touchpointValue|timestamp
```

**Full journey example:**
```
choose_card|MoneyBack|2025-12-02T10:05:30Z~confirm_details|step1_completed|2025-12-02T10:06:15Z~employment_step|Full Time|2025-12-02T10:07:45Z~application_submit|ORDER-ABC123|2025-12-02T10:09:00Z
```

**In Adobe Analytics Reports:**
Each item in the list is reportable as a separate line item, enabling:
- Path analysis (choose_card → confirm_details → employment_step → submit = conversion)
- Attribution: Which touchpoint was first? Which was last?
- Funnel: At which point do users drop off?
- Patterns: Do all MoneyBack selections lead to employment or employment_step?

### 4.3 Cross-Session Persistence with List Variables

For returning users (re-entry scenario):

```
Day 1 - Session 1:
  List eVar50 build-up (browser localStorage):
  ├── choose_card|MoneyBack|2025-12-02T10:05Z
  ├── confirm_details|completed|2025-12-02T10:06Z
  └── [User abandons]

Day 2 - Session 2 (Email re-entry ?step=employment_step&utm_campaign=email):
  List eVar50 CONTINUES (NOT RESET):
  ├── choose_card|MoneyBack|2025-12-02T10:05Z [PERSISTED]
  ├── confirm_details|completed|2025-12-02T10:06Z [PERSISTED]
  ├── session_reentry|email-campaign|2025-12-02T15:30Z [NEW]
  ├── employment_step|Full Time|2025-12-02T15:31Z [NEW]
  └── application_submit|ORDER-XYZ789|2025-12-02T15:33Z [CONVERSION]
      ↓
  Adobe Analytics receives ALL 5 touchpoints in single array on conversion hit
```

**Result in Analytics:**
- Order ABC123 is attributed to ALL 4 touchpoints (including the abandoned choose_card from Session 1)
- Can analyze: Users who abandon then re-engage via email have 45% higher conversion
- Can segment: Orders driven by email re-engagement (identify via reentry touchpoint)

### 4.4 List Variable Storage in Browser

**localStorage Implementation:**

```javascript
// Initialize or retrieve journey list
function initializeJourneyList() {
  const existing = localStorage.getItem('journeyList');
  return existing ? existing.split('~') : [];
}

// Add touchpoint to list
function addTouchpointToList(touchpointName, touchpointValue) {
  const list = initializeJourneyList();
  const timestamp = new Date().toISOString();
  const touchpoint = `${touchpointName}|${touchpointValue}|${timestamp}`;
  
  list.push(touchpoint);
  localStorage.setItem('journeyList', list.join('~'));
  
  console.log('Journey list updated:', list);
  return list;
}

// Get full list for sending to Analytics
function getJourneyList() {
  return localStorage.getItem('journeyList') || '';
}

// Clear list after conversion (optional, for next customer)
function clearJourneyList() {
  localStorage.removeItem('journeyList');
}
```

### 4.5 Launch Rule with List eVar

**Rule: All Journey Touchpoints – Persist to List eVar**

**Trigger:**
- Custom Event: `app-event`

**Condition (applies to ALL events):**
```javascript
event.detail.eventName == "choose_card" || 
event.detail.eventName == "confirm_details" || 
event.detail.eventName == "employment_step" || 
event.detail.eventName == "session_reentry"
// Note: Do NOT include application_submit here yet (handled separately)
```

**Action: Custom Code**
```javascript
// Get existing list from localStorage
const existingList = localStorage.getItem('journeyList') || '';
const touchpointName = _satellite.getVar('eventName');
const touchpointValue = event.detail.productDetails?.selectedCard || 
                        event.detail.step?.stepName || 
                        event.detail.campaignId ||
                        'unknown';

// Create new touchpoint
const timestamp = new Date().toISOString();
const newTouchpoint = `${touchpointName}|${touchpointValue}|${timestamp}`;

// Append to list
const updatedList = existingList 
  ? `${existingList}~${newTouchpoint}` 
  : newTouchpoint;

// Store in localStorage for persistence
localStorage.setItem('journeyList', updatedList);

// Set Launch variable
_satellite.setVar('journeyList', updatedList);
```

**Action: Adobe Analytics – Set Variables**
```
eVar50 = %journeyList%  // List eVar with journey touchpoints
prop50 = %journeyList%  // Also in prop for real-time visibility
event99 = 1             // Touchpoint recorded
```

### 4.6 Conversion Rule with List eVar

**Rule: Application Submit – Record Conversion with Full Journey**

**Trigger:**
- Custom Event: `app-event`

**Condition:**
```javascript
event.detail.eventName === 'application_submit'
```

**Action: Custom Code (Before Analytics)**
```javascript
// Retrieve final journey list
const journeyList = localStorage.getItem('journeyList') || '';
const conversionId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

// Add conversion touchpoint
const timestamp = new Date().toISOString();
const conversionTouchpoint = `application_submit|${conversionId}|${timestamp}`;

const finalJourneyList = journeyList 
  ? `${journeyList}~${conversionTouchpoint}` 
  : conversionTouchpoint;

// Set variables
_satellite.setVar('journeyList', finalJourneyList);
_satellite.setVar('orderId', conversionId);
_satellite.setVar('journeyCount', finalJourneyList.split('~').length);
```

**Action: Adobe Analytics – Set Variables**
```
eVar50 = %journeyList%           // Complete journey as list
eVar04 = %orderId%               // Order ID
eVar51 = %journeyCount%          // Number of touchpoints (for reporting)
prop04 = %orderId%
event04 = 1                      // Conversion event
eventCurrency = INR
```

**Action: Adobe Analytics – Send Beacon**
- Type: `Page View` (s.t)
- Page Name: `Checkout Complete`

**Action: Custom Code (After Analytics)**
```javascript
// Clear journey list after conversion
localStorage.removeItem('journeyList');
```

### 4.7 Calculated Metrics & Reports with List Variables

**In Adobe Analytics, create:**

1. **Calculated Metric: Multi-Touch Attribution Rate**
   ```
   (event04 / eventList50Count) * 100
   // Metric: Average touchpoints per conversion
   ```

2. **Custom Report: Funnel with Attribution**
   - Rows: eVar50 (each touchpoint in the list)
   - Columns: Orders (event04), Conversion Rate
   - Interpretation: Which touchpoint appears most frequently in converting journeys?

3. **Fallout Report: Complete Journey Path**
   - Segment with eVar50:
     - "Contains: choose_card" (Step 0 completed)
     - "Contains: confirm_details" (Step 1 completed)
     - "Contains: employment_step" (Step 2 completed)
     - "Contains: application_submit" (Step 3 completed)
   - Metric: Orders (event04)

4. **Flow Report: Touchpoint Sequence**
   - Rows: eVar50 (first touchpoint)
   - Columns: eVar50 (second touchpoint)
   - Metric: Orders
   - Shows: "Users who clicked email then choose_card convert at X rate"

5. **Cohort Analysis: Journey Patterns**
   - Segment A: `eVar50 contains "email" AND event04 > 0` (Email re-entry converters)
   - Segment B: `eVar50 does NOT contain "email" AND event04 > 0` (Direct converters)
   - Metric: Conversion Rate, Average Order Value
   - Insight: Which journey pattern has higher LTV?

---

## Part 5: Re-Entry & Fallback Strategy

### 5.1 Re-Entry Scenarios

#### Scenario A: User abandons after Choose Card, returns via email link

```
Session 1: 
  - Choose Card ✓ (event01 fired)
  - User abandons

Session 2 (Email link: ?step=confirm_details):
  - Session Re-entry event fired (event99)
  - Confirm Details entered [eVar50 = New Session ID]
  - Employment completed
  - Submit Application [CONVERSION]
  
Attribution:
  - Order linked to new session
  - But Visitor ID connects to previous Choose Card
  - Use Multi-Touch Attribution to show full journey
```

**Implementation:**
```javascript
// In block load, detect re-entry
const emailCampaignId = getURLParam('utm_campaign');
if (emailCampaignId) {
  window.appDataLayer.visitor.campaignId = emailCampaignId;
  window.appDataLayer.journey.entryPoint = getURLParam('step') || 'choose_card';
  
  if (window.pushEvent) {
    window.pushEvent('session_reentry', {
      referralSource: 'email',
      campaignId: emailCampaignId,
      isReturnUser: true,
    });
  }
}
```

#### Scenario B: User navigates directly to Confirm Details (bookmark or browser history)

```
// Check if user has a valid previous session
if (sessionStorage.getItem('appSessionId')) {
  // Returning user in same session
  // Pre-populate form fields
  // Don't re-track Choose Card
} else {
  // New user, but skipping Choose Card
  // Track as entry point at Confirm Details
  // Treat as incomplete journey (flag for follow-up)
}
```

### 5.2 Session Management

Add this to `scripts/aem.js`:

```javascript
function initializeSession() {
  // Check for existing session
  const existingSessionId = sessionStorage.getItem('appSessionId');
  
  if (existingSessionId) {
    // Same session (user refreshed or navigated back)
    window.appDataLayer.visitor.sessionId = existingSessionId;
    window.appDataLayer.visitor.userSegment = 'RETURNING_SESSION';
  } else {
    // New session
    const newSessionId = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('appSessionId', newSessionId);
    
    // Check if visitor is known (stored in localStorage)
    const knownVisitorId = localStorage.getItem('visitorId');
    if (knownVisitorId) {
      window.appDataLayer.visitor.visitorId = knownVisitorId;
      window.appDataLayer.visitor.userSegment = 'EXISTING';
    } else {
      // New visitor
      const newVisitorId = `visitor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('visitorId', newVisitorId);
      window.appDataLayer.visitor.visitorId = newVisitorId;
      window.appDataLayer.visitor.userSegment = 'NEW';
    }
  }
}

initializeSession();
```

### 5.3 Form Pre-Population

For returning users, pre-populate form fields from sessionStorage:

```javascript
function loadFormState() {
  const savedState = sessionStorage.getItem('appFormState');
  if (savedState) {
    const state = JSON.parse(savedState);
    document.querySelector('#fullName').value = state.fullName || '';
    document.querySelector('#address').value = state.address || '';
    document.querySelector('#pincode').value = state.pincode || '';
    document.querySelector('#empType').value = state.empType || '';
    document.querySelector('#company').value = state.company || '';
  }
}

function saveFormState() {
  const state = {
    fullName: document.querySelector('#fullName').value,
    address: document.querySelector('#address').value,
    pincode: document.querySelector('#pincode').value,
    empType: document.querySelector('#empType').value,
    company: document.querySelector('#company').value,
  };
  sessionStorage.setItem('appFormState', JSON.stringify(state));
}

// Load on init
loadFormState();

// Save on form changes
document.querySelectorAll('input, select').forEach(field => {
  field.addEventListener('change', saveFormState);
});
```

### 5.4 Abandonment Tracking

Track users who abandon the journey:

```javascript
window.addEventListener('beforeunload', (e) => {
  if (currentStep < 3) {  // Incomplete journey
    if (window.pushEvent) {
      window.pushEvent('form_abandonment', {
        eventType: 'action',
        abandonmentReason: 'page_exit',
        lastStep: currentStep,
        stepName: stepNames[currentStep],
        timeOnLastStep: Date.now() - window.stepTimestamp,
      });
    }
  }
});
```

---

## Part 6: Consolidated Tracking Plan

### 6.1 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER JOURNEY TRACKING                         │
└─────────────────────────────────────────────────────────────────┘

NEW USER FLOW:
─────────────
1. Land on page → Session Init → Generate SessionID, VisitorID
2. Choose Card   → event01 (eVar01=CardName)
3. Confirm Details → event02 (eVar02=StepName)
4. Employment    → event03 (eVar03=EmpType)
5. Submit Application → event04 (eVar04=OrderID, s.t beacon)
                    └─ Order tied to Session via eVar50

RETURNING USER FLOW (EMAIL RE-ENTRY):
─────────────────────────────────────
1. Click email link (?step=confirm_details&utm_campaign=email-dec)
   → Session Init → New SessionID (same VisitorID)
   → event99 fired (Re-entry marker)
2. Pre-populate form from session storage
3. Confirm Details (Direct entry, skip Choose Card)
4. Employment
5. Submit Application → event04 (eVar04=OrderID)
                    ├─ Session links to email campaign
                    └─ Visitor ID links to previous session's Choose Card

ABANDONMENT TRACKING:
───────────────────
At any step: User navigates away
   → Abandonment event fired
   → Last step recorded
   → Can re-engage via email with previous step
```

### 6.2 Implementation Checklist

#### Phase 1: Data Layer & Events
- [ ] Update `scripts/aem.js` with enhanced `pushEvent()` function
- [ ] Add visitor/session initialization logic
- [ ] Add form state persistence (sessionStorage)
- [ ] Add abandonment tracking (beforeunload listener)
- [ ] Add re-entry detection (URL params)

#### Phase 2: Block Updates
- [ ] Update `blocks/credit-step/credit-step.js` showStep() to call enhanced pushEvent()
- [ ] Add time-on-step tracking
- [ ] Add form field state capture
- [ ] Add pre-population logic for returning users

#### Phase 3: Adobe Launch
- [ ] Create 5 Launch Rules (Choose Card, Confirm Details, Employment, Submit, Re-entry)
- [ ] Configure eVar01-04, eVar50, eVar99 (or your org's eVar numbers)
- [ ] Configure prop01-04, prop99
- [ ] Configure event01-04, event99
- [ ] Set up order ID generation logic
- [ ] Publish to Development environment

#### Phase 4: Adobe Analytics
- [ ] Set up eVar/prop/event allocations and expiration in Admin
- [ ] Create calculated metrics (Conversion Rate, Avg Steps)
- [ ] Set up Fallout report (4-step funnel)
- [ ] Set up Cohort analysis (First-time vs. Returning)
- [ ] Create Attribution workspace with Multi-Touch model
- [ ] Test with internal users before publishing

#### Phase 5: QA & Testing
- [ ] Test new user flow end-to-end
- [ ] Test abandonment at each step
- [ ] Test re-entry from email link
- [ ] Verify data in appDataLayer (console)
- [ ] Verify events in Adobe Experience Platform Debugger
- [ ] Verify beacon data in AA reports (wait 24 hours)

---

### 6.3 Sample Adobe Analytics Dashboard

**Dashboard: Credit Card Application Funnel**

```
┌─────────────────────────────────────────────────────────────┐
│ KPI: Overall Conversion Rate                                │
│ (event04 / event01) × 100 = 28.5%                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FUNNEL VISUALIZATION                                        │
├─────────────────────────────────────────────────────────────┤
│ Choose Card        │ event01 = 1,000      │ 100%            │
│ Confirm Details    │ event02 = 850        │ 85%  (-15%)      │
│ Employment         │ event03 = 550        │ 55%  (-30%)      │
│ Submit Application │ event04 = 285        │ 28.5% (-26.5%)   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CARD TYPE BREAKDOWN                                         │
├─────────────────────────────────────────────────────────────┤
│ MoneyBack  │ Selections: 400 │ Conversions: 125 │ Rate: 31% │
│ PixelPlay  │ Selections: 350 │ Conversions: 95  │ Rate: 27% │
│ Swiggy     │ Selections: 250 │ Conversions: 65  │ Rate: 26% │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TRAFFIC SOURCE ANALYSIS                                     │
├─────────────────────────────────────────────────────────────┤
│ Source         │ Sessions │ Conversions │ Conv Rate │ ROAS   │
├─────────────────────────────────────────────────────────────┤
│ Organic        │ 500      │ 150         │ 30%       │ 4.2x   │
│ Email          │ 300      │ 95          │ 31.7%     │ 5.1x   │
│ Direct         │ 200      │ 40          │ 20%       │ 2.8x   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ USER SEGMENT ANALYSIS                                       │
├─────────────────────────────────────────────────────────────┤
│ New Users      │ 800 │ Conversions: 215 │ Conv Rate: 26.9% │
│ Returning Users│ 200 │ Conversions: 70  │ Conv Rate: 35%   │
│ Re-entry Users │ 100 │ Conversions: 45  │ Conv Rate: 45%   │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 7: Troubleshooting & Validation

### 7.1 Validation Checklist

- [ ] **Data Layer Present:**
  ```javascript
  // In console, verify this exists and is populated:
  window.appDataLayer
  ```

- [ ] **Events Firing:**
  ```javascript
  // Listen for custom events
  document.addEventListener('app-event', e => console.log(e.detail));
  ```

- [ ] **Launch Rules Triggering:**
  Use Adobe Experience Platform Debugger:
  - Open Debugger → Launch tab
  - Enable Debug mode
  - Navigate form → should see events in Rules Fired section

- [ ] **Analytics Beacons Sending:**
  In Debugger, Analytics tab:
  - Should see `b/ss/...` POST requests
  - Verify eVar/prop/event values are correct

- [ ] **Data in Reports (after 24 hours):**
  In Adobe Analytics:
  - Check Real-Time report → should show immediate events
  - Check Conversion report → event01-04 counts
  - Check Fallout report → funnel visualization

### 7.2 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| No events in appDataLayer | pushEvent not called | Verify block calls pushEvent() at each step |
| Events in data layer but no beacons | Launch rule not firing | Check rule condition (must match eventName exactly) |
| Beacons sent but no data in AA | Analytics not configured | Verify report suite ID in Launch |
| Session ID changing mid-journey | Session not preserved | Check sessionStorage logic |
| Re-entry users counted as new | Visitor ID not persisted | Verify localStorage for visitorId |

---

## Part 8: Advanced Customizations

### 8.1 Optional: Track Micro-Conversions

Add additional eVar for form field completion:

```javascript
window.pushEvent('form_field_update', {
  fieldName: 'fullName',
  fieldValue: true,
  formCompletionPercent: calculateFormCompletion(),
});

function calculateFormCompletion() {
  const fields = ['fullName', 'address', 'pincode', 'empType', 'company'];
  const filled = fields.filter(f => document.querySelector(`#${f}`)?.value).length;
  return Math.round((filled / fields.length) * 100);
}
```

### 8.2 Optional: Mobile App Attribution

If you have a mobile app sending users to this form:

```javascript
// Add to re-entry detection
const appSource = getURLParam('app_source');
if (appSource) {
  window.appDataLayer.visitor.trafficSource = 'mobile_app';
  window.appDataLayer.visitor.appId = appSource;
}
```

### 8.3 Optional: A/B Testing Integration

Track which variant a user saw:

```javascript
const variant = getURLParam('variant') || 'control';
window.appDataLayer.experiment = {
  variantId: variant,
  testName: 'checkout-redesign-dec-2025',
};

// Include in all events
window.pushEvent(eventName, {
  ...eventData,
  experiment: window.appDataLayer.experiment,
});
```

---

## Part 9: List eVar Technical Reference & Troubleshooting

### 9.1 List eVar Data Format Quick Reference

**Format (in browser localStorage):**
```
choose_card|MoneyBack|2025-12-02T10:05:30Z~confirm_details|completed|2025-12-02T10:06:15Z~employment_step|FullTime|2025-12-02T10:07:45Z~application_submit|ORD-ABC123|2025-12-02T10:09:00Z
```

**In Adobe Analytics (eVar50):**
- Each segment (separated by `~`) becomes a **reportable line item**
- Example report shows:
  - Line 1: "choose_card|MoneyBack|2025-12-02T10:05:30Z" — Orders: 850, Conversion: 12.3%
  - Line 2: "confirm_details|completed|2025-12-02T10:06:15Z" — Orders: 820, Conversion: 11.9%
  - Line 3: "employment_step|FullTime|2025-12-02T10:07:45Z" — Orders: 750, Conversion: 10.8%
  - Line 4: "application_submit|ORD-ABC123|2025-12-02T10:09:00Z" — Orders: 750, Conversion: 100%

### 9.2 localStorage Persistence Lifecycle

```
Day 1, Session 1:
├── User lands → journeyList initialized (empty)
├── Step 0 → journeyList = "choose_card|MoneyBack|10:05Z"
├── Step 1 → journeyList = "choose_card|...|10:05Z~confirm_details|...|10:06Z"
├── [ABANDONMENT] → journeyList persists in localStorage
└── Browser closes

Day 2, Session 2:
├── User clicks email link → journeyList retrieved from localStorage
├── Re-entry event added → journeyList = "choose_card|...|10:05Z~...~session_reentry|email|15:30Z"
├── Step 2 → journeyList continues appending (NOT reset)
├── Step 3 → journeyList = "choose_card|...|10:05Z~...~application_submit|ORD-XYZ789|15:33Z"
├── [CONVERSION] → Full journeyList sent to Analytics in one hit
└── Launch rule clears localStorage after conversion
```

**Key Point:** journeyList persists for 90 days (unless manually cleared or browser cache cleared). Never reset on re-entry.

### 9.3 Common Issues & Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| **eVar50 empty in Analytics** | localStorage cleared or CSP blocking write | Check browser console for CSP errors; verify localStorage persisted via dev tools |
| **Only 1-2 touchpoints showing** | List delimiters not matching Launch rule | Verify Launch rule uses `~` as delimiter; check custom code for typos |
| **Events fire but no order** | event04 not configured as Order event | In Analytics Admin: event04 must be "Order" type (revenue event), not "Counter" |
| **Re-entry events not appending** | journeyList cleared after previous session | Verify Launch rule does NOT clear localStorage on non-conversion hits; only clear after event04 |
| **Multiple eVar50 hits per session** | Multiple rules sending analytics beacons | Ensure ONLY Rule #2 (Submit Application) sends `s.t()` beacon; others use `s.tl()` |
| **Data latency > 24 hours** | AA processing queue backlog | Normal for complex list eVars; check real-time reports first, then wait 24-48 hours |

### 9.4 Adobe Analytics Console Verification

**Check 1: Verify eVar50 is configured as List**
```
Analytics Admin → Report Suite → Conversion Variables (eVars)
eVar50:
  ✓ Type = List
  ✓ Delimiter = ~
  ✓ Expiration = 90 days
  ✓ Allocation = Original Value
```

**Check 2: Verify event04 is configured as Order Event**
```
Analytics Admin → Report Suite → Success Events
event04:
  ✓ Type = Order (not Counter)
  ✓ Name = Application Submitted
```

**Check 3: Verify list eVar has a dimension**
```
Workspace → Create new panel
  Dimension: "Journey Touchpoints" (eVar50)
  Metric: "Orders" (event04)
  Breakdown: "Journey Touchpoints" (to see each line item)
```

### 9.5 Launch Rule Validation Checklist

**Before deploying to production:**

```javascript
// Console commands to verify list variable persistence

// 1. Check if journeyList is stored
localStorage.getItem('journeyList');
// Expected output: "choose_card|MoneyBack|...~confirm_details|...~..."

// 2. Check if window.pushEvent is defined
typeof window.pushEvent === 'function';
// Expected output: true

// 3. Check if custom event listener is working
document.addEventListener('app-event', (e) => {
  console.log('Custom event fired:', e.detail);
});
// [Perform action in form] → Should see console log

// 4. Check eVar50 in Launch debugger
// Open Adobe Experience Platform Debugger → Launch tab
// Should show: eVar50 = [full journey list with ~ delimiters]

// 5. Verify Analytics beacon after submission
// Debugger → Analytics tab
// Should show: eVar50=[complete list] + event04=1 (in single hit)
```

---

## Part 10: Documentation & Training

### 10.1 For Analysts

**Primary Report: Multi-Touch Attribution (eVar50 Breakdown)**
```
Workspace Report:
- Rows: eVar50 (Journey Touchpoints)
- Columns: Orders (event04), Conversion Rate, Revenue
- Segment: "Converted Users" (event04 > 0)
- Interpretation: Which touchpoints appear most frequently in converting journeys?
```

**Secondary Reports:**
1. **Path Analysis:** How many touchpoints does conversion journey take?
   - Rows: eVar51 (Journey Count)
   - Metric: Conversion Rate
   - Insight: 3-4 touchpoints? 5+ touchpoints? Single-touch?

2. **Card Attribution:** Which card leads to highest conversion?
   - Rows: eVar50 containing "choose_card|*"
   - Metric: Orders
   - Insight: MoneyBack vs. PixelPlay vs. Swiggy conversion rates

3. **Abandonment Pattern:** Which touchpoint has most drop-off?
   - Segment: "Did NOT convert" (event04 = 0)
   - Rows: eVar50
   - Metric: Visits
   - Insight: Most abandoners stop after which step?

### 10.2 For Marketing

**Email Re-Entry Campaign Optimization:**
- Filter: `eVar50 contains "session_reentry"`
- Metric: Conversion Rate from re-entry
- Insight: Do returning users convert faster? Are they higher value?

**Personalization Opportunities:**
- Create segment: "Confirmed Details but Abandoned Employment"
  - Condition: `eVar50 contains "confirm_details" AND NOT contains "employment_step"`
- Use this segment for retargeting emails: "Complete your application for [Card Name]"

**Campaign Attribution:**
- Tag email links: `?utm_campaign=email-reengagement-dec&step=confirm_details`
- Track which campaigns drive re-entry (eVar99)
- Measure email ROAS: Orders from email re-entry / email send cost

### 10.3 For Product/Engineering

**Key Implementation Points:**
- Launch rules must use tilde (`~`) as delimiter for list eVar
- localStorage key must be `journeyList` (consistency across all rules)
- Clear localStorage ONLY after event04 (conversion) sent
- On re-entry: append re-entry touchpoint; do NOT reset list

**Monitoring:**
- Watch for localStorage quota exceeded errors (CSP or large lists)
- Monitor for Safari Private Browsing (localStorage disabled)
- Test cross-domain scenarios (list persistence across domains)

---

## Part 11: Advanced: List eVar Reports & Dashboards

### 11.1 Fallout Report: Complete Journey Path

**Setup:**
```
Workspace → Fallout Report
Container: Visit
Segments:
  1. "Step 0 – Choose Card" (eVar50 contains "choose_card")
  2. "Step 1 – Confirm" (eVar50 contains "confirm_details")
  3. "Step 2 – Employment" (eVar50 contains "employment_step")
  4. "Step 3 – Submit" (event04 > 0)

Metric: Visits
```

**Insight:**
```
Step 0 → 1: 1000 visits, 85% continue (150 drop)
Step 1 → 2: 850 visits, 88% continue (102 drop)
Step 2 → 3: 748 visits, 100% proceed (0 drop) ← Lowest friction
Step 3: 748 conversions
```

### 11.2 Multi-Touch Attribution Dashboard

**Build using eVar50 Breakdown:**
```
Panel 1: By Touchpoint Count
- Rows: eVar51 (Journey Count = "1", "2", "3", "4", "5+")
- Columns: Conversion Rate, AOV
- Insight: Do longer journeys have higher AOV?

Panel 2: By Entry Card + Final Result
- Rows: eVar50 (first item in list)
- Metric: Orders
- Comparison: Card X starts → 120 orders; Card Y starts → 95 orders

Panel 3: Path Analysis
- Rows: eVar50 (breakdown by each segment)
- Columns: Orders
- Filter: "Converted only"
- Insight: Most common path to conversion?
```

### 11.3 Sample Dashboard Export

**Weekly Report Template:**
```
Date Range: Last 7 days
Segment: "Convertible Traffic" (event04 > 0)

Metric Summary:
├── Total Conversions: 1,250
├── Avg Touchpoints per Conversion: 3.2
├── Most Common Entry Card: MoneyBack (48%)
├── Highest Converting Entry Card: PixelPlay (14.2% conv rate)
├── Email Re-entry Contribution: 18% of conversions
└── Avg Days from First Touch to Conversion: 2.3 days

Top Paths:
1. choose_card|MoneyBack → confirm_details → employment_step → submit → 285 orders
2. choose_card|Swiggy → confirm_details → submit (skip employment) → 162 orders
3. session_reentry|email → confirm_details → submit → 145 orders

Abandonment Points:
├── After choose_card: 850 users (15% abandon here)
├── After confirm_details: 340 users (4% abandon here)
├── After employment_step: 12 users (<1% abandon here)
└── Total abandonment rate: 19%
```

---
- Enhanced data layer schema in `appDataLayer` (well-structured, easily extensible)
- Session/visitor management handles edge cases (re-entry, refresh, back button)

---

## Summary Table: Complete Tracking Model

| Component | Details | Implementation |
|-----------|---------|-----------------|
| **Data Layer** | Visitor, Session, Form, Events, Journey context | `window.appDataLayer` + `pushEvent()` in scripts/aem.js |
| **Events** | 4 step events + 1 re-entry event | Choose Card, Confirm Details, Employment, Submit Application, Session Re-entry |
| **Launch Rules** | 5 rules for event capture | 1 rule per event type + custom conditions |
| **AA Variables** | eVar01-04, eVar50, eVar99 + props + events | Configured in Adobe Analytics Admin |
| **Attribution** | Multi-touch via Session ID + Visitor ID | Order linked to session; Visitor ID links sessions |
| **Re-entry** | Email campaign tracking + form pre-pop | URL params + sessionStorage + localStorage |
| **Reports** | Funnel, conversion rate, cohort analysis | Fallout report, calculated metrics, segments |

---

## Appendix: Code Snippets

### A.1 Complete Enhanced pushEvent Function

```javascript
window.pushEvent = function(eventName, data = {}) {
  // Initialize data layer if needed
  window.appDataLayer = window.appDataLayer || {
    visitor: {},
    form: {},
    events: [],
    journey: {},
  };

  const eventObj = {
    eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    eventName: eventName,
    eventType: data.eventType || 'step',
    eventTimestamp: new Date().toISOString(),
    eventSequence: (window.appDataLayer.events || []).length + 1,
    userId: window.appDataLayer.visitor?.userId || null,
    sessionId: window.appDataLayer.visitor?.sessionId || null,
    visitorId: window.appDataLayer.visitor?.visitorId || null,
    productDetails: {
      selectedCard: window.appDataLayer.form?.selectedCard || null,
      cardCategory: getCategoryForCard(window.appDataLayer.form?.selectedCard),
    },
    ...data,
  };

  window.appDataLayer.events.push(eventObj);
  document.dispatchEvent(new CustomEvent('app-event', { detail: eventObj }));
  console.debug('pushEvent:', eventObj);
};

function getCategoryForCard(cardName) {
  const categoryMap = {
    'MoneyBack': 'rewards',
    'PixelPlay': 'digital',
    'Swiggy': 'cashback',
  };
  return categoryMap[cardName] || 'standard';
}
```

---

**End of Document**

Generated: December 2, 2025  
Version: 1.0  
Status: Ready for Implementation
