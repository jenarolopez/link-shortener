# Data Flow Documentation

## 1. HTML Processing Flow: Raw HTML to Shortened Links

```plantuml
@startuml
!theme plain
skinparam sequenceMessageAlign center
skinparam responseMessageBelowArrow true

actor "Client" as CL
participant "Express Server" as ES
participant "HTML Processor" as HP
database "URL Map" as UM

CL -> ES: 1. POST /process-html\n(raw HTML with links)
ES -> HP: 2. processHTML(rawHTML)

group For each <a> tag in HTML
    HP -> HP: 3. Extract original URL
    HP -> HP: 4. Generate shortId (UUID)
    HP -> UM: 5. Store mapping\n(shortId → originalUrl)
    HP -> HP: 6. Replace URL with\nhttp://localhost:3000/shortId
end

HP --> ES: 7. Return processed HTML
ES --> CL: 8. Return HTML with\nshortened links

note right of HP
  Example transformation:
  Input: <a href="https://example.com">Link</a>
  Output: <a href="http://localhost:3000/abc123">Link</a>
end note
@enduml
```

### Key Implementation Points

1. **HTML Processing**
```typescript
// From htmlProcessor.ts
export function processHTML(rawHTML: string): string {
  const dom = new JSDOM(rawHTML);
  dom.window.document.querySelectorAll('a').forEach(anchor => {
    const originalUrl = anchor.href;
    const shortId = uuidv4().slice(0, 8);
    urlMap.set(shortId, originalUrl);
    anchor.href = `http://localhost:3000/${shortId}`;
  });
  return dom.serialize();
}
```

## 2. Link Click Flow: Click to Analytics and Redirect

```plantuml
@startuml
!theme plain
skinparam sequenceMessageAlign center
skinparam responseMessageBelowArrow true

actor "Client" as CL
participant "Express Server" as ES
database "URL Map" as UM
queue "Redis Queue" as RQ
database "Analytics Log" as AL

CL -> ES: 1. GET /:shortId
ES -> UM: 2. Look up original URL
UM --> ES: 3. Return original URL

alt URL found
    ES -> RQ: 4. Queue analytics event
    note right
        Analytics Data:
        - shortId
        - timestamp
        - userAgent
        - ip
    end note
    ES --> CL: 5. 302 Redirect to original URL
    RQ -> AL: 6. Process & store analytics
else URL not found
    ES --> CL: 4. 404 Not Found
end

note right of ES
  Example:
  GET /abc123
  → 302 Redirect to https://example.com
  → Log analytics asynchronously
end note
@enduml
```

### Key Implementation Points

1. **Link Click Handling**
```typescript
// From shortenerRoutes.ts
const handleShortUrl: RequestHandler<RequestParams> = async (req, res) => {
  const shortId = req.params.shortId;
  const originalUrl = urlMap.get(shortId);
  
  if (!originalUrl) return res.status(404).send('URL not found');
  
  await analyticsQueue.add({
    shortId,
    timestamp: new Date(),
    userAgent: req.headers['user-agent'] || 'unknown',
    ip: req.ip || ""
  });
  
  return res.redirect(302, originalUrl);
};
```

### Storage Details

1. **URL Storage**
- In-memory Map
- Key: 8-character UUID
- Value: Original URL

2. **Analytics Storage**
- Redis Queue for processing
- In-memory array for storage
- Asynchronous processing
- Retry logic for failed operations