# URL Busy Events App

This app allows you to connect to an external URL to fetch busy events data for calendar integration.

## Features

- **URL Configuration**: Connect to any HTTP endpoint that provides busy events data
- **Custom Headers**: Add authentication headers or other custom HTTP headers
- **Automatic Query Parameters**: Start and end times are automatically passed as query parameters in ISO format
- **Data Validation**: Ensures the response data is in the correct format
- **Error Handling**: Comprehensive error handling for network issues and invalid responses

## Setup

1. **URL**: Enter the endpoint URL that provides busy events data
2. **Headers** (optional): Add any required HTTP headers using the key-value interface:
   - Click "Add Header" to add a new header
   - Enter the header name (e.g., `Authorization`)
   - Enter the header value (e.g., `Bearer token`)
   - Click "Remove" to delete individual headers
   - Header names must be unique

## Expected Response Format

The URL endpoint should return a JSON array of busy events with the following structure:

```json
[
  {
    "startAt": "2024-01-15T09:00:00Z",
    "endAt": "2024-01-15T10:00:00Z",
    "title": "Meeting Title (optional)",
    "uid": "unique-event-id (optional)"
  }
]
```

### Required Fields

- `startAt`: Start time in ISO 8601 format
- `endAt`: End time in ISO 8601 format

### Optional Fields

- `title`: Event title
- `uid`: Unique identifier (auto-generated if not provided)

## Query Parameters

When busy times are requested, the app will automatically add these query parameters to your URL:

- `start`: Start time in ISO format (e.g., `2024-01-15T00:00:00.000Z`)
- `end`: End time in ISO format (e.g., `2024-01-15T23:59:59.000Z`)

Example: `https://example.com/api/busy-events?start=2024-01-15T00%3A00%3A00.000Z&end=2024-01-15T23%3A59%3A59.000Z`

## Future Extensibility

This app is designed to be easily extensible for future features:

- **HTTP Methods**: Support for POST, PUT, DELETE requests
- **Return Types**: Support for different response formats (XML, CSV, etc.)
- **Property Matchers**: Dynamic field mapping for different API response structures
- **Authentication Methods**: OAuth, API keys, custom authentication flows
- **Data Transformation**: Custom data processing and filtering

## Error Handling

The app handles various error scenarios:

- **Network Errors**: Connection timeouts, DNS resolution failures
- **HTTP Errors**: 4xx and 5xx status codes
- **Invalid Response Format**: Non-JSON responses, missing required fields
- **Data Validation**: Invalid date formats, invalid date ranges

## Example Implementation

Here's a simple Node.js/Express endpoint that works with this app:

```javascript
app.get("/api/busy-events", (req, res) => {
  const { start, end } = req.query;

  // Your logic to fetch busy events between start and end times
  const busyEvents = [
    {
      startAt: "2024-01-15T09:00:00Z",
      endAt: "2024-01-15T10:00:00Z",
      title: "Team Meeting",
      uid: "team-meeting-123",
    },
  ];

  res.json(busyEvents);
});
```
