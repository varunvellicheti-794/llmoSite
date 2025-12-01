# Adobe Analytics Integration Guide

## Overview

This document explains how the credit-step block fires data-layer events that Launch rules consume to send Adobe Analytics beacons.

---

## Architecture

### Global Data Layer (`scripts/aem.js`)

The data layer is initialized early in `setup()`:

```javascript
window.appDataLayer = window.appDataLayer || [];

window.pushEvent = function(eventName, data = {}) {
  const eventObj = {
    event: eventName,
    time: new Date().toISOString(),
    ...data,
  };
  window.appDataLayer.push(eventObj);
  document.dispatchEvent(new CustomEvent('app-event', { detail: eventObj }));
  console.debug('pushEvent:', eventObj);
};
```

**Key features:**
- `window.appDataLayer`: array of all events fired (inspectable in console)
- `window.pushEvent(eventName, data)`: function to fire events
- Dispatches a custom DOM event `app-event` that Adobe Launch rules can listen to

---

## Events Fired by Credit-Step Block

### 1. Choose Card (`choose_card`)

**When:** User clicks a card

**Payload:**
```javascript
{
  event: 'choose_card',
  time: '2025-12-01T12:34:56.789Z',
  cardName: 'MoneyBack'  // or 'PixelPlay', 'Swiggy'
}
```

### 2. Confirm Details (`confirm_details`)

**When:** User advances from Step 1 to Step 1 (Confirm Details view)

**Payload:**
```javascript
{
  event: 'confirm_details',
  time: '2025-12-01T12:34:57.000Z',
  stepIndex: 1,
  stepName: 'Confirm Details'
}
```

### 3. Employment (`employment_step`)

**When:** User advances to Step 2 (Employment view)

**Payload:**
```javascript
{
  event: 'employment_step',
  time: '2025-12-01T12:34:58.000Z',
  stepIndex: 2,
  stepName: 'Employment'
}
```

### 4. Submit Application (`application_submit`)

**When:** User clicks Submit button (Step 3)

**Payload:**
```javascript
{
  event: 'application_submit',
  time: '2025-12-01T12:34:59.000Z',
  selectedCard: 'MoneyBack',
  formCompleted: true
}
```

---

## Adobe Launch Rule Setup

### Rule 1: "Choose Card – Track Event"

**Trigger:**
- **Type:** Custom Event
- **Event Name:** `app-event`

**Condition:**
```
event.detail.event == "choose_card"
```

**Actions:**

1. **Adobe Analytics – Set Variables**
   - eVar01 = `%event.detail.cardName%`
   - event01 = 1

2. **Adobe Analytics – Send Beacon**
   - Select "Link" (s.tl)
   - Link name: `%event.detail.event%`
   - Link type: "o" (Other)

---

### Rule 2: "Confirm Details – Track Event"

**Trigger:**
- **Type:** Custom Event
- **Event Name:** `app-event`

**Condition:**
```
event.detail.event == "confirm_details"
```

**Actions:**

1. **Adobe Analytics – Set Variables**
   - eVar02 = `%event.detail.stepName%`
   - event02 = 1

2. **Adobe Analytics – Send Beacon**
   - Link name: `%event.detail.event%`
   - Link type: "o"

---

### Rule 3: "Employment – Track Event"

**Trigger:**
- **Type:** Custom Event
- **Event Name:** `app-event`

**Condition:**
```
event.detail.event == "employment_step"
```

**Actions:**

1. **Adobe Analytics – Set Variables**
   - eVar03 = `%event.detail.stepName%`
   - event03 = 1

2. **Adobe Analytics – Send Beacon**
   - Link name: `%event.detail.event%`
   - Link type: "o"

---

### Rule 4: "Application Submit – Track Event"

**Trigger:**
- **Type:** Custom Event
- **Event Name:** `app-event`

**Condition:**
```
event.detail.event == "application_submit"
```

**Actions:**

1. **Adobe Analytics – Set Variables**
   - eVar04 = "Form Submit"
   - event04 = 1

2. **Adobe Analytics – Send Beacon**
   - Link name: `%event.detail.event%`
   - Link type: "o"

---

## Debugging

### Step 1: Verify Data Layer Pushes

Open the browser console and run:

```javascript
window.appDataLayer
```

You should see an array of event objects. Example output:

