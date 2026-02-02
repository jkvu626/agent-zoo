# API & REST Error Debugging

**Category:** Debugging  
**Tier:** 2

## Skill Description

Systematically diagnose HTTP/REST API errors by interpreting status codes, inspecting request/response cycles, and isolating whether issues are client-side, server-side, or network-related.

## Instructions

When debugging API errors:

### 1. Interpret HTTP Status Codes Correctly

| Code Range | Meaning      | Who's Responsible                 |
| ---------- | ------------ | --------------------------------- |
| **2xx**    | Success      | —                                 |
| **3xx**    | Redirect     | Check if client follows redirects |
| **4xx**    | Client Error | Your request is wrong             |
| **5xx**    | Server Error | Server/backend issue              |

**Common codes to know:**

- `400 Bad Request` — Malformed JSON, missing required fields, validation failed
- `401 Unauthorized` — Missing or invalid auth token
- `403 Forbidden` — Valid auth but insufficient permissions
- `404 Not Found` — Wrong URL path or resource doesn't exist
- `405 Method Not Allowed` — Wrong HTTP verb (GET vs POST vs PUT)
- `409 Conflict` — Resource state conflict (duplicate, version mismatch)
- `422 Unprocessable Entity` — Valid JSON but semantically wrong
- `429 Too Many Requests` — Rate limited
- `500 Internal Server Error` — Unhandled server exception
- `502 Bad Gateway` — Proxy/load balancer can't reach backend
- `503 Service Unavailable` — Server overloaded or in maintenance
- `504 Gateway Timeout` — Backend took too long to respond

### 2. Inspect the Full Request/Response Cycle

**In browser DevTools (Network tab):**

1. Filter by `Fetch/XHR` to see API calls only
2. Click the failed request and check:
   - **Headers tab**: Request headers, auth tokens, content-type
   - **Payload tab**: What you actually sent
   - **Response tab**: Error message from server
   - **Timing tab**: Where time was spent

**Check these common issues:**

```javascript
// Missing Content-Type header
fetch("/api/users", {
  method: "POST",
  body: JSON.stringify(data),
  // MISSING: headers: { 'Content-Type': 'application/json' }
});

// Auth token not attached
fetch("/api/protected", {
  // MISSING: headers: { 'Authorization': `Bearer ${token}` }
});

// Wrong HTTP method
fetch("/api/users/123", { method: "POST" }); // Should be PUT or PATCH
```

### 3. Isolate Client vs Server Issues

**Test with curl or Postman first:**

```bash
# Replicate the exact request outside your app
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Test", "email": "test@example.com"}' \
  -v  # verbose output shows headers
```

- **Works in curl, fails in app** → Client-side issue (CORS, headers, request building)
- **Fails in both** → Server-side issue or wrong endpoint

### 4. Debug CORS Errors

CORS errors appear in console but NOT in the Network tab response body.

**Common CORS messages:**

- `No 'Access-Control-Allow-Origin' header` → Server doesn't allow your origin
- `Method PUT is not allowed` → Server doesn't include PUT in `Access-Control-Allow-Methods`
- `Request header field X-Custom is not allowed` → Missing from `Access-Control-Allow-Headers`

**Debugging steps:**

1. Check if there's a preflight `OPTIONS` request (for non-simple requests)
2. Verify the server's CORS configuration includes your origin
3. For local dev, use a proxy (Vite: `server.proxy`, CRA: `proxy` in package.json)

### 5. Handle Network Errors vs HTTP Errors

```javascript
try {
  const response = await fetch("/api/data");

  // This runs even for 4xx/5xx - fetch only rejects on network failure
  if (!response.ok) {
    // HTTP error - server responded with error status
    const error = await response.json();
    console.error("[API Error]", response.status, error);
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return await response.json();
} catch (err) {
  if (err.name === "TypeError" && err.message === "Failed to fetch") {
    // Network error - server unreachable, CORS, or request aborted
    console.error("[Network Error]", err);
  }
  throw err;
}
```

### 6. Debug Request/Response Transformation

Log at each stage of the pipeline:

```javascript
async function apiCall(endpoint, options) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  };

  console.log("[API Request]", {
    url,
    method: config.method,
    body: config.body,
  });

  const response = await fetch(url, config);
  const data = await response.json();

  console.log("[API Response]", {
    status: response.status,
    ok: response.ok,
    data,
  });

  return { response, data };
}
```

### 7. Common Gotchas

| Symptom                      | Likely Cause                                            |
| ---------------------------- | ------------------------------------------------------- |
| 401 on every request         | Token expired, not refreshed, or not sent               |
| 400 with no details          | Check request body shape matches API schema             |
| Works locally, fails in prod | Environment variables, CORS config, HTTPS               |
| Intermittent 500s            | Race conditions, connection pool exhaustion             |
| Response is HTML not JSON    | Wrong endpoint, server error page, or redirect to login |
| Empty response body          | Check response headers, might be 204 No Content         |

## Copy-Paste Skill Text

```
Debug API errors systematically: interpret HTTP status codes (4xx = client error, 5xx = server error), inspect the full request/response in DevTools Network tab, and test with curl to isolate client vs server issues. Check Content-Type headers, auth tokens, and HTTP methods. For CORS errors, look for the preflight OPTIONS request and verify server configuration. Remember that fetch() only rejects on network failures—always check response.ok for HTTP errors. Log at request/response boundaries to trace data transformation issues.
```
