# Frontend Debugging

**Category:** Debugging
**Tier:** 1

## Skill Description

Systematically diagnose frontend issues using browser DevTools, console methods, and debugging techniques to isolate JavaScript errors, layout problems, state bugs, and performance bottlenecks.

## Instructions

When debugging frontend issues:

### 1. Use Console Methods Effectively

Beyond `console.log`, use specialized methods:

```javascript
// Group related logs
console.group('User Authentication');
console.log('Token:', token);
console.log('User:', user);
console.groupEnd();

// Table for arrays/objects
console.table(users);

// Timing
console.time('render');
renderComponent();
console.timeEnd('render'); // render: 12.34ms

// Conditional logging
console.assert(user.id, 'User ID is missing!');

// Stack trace
console.trace('How did we get here?');

// Styled logs
console.log('%cError!', 'color: red; font-weight: bold', message);
```

### 2. Master Browser DevTools

**Elements Panel:**
- Inspect computed styles (shows final applied values)
- Check box model for margin/padding issues
- Force element states (`:hover`, `:focus`, `:active`)
- Edit HTML/CSS live to test fixes

**Console Panel:**
- `$0` references the currently selected element
- `$_` references the last evaluated expression
- `copy(object)` copies object as JSON to clipboard
- Right-click logs to "Store as global variable"

**Sources Panel:**
- Set breakpoints by clicking line numbers
- Conditional breakpoints: right-click → "Add conditional breakpoint"
- Logpoints: log without modifying code (right-click → "Add logpoint")
- Watch expressions to monitor variables

**Network Panel:**
- Throttle connection to simulate slow networks
- Block requests to test error handling
- Right-click → "Copy as fetch" to replicate requests

### 3. Debug JavaScript Errors

**Read error messages carefully:**

| Error Type | Meaning |
|------------|---------|
| `ReferenceError` | Variable doesn't exist in scope |
| `TypeError` | Wrong type (calling non-function, accessing property of undefined) |
| `SyntaxError` | Invalid JavaScript syntax |
| `RangeError` | Number out of valid range |

**Common patterns:**

```javascript
// "Cannot read property 'x' of undefined"
// Problem: Accessing property on undefined/null
// Fix: Optional chaining
const value = obj?.deeply?.nested?.property;

// "x is not a function"
// Problem: Calling something that isn't a function
// Check: Is it imported correctly? Is it initialized?

// "Cannot access 'x' before initialization"
// Problem: Temporal dead zone with let/const
// Fix: Move declaration before usage
```

**Use debugger statement:**

```javascript
function problematicFunction(data) {
  debugger; // Execution pauses here when DevTools is open
  return data.map(item => item.value);
}
```

### 4. Debug Layout and CSS Issues

**Common layout problems:**

| Symptom | Check |
|---------|-------|
| Element not visible | `display: none`, `visibility: hidden`, `opacity: 0`, zero dimensions, off-screen position |
| Content overflowing | `overflow` property, fixed heights, flex/grid constraints |
| Unexpected spacing | Box model (margin collapse), inherited styles, browser defaults |
| Z-index not working | Parent stacking context, `position` property |
| Flexbox not working | Missing `display: flex` on parent, `flex-shrink` eating space |

**Debugging techniques:**

```css
/* Outline everything to see boundaries */
* { outline: 1px solid red !important; }

/* Specific element debugging */
.problem-element {
  outline: 2px solid lime !important;
  background: rgba(255, 0, 0, 0.2) !important;
}
```

**Check computed styles:**
1. Right-click element → Inspect
2. Go to "Computed" tab
3. See final resolved values and which rules apply

### 5. Debug React Components

**React DevTools:**
- Inspect component tree and props/state
- Search for components by name
- Highlight updates to see unnecessary re-renders
- Profile renders to find performance issues

**Debug re-renders:**

```javascript
// Log when component renders
function MyComponent(props) {
  console.log('MyComponent rendered', props);

  // Or use useEffect to track
  useEffect(() => {
    console.log('Props changed:', props);
  });

  return <div>...</div>;
}

// Find why it re-rendered
import { useRef, useEffect } from 'react';

function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();

  useEffect(() => {
    if (previousProps.current) {
      const changes = {};
      Object.keys({ ...previousProps.current, ...props }).forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changes[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });
      if (Object.keys(changes).length) {
        console.log('[why-did-you-update]', name, changes);
      }
    }
    previousProps.current = props;
  });
}
```

### 6. Debug State Issues

**Log state changes:**

```javascript
// React useState with logging
const [state, _setState] = useState(initialValue);
const setState = (newValue) => {
  console.log('State changing:', state, '→', newValue);
  _setState(newValue);
};

// Check if state is stale in callbacks
useEffect(() => {
  const handler = () => {
    console.log('Current state:', state); // May be stale!
  };
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, [state]); // Don't forget dependencies
```

**Common state bugs:**

| Symptom | Likely Cause |
|---------|--------------|
| Stale state in callback | Missing dependency in useEffect/useCallback |
| State not updating | Mutating state directly instead of creating new reference |
| Infinite re-renders | Setting state unconditionally in useEffect |
| State resets unexpectedly | Component unmounting/remounting (check key prop) |

### 7. Debug Performance Issues

**Quick checks:**
1. Open DevTools → Performance tab
2. Click Record, perform slow action, stop
3. Look for long tasks (red corners) in flame chart

**Common issues:**

```javascript
// Problem: Expensive calculation on every render
function Component({ items }) {
  const sorted = items.sort((a, b) => a.name.localeCompare(b.name)); // Runs every render!

  // Fix: useMemo
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );
}

// Problem: Creating new objects/arrays in props
<Child style={{ color: 'red' }} /> // New object every render!

// Fix: Stable reference
const style = useMemo(() => ({ color: 'red' }), []);
<Child style={style} />
```

**Memory leaks:**
- Check for missing cleanup in useEffect
- Look for event listeners not removed
- Watch for intervals/timeouts not cleared

### 8. Systematic Debugging Checklist

1. **Reproduce** — Can you reliably trigger the bug?
2. **Isolate** — Remove code until bug disappears, then add back
3. **Inspect** — Check DevTools console, network, elements
4. **Hypothesize** — What do you think is wrong?
5. **Test** — Add logging/breakpoints to verify hypothesis
6. **Fix** — Make the smallest change that fixes it
7. **Verify** — Confirm fix doesn't break other things

## Copy-Paste Skill Text

```
Debug frontend issues systematically: use console.group/table/time for organized logging, master DevTools panels (Elements for CSS, Sources for breakpoints, Network for requests). For JavaScript errors, read the error type carefully—TypeError means wrong type, ReferenceError means undefined variable. Debug CSS by outlining elements and checking computed styles. For React, use React DevTools to inspect state/props and track re-renders. Check for stale state in callbacks (missing useEffect dependencies), state mutation instead of new references, and memory leaks from missing cleanup. Always reproduce, isolate, inspect, hypothesize, test, fix, verify.
```
