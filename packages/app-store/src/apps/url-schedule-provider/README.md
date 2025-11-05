# URL Schedule Provider App

This app allows you to connect to an external URL to fetch schedule data for calendar integration.

## Features

- **URL Configuration**: Connect to any HTTP endpoint that provides schedule data
- **Custom Headers**: Add authentication headers or other custom HTTP headers
- **Automatic Query Parameters**: Start and end times are automatically passed as query parameters in ISO format
- **Data Validation**: Ensures the response data is in the correct format
- **Error Handling**: Comprehensive error handling for network issues and invalid responses

## Setup

1. **URL**: Enter the endpoint URL that provides schedule data
2. **Headers** (optional): Add any required HTTP headers using the key-value interface:
   - Click "Add Header" to add a new header
   - Enter the header name (e.g., `Authorization`)
   - Enter the header value (e.g., `Bearer token`)
   - Click "Remove" to delete individual headers
   - Header names must be unique

## Expected Response Format

The URL endpoint should return a JSON object with dates as keys and schedule shifts as values:

```json
{
  "2024-01-15": [
    {
      "start": "09:00",
      "end": "17:00"
    },
    {
      "start": "18:00",
      "end": "22:00"
    }
  ],
  "2024-01-16": [
    {
      "start": "08:00",
      "end": "16:00"
    }
  ]
}
```

### Required Fields

- **Date Keys**: Must be in `YYYY-MM-DD` format
- **Shifts Array**: Array of shift objects for each date
- **Start Time**: Must be in `HH:mm` format (24-hour)
- **End Time**: Must be in `HH:mm` format (24-hour)

## Query Parameters

When schedule data is requested, the app will automatically add these query parameters to your URL:

- `start`: Start date in ISO format (e.g., `2024-01-15T00:00:00.000Z`)
- `end`: End date in ISO format (e.g., `2024-01-15T23:59:59.000Z`)

Example: `https://example.com/api/schedule?start=2024-01-15T00%3A00%3A00.000Z&end=2024-01-15T23%3A59%3A59.000Z`

## Test Server

Use the included test server to test the integration:

```bash
node test-schedule-server.js
```

The test server runs on `http://localhost:3002` and generates realistic schedule data:

- **Weekdays**: 1-3 shifts per day (8:00-18:00)
- **Weekends**: No shifts
- **Random Times**: Varied start/end times within business hours

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
- **Data Validation**: Invalid date formats, invalid time formats

## Example Implementation

Here's a simple Node.js/Express endpoint that works with this app:

```javascript
app.get("/api/schedule", (req, res) => {
  const { start, end } = req.query;

  // Your logic to fetch schedule between start and end dates
  const schedule = {
    "2024-01-15": [
      { start: "09:00", end: "17:00" },
      { start: "18:00", end: "22:00" },
    ],
    "2024-01-16": [{ start: "08:00", end: "16:00" }],
  };

  res.json(schedule);
});
```
