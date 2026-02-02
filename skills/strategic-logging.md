# Strategic Logging

**Category:** Debugging  
**Tier:** 2

## Skill Description

Add targeted, temporary logging to isolate bugs without drowning in noise. Remove or convert to proper logging levels before committing.

## Instructions

When adding debug logging to isolate issues:

1. **Log at boundaries, not everywhere** — Focus on:
   - Function entry/exit points with parameters and return values
   - Before and after async operations (API calls, DB queries)
   - Conditional branches to see which path was taken
   - Loop iterations (but limit to first/last few if large)

2. **Use structured, searchable prefixes:**

   ```javascript
   console.log("[DEBUG:auth]", "User lookup:", { userId, timestamp });
   console.log("[DEBUG:auth]", "Lookup result:", user ?? "NOT FOUND");
   ```

3. **Log the actual values, not just "here":**

   ```javascript
   // BAD
   console.log("got here");
   console.log("data:", data);

   // GOOD
   console.log("[processOrder] input:", {
     orderId,
     items: items.length,
     total,
   });
   console.log("[processOrder] validation:", { isValid, errors });
   ```

4. **Use console methods appropriately:**
   - `console.log()` — General flow
   - `console.table()` — Arrays/objects with consistent shape
   - `console.group()`/`groupEnd()` — Nested operations
   - `console.time()`/`timeEnd()` — Performance
   - `console.trace()` — When you need the call stack

5. **Add conditional logging for production:**

   ```javascript
   const DEBUG = process.env.NODE_ENV !== 'production';
   DEBUG && console.log('[DEBUG]', ...);
   ```

6. **Clean up before committing:**
   - Search for your debug prefix: `git diff | grep DEBUG`
   - Convert useful logs to proper logging (winston, pino)
   - Remove temporary console.logs entirely

## Advanced Patterns

### Tap function for pipelines

```javascript
const tap = (label) => (value) => {
  console.log(`[${label}]`, value);
  return value;
};

// Usage in chains
fetchUser(id)
  .then(tap("raw user"))
  .then(normalizeUser)
  .then(tap("normalized"))
  .then(saveToCache);
```

### Conditional breakpoints (browser)

Instead of logging, add a conditional breakpoint that logs:

```javascript
// In DevTools, right-click line > "Add conditional breakpoint"
// Enter: (console.log('value:', x), false)
// This logs but never pauses (returns false)
```

### Network request logging

```javascript
// Intercept all fetches temporarily
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log("[FETCH]", args[0], args[1]?.method ?? "GET");
  const response = await originalFetch(...args);
  console.log("[FETCH RESULT]", args[0], response.status);
  return response;
};
```

## Copy-Paste Skill Text

```
Add strategic debug logging at boundaries: function entry/exit, before/after async ops, and conditional branches. Use searchable prefixes like `[DEBUG:module]` with actual values, not just markers. Use console.table() for arrays, console.group() for nesting, console.time() for performance. Always clean up before committing—search for your prefix in the diff. Convert useful logs to proper logging levels; remove the rest.
```
