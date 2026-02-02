# Stack Trace Analysis

**Category:** Debugging  
**Tier:** 1

## Skill Description

When encountering errors, always read stack traces from bottom to top. The bottom shows the entry point; the top shows where the error actually occurred.

## Instructions

When debugging errors with stack traces:

1. **Identify the error type and message first** — Read the error name (e.g., `TypeError`, `ReferenceError`, `ENOENT`) and the message. This tells you _what_ went wrong.

2. **Find your code in the trace** — Skip over frames from `node_modules/`, framework internals, or runtime code. Look for file paths in your project.

3. **Read the top frame carefully** — This is where the error was thrown. Note:
   - The exact file path
   - The line number and column
   - The function name (or `<anonymous>` if it's a callback)

4. **Trace backwards through your code** — Follow the call chain downward through frames that are in your codebase to understand how you got there.

5. **Check for async boundaries** — Look for `async` functions, `.then()` chains, or `await` keywords. Async errors can have truncated traces. If you see `at processTicksAndRejections` or similar, the real origin may be in a previous async call.

6. **Reproduce with more context** — If the trace is unclear, add `Error.captureStackTrace()` or wrap suspicious code in try-catch to get better traces.

## Example Analysis

```
TypeError: Cannot read properties of undefined (reading 'map')
    at renderItems (src/components/List.tsx:15:23)
    at List (src/components/List.tsx:28:10)
    at renderWithHooks (node_modules/react-dom/...)
    at mountIndeterminateComponent (node_modules/react-dom/...)
```

**Analysis:**

- Error: Trying to call `.map()` on `undefined`
- Location: `List.tsx`, line 15, column 23, inside `renderItems` function
- Cause: The `items` prop is undefined when `renderItems` is called
- Fix: Add a guard (`items?.map()` or default value) or trace why `items` is undefined

## Copy-Paste Skill Text

```
When analyzing errors, read stack traces methodically: identify the error type and message, find your code in the trace (skip node_modules), examine the top frame for exact location, then trace backwards through your code to understand the call chain. Watch for async boundaries that may truncate traces. Always reproduce with added context if the trace is unclear.
```