```javascript
[
  { event: 'choose_card', time: '...', cardName: 'MoneyBack' },
  { event: 'confirm_details', time: '...', stepIndex: 1, stepName: 'Confirm Details' },
  { event: 'employment_step', time: '...', stepIndex: 2, stepName: 'Employment' },
  { event: 'application_submit', time: '...', selectedCard: 'MoneyBack', formCompleted: true }
]
```

### Step 2: Verify Custom Events

Run this in the console:

```javascript
document.addEventListener('app-event', e => {
  console.log('Custom Event Fired:', e.detail);
});
```

Then interact with the form. You should see custom events logged for each step.

### Step 3: Use Adobe Experience Platform Debugger

1. Install the [Adobe Experience Platform Debugger](https://chrome.google.com/webstore/detail/adobe-experience-platform/bfim46fefpmeafpcinbhpaknidpefjjd) Chrome extension.
2. Open the extension and navigate to the **Launch** tab.
3. Select your Launch property from the dropdown.
4. Enable **Debug Mode** (you should see a debug message in the console).
5. Navigate to the **Analytics** section in the debugger.
6. Interact with the form:
   - Choose a card → you should see a `b/ss/...` network request
   - Advance to next step → you should see another `b/ss/...` request
   - Continue through all steps and submit

**Expected network calls:**
- Each event should trigger a POST to `b/ss/...` (Adobe Analytics collection server)
- Check the debugger's Analytics panel; you should see variables populated

### Step 4: Check Adobe Analytics Reports

After a few hours, data should appear in your Adobe Analytics report suite:

1. Go to **Analysis Workspace** or **Reports & Analytics**
2. Check for custom eVar/event metrics you configured in the rules
3. Verify touchpoint attribution across the 4 steps

---

## Verification Checklist

- [ ] `window.appDataLayer` contains events when form steps are clicked
- [ ] `app-event` custom events fire (verify in console listener)
- [ ] Adobe Experience Platform Debugger shows Launch rules firing
- [ ] Debugger shows `b/ss/...` network calls with correct eVar/event values
- [ ] After ~24 hours, events appear in Adobe Analytics report suite
- [ ] Attribution model captures all 4 touchpoints (Choose Card → Confirm → Employment → Submit)

---

## Web SDK / Edge Network Option (Alternative)

If you're using Web SDK instead of Launch + AppMeasurement:

Modify the event payload in `scripts/aem.js` to include XDM:

```javascript
window.pushEvent = function(eventName, data = {}) {
  const eventObj = {
    event: eventName,
    time: new Date().toISOString(),
    ...data,
  };
  window.appDataLayer.push(eventObj);
  
  // Send XDM via Web SDK
  if (window.alloy) {
    window.alloy('sendEvent', {
      xdm: {
        eventType: eventName,
        web: { webInteraction: { name: eventName, type: 'other' } },
        ...data
      }
    });
  }
  
  document.dispatchEvent(new CustomEvent('app-event', { detail: eventObj }));
};
```

---

## Troubleshooting

### No network calls appear in debugger

**Cause:** Launch rules are not triggering.

**Solution:**
- Verify custom event condition matches event names exactly (case-sensitive)
- Confirm rule is published to the Development environment
- Check that Adobe Analytics extension is configured in Launch

### Data appears in appDataLayer but no Analytics hits

**Cause:** Custom event is not being listened to by a Launch rule.

**Solution:**
- Add a new rule with event type "Custom Event" and event name "app-event"
- Verify the condition matches your event name
- Add a dummy Adobe Analytics action to confirm the rule fires

### Wrong data in eVars

**Cause:** Field mapping is incorrect in the rule.

**Solution:**
- Check that `%event.detail.fieldName%` matches the actual property in your payload
- Test with a hardcoded value first: instead of `%event.detail.cardName%`, try `test_value`

---

## Files Modified

- `scripts/aem.js`: Added global data layer and `pushEvent` function in `setup()`
- `blocks/credit-step/credit-step.js`: Added `pushEvent` calls for each touchpoint

## Next Steps

1. Set up the 4 Launch rules as documented above
2. Publish to Development environment
3. Test with `?launch=debug` query param
4. Verify eVar/event data in Adobe Analytics after ~24 hours
5. Set up attribution model to track journey across all 4 touchpoints
