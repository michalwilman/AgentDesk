# AgentDesk API Documentation

<div align="center">

**Complete REST API Reference for AgentDesk Platform**

Version 1.0 | Last Updated: October 2025

[Quick Start](#-quick-start) • [Authentication](#-authentication) • [Endpoints](#-api-endpoints) • [Examples](#-code-examples)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Base URL](#-base-url)
- [Authentication](#-authentication)
- [Rate Limits](#-rate-limits)
- [Error Handling](#-error-handling)
- [API Endpoints](#-api-endpoints)
  - [Authentication](#authentication-1)
  - [Bots Management](#bots-management)
  - [Knowledge Base](#knowledge-base)
  - [Web Scraping](#web-scraping)
  - [Embeddings](#embeddings)
  - [Chat](#chat)
  - [Webhooks](#webhooks)
- [Code Examples](#-code-examples)
- [Webhooks](#-webhooks-integration)

---

## 🌐 Overview

The AgentDesk API is a RESTful API that allows you to programmatically create and manage AI chatbots, ingest knowledge, and handle conversations. Built on NestJS with OpenAI GPT-4o-mini and pgvector for semantic search.

### Key Features
- 🤖 **Bot Management** - Create, update, and manage chatbots
- 📚 **Knowledge Ingestion** - Add content from URLs, documents, or manual input
- 🧠 **RAG-Powered Chat** - Contextual responses using Retrieval-Augmented Generation
- 🔗 **Multi-Channel** - Deploy to web, Telegram, and WhatsApp
- 📊 **Analytics** - Track conversations and bot performance

---

## 🔗 Base URL

### Development
```
http://localhost:3001/api
```

### Production
```
https://api.agentdesk.com/api
```

All API requests should be made to the base URL followed by the endpoint path.

---

## 🔐 Authentication

AgentDesk uses two types of authentication depending on the endpoint:

### 1. User Authentication (Bearer Token)
For dashboard operations (bot management, knowledge base, etc.)

**How to get a token:**
1. Sign up at `https://app.agentdesk.com/register`
2. Get your JWT token from Supabase Auth after login
3. Include in requests as Bearer token

**Example:**
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Bot API Token
For chat endpoints (widget, webhooks)

**How to get a token:**
1. Create a bot in the dashboard
2. Copy the API token from bot settings
3. Include in requests as custom header

**Example:**
```bash
X-Bot-Token: bot_abc123xyz789
```

---

## ⚡ Rate Limits

To ensure fair usage and system stability, the following rate limits apply:

| Endpoint Type | Rate Limit | Window |
|--------------|------------|--------|
| Authentication | 100 requests | per minute |
| Bot Management | 100 requests | per minute |
| Chat Messages | 60 requests | per minute |
| Web Scraping | 10 requests | per minute |
| Embeddings | 20 requests | per minute |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

---

## ❌ Error Handling

The API uses conventional HTTP response codes and returns errors in JSON format.

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success - Request completed successfully |
| `201` | Created - Resource created successfully |
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Missing or invalid authentication |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error - Something went wrong |

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    "name must be a string",
    "personality is required"
  ]
}
```

---

## 🔌 API Endpoints

## Authentication

### Get Current User

Retrieve the authenticated user's profile information.

**Endpoint:** `GET /auth/me`

**Authentication:** Bearer Token (required)

**Request:**
```bash
curl -X GET https://api.agentdesk.com/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
{
  "id": "user_123abc",
  "email": "user@example.com",
  "created_at": "2025-01-15T10:30:00Z",
  "profile": {
    "full_name": "John Doe",
    "company_name": "Tech Corp"
  }
}
```

---

### Create/Update User Profile

Create or update the user's profile information.

**Endpoint:** `POST /auth/profile`

**Authentication:** Bearer Token (required)

**Request Body:**
```json
{
  "full_name": "John Doe",
  "company_name": "Tech Corp"
}
```

**Request:**
```bash
curl -X POST https://api.agentdesk.com/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "company_name": "Tech Corp"
  }'
```

**Response (200):**
```json
{
  "id": "profile_456",
  "user_id": "user_123abc",
  "full_name": "John Doe",
  "company_name": "Tech Corp",
  "updated_at": "2025-01-15T10:35:00Z"
}
```

---

## Bots Management

### Create Bot

Create a new chatbot with custom configuration.

**Endpoint:** `POST /bots`

**Authentication:** Bearer Token (required)

**Request Body:**
```json
{
  "name": "Customer Support Bot",
  "personality": "You are a friendly and helpful customer support agent. Be concise but thorough.",
  "welcome_message": "Hi! I'm here to help. How can I assist you today?",
  "language": "en"
}
```

**Request:**
```bash
curl -X POST https://api.agentdesk.com/api/bots \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Support Bot",
    "personality": "You are a friendly and helpful customer support agent.",
    "welcome_message": "Hi! How can I help you today?",
    "language": "en"
  }'
```

**Response (201):**
```json
{
  "id": "bot_abc123",
  "name": "Customer Support Bot",
  "personality": "You are a friendly and helpful customer support agent.",
  "welcome_message": "Hi! How can I help you today?",
  "language": "en",
  "api_token": "bot_token_xyz789",
  "created_at": "2025-01-15T10:40:00Z",
  "user_id": "user_123abc"
}
```

---

### Get All Bots

Retrieve all bots belonging to the authenticated user.

**Endpoint:** `GET /bots`

**Authentication:** Bearer Token (required)

**Request:**
```bash
curl -X GET https://api.agentdesk.com/api/bots \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
[
  {
    "id": "bot_abc123",
    "name": "Customer Support Bot",
    "personality": "You are a friendly customer support agent.",
    "welcome_message": "Hi! How can I help?",
    "language": "en",
    "created_at": "2025-01-15T10:40:00Z",
    "total_messages": 245,
    "total_sessions": 67
  },
  {
    "id": "bot_def456",
    "name": "Sales Assistant",
    "personality": "You are a knowledgeable sales assistant.",
    "welcome_message": "Hello! Looking for something?",
    "language": "en",
    "created_at": "2025-01-10T14:20:00Z",
    "total_messages": 532,
    "total_sessions": 128
  }
]
```

---

### Get Single Bot

Retrieve details for a specific bot.

**Endpoint:** `GET /bots/:id`

**Authentication:** Bearer Token (required)

**Parameters:**
- `id` (path, required) - The bot ID

**Request:**
```bash
curl -X GET https://api.agentdesk.com/api/bots/bot_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
{
  "id": "bot_abc123",
  "name": "Customer Support Bot",
  "personality": "You are a friendly customer support agent.",
  "welcome_message": "Hi! How can I help you today?",
  "language": "en",
  "api_token": "bot_token_xyz789",
  "created_at": "2025-01-15T10:40:00Z",
  "updated_at": "2025-01-15T10:40:00Z",
  "user_id": "user_123abc",
  "external_channels": {
    "telegram": {
      "enabled": true,
      "bot_token": "telegram_bot_token"
    },
    "whatsapp": {
      "enabled": false
    }
  }
}
```

---

### Update Bot

Update an existing bot's configuration.

**Endpoint:** `PUT /bots/:id`

**Authentication:** Bearer Token (required)

**Parameters:**
- `id` (path, required) - The bot ID

**Request Body:**
```json
{
  "name": "Updated Support Bot",
  "personality": "You are an expert customer support agent.",
  "welcome_message": "Hello! I'm here to help you."
}
```

**Request:**
```bash
curl -X PUT https://api.agentdesk.com/api/bots/bot_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Support Bot",
    "personality": "You are an expert customer support agent."
  }'
```

**Response (200):**
```json
{
  "id": "bot_abc123",
  "name": "Updated Support Bot",
  "personality": "You are an expert customer support agent.",
  "welcome_message": "Hello! I'm here to help you.",
  "updated_at": "2025-01-15T11:00:00Z"
}
```

---

### Delete Bot

Permanently delete a bot and all associated data.

**Endpoint:** `DELETE /bots/:id`

**Authentication:** Bearer Token (required)

**Parameters:**
- `id` (path, required) - The bot ID

**Request:**
```bash
curl -X DELETE https://api.agentdesk.com/api/bots/bot_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
{
  "message": "Bot deleted successfully",
  "id": "bot_abc123"
}
```

---

### Get Bot Analytics

Retrieve analytics and statistics for a specific bot.

**Endpoint:** `GET /bots/:id/analytics`

**Authentication:** Bearer Token (required)

**Parameters:**
- `id` (path, required) - The bot ID

**Request:**
```bash
curl -X GET https://api.agentdesk.com/api/bots/bot_abc123/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
{
  "bot_id": "bot_abc123",
  "total_messages": 1247,
  "total_sessions": 342,
  "avg_messages_per_session": 3.6,
  "total_visitors": 298,
  "period": {
    "start": "2025-01-01T00:00:00Z",
    "end": "2025-01-15T23:59:59Z"
  },
  "daily_stats": [
    {
      "date": "2025-01-15",
      "messages": 87,
      "sessions": 23,
      "visitors": 21
    }
  ]
}
```

---

## Web Scraping

### Scrape Single URL

Scrape content from a single URL and add it to the bot's knowledge base.

**Endpoint:** `POST /scraper/scrape`

**Authentication:** Bearer Token (required)

**Request Body:**
```json
{
  "url": "https://example.com/help/faq",
  "botId": "bot_abc123"
}
```

**Request:**
```bash
curl -X POST https://api.agentdesk.com/api/scraper/scrape \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/help/faq",
    "botId": "bot_abc123"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "url": "https://example.com/help/faq",
  "chunks_created": 12,
  "content_id": "content_789xyz",
  "message": "URL scraped and processed successfully"
}
```

---

### Scrape Multiple URLs

Scrape content from multiple URLs in batch.

**Endpoint:** `POST /scraper/scrape-multiple`

**Authentication:** Bearer Token (required)

**Request Body:**
```json
{
  "urls": [
    "https://example.com/help/faq",
    "https://example.com/about",
    "https://example.com/pricing"
  ],
  "botId": "bot_abc123"
}
```

**Request:**
```bash
curl -X POST https://api.agentdesk.com/api/scraper/scrape-multiple \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://example.com/help/faq", "https://example.com/about"],
    "botId": "bot_abc123"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "total_urls": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "url": "https://example.com/help/faq",
      "status": "success",
      "chunks_created": 12
    },
    {
      "url": "https://example.com/about",
      "status": "success",
      "chunks_created": 5
    }
  ]
}
```

---

### Get Scraped Content

Retrieve all scraped content for a specific bot.

**Endpoint:** `GET /scraper/content/:botId`

**Authentication:** Bearer Token (required)

**Parameters:**
- `botId` (path, required) - The bot ID

**Request:**
```bash
curl -X GET https://api.agentdesk.com/api/scraper/content/bot_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
{
  "bot_id": "bot_abc123",
  "total_pages": 15,
  "total_chunks": 127,
  "content": [
    {
      "id": "content_789xyz",
      "url": "https://example.com/help/faq",
      "title": "Frequently Asked Questions",
      "chunks_count": 12,
      "scraped_at": "2025-01-15T10:45:00Z"
    }
  ]
}
```

---

## Knowledge Base

### Add Manual Content

Add custom content directly to the bot's knowledge base without scraping.

**Endpoint:** `POST /knowledge/add`

**Authentication:** Bearer Token (required)

**Request Body:**
```json
{
  "botId": "bot_abc123",
  "content": "Our customer support is available Monday to Friday, 9 AM to 5 PM EST. You can reach us via email at support@example.com or through live chat during business hours.",
  "title": "Support Hours",
  "metadata": {
    "category": "support",
    "priority": "high"
  }
}
```

**Request:**
```bash
curl -X POST https://api.agentdesk.com/api/knowledge/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "botId": "bot_abc123",
    "content": "Our support hours are 9 AM to 5 PM EST.",
    "title": "Support Hours"
  }'
```

**Response (201):**
```json
{
  "id": "knowledge_456def",
  "bot_id": "bot_abc123",
  "title": "Support Hours",
  "content": "Our customer support is available Monday to Friday...",
  "chunks_created": 1,
  "created_at": "2025-01-15T11:10:00Z"
}
```

---

### Get Knowledge Base

Retrieve all knowledge base entries for a specific bot.

**Endpoint:** `GET /knowledge/:botId`

**Authentication:** Bearer Token (required)

**Parameters:**
- `botId` (path, required) - The bot ID

**Request:**
```bash
curl -X GET https://api.agentdesk.com/api/knowledge/bot_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
{
  "bot_id": "bot_abc123",
  "total_entries": 47,
  "entries": [
    {
      "id": "knowledge_456def",
      "title": "Support Hours",
      "content": "Our customer support is available...",
      "source": "manual",
      "created_at": "2025-01-15T11:10:00Z"
    },
    {
      "id": "content_789xyz",
      "title": "FAQ Page",
      "source": "scraped",
      "url": "https://example.com/help/faq",
      "created_at": "2025-01-15T10:45:00Z"
    }
  ]
}
```

---

### Get Knowledge Statistics

Get statistics about the bot's knowledge base.

**Endpoint:** `GET /knowledge/:botId/stats`

**Authentication:** Bearer Token (required)

**Parameters:**
- `botId` (path, required) - The bot ID

**Request:**
```bash
curl -X GET https://api.agentdesk.com/api/knowledge/bot_abc123/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
{
  "bot_id": "bot_abc123",
  "total_entries": 47,
  "total_chunks": 234,
  "total_embeddings": 234,
  "sources": {
    "scraped": 35,
    "manual": 12
  },
  "total_words": 45672,
  "last_updated": "2025-01-15T11:10:00Z"
}
```

---

### Delete Knowledge Content

Delete a specific knowledge base entry.

**Endpoint:** `DELETE /knowledge/:contentId/:botId`

**Authentication:** Bearer Token (required)

**Parameters:**
- `contentId` (path, required) - The content ID
- `botId` (path, required) - The bot ID

**Request:**
```bash
curl -X DELETE https://api.agentdesk.com/api/knowledge/content_789xyz/bot_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
{
  "message": "Content deleted successfully",
  "content_id": "content_789xyz"
}
```

---

## Embeddings

### Generate Embeddings

Generate vector embeddings for all content in the bot's knowledge base.

**Endpoint:** `POST /embeddings/generate/:botId`

**Authentication:** Bearer Token (required)

**Parameters:**
- `botId` (path, required) - The bot ID

**Request:**
```bash
curl -X POST https://api.agentdesk.com/api/embeddings/generate/bot_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (201):**
```json
{
  "success": true,
  "bot_id": "bot_abc123",
  "embeddings_created": 234,
  "chunks_processed": 234,
  "processing_time_ms": 5432,
  "model": "text-embedding-3-small"
}
```

---

### Get Bot Embeddings

Retrieve all embeddings for a specific bot.

**Endpoint:** `GET /embeddings/:botId`

**Authentication:** Bearer Token (required)

**Parameters:**
- `botId` (path, required) - The bot ID

**Request:**
```bash
curl -X GET https://api.agentdesk.com/api/embeddings/bot_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
{
  "bot_id": "bot_abc123",
  "total_embeddings": 234,
  "embeddings": [
    {
      "id": "embed_111",
      "chunk_id": "chunk_222",
      "content": "Our customer support is available...",
      "created_at": "2025-01-15T11:15:00Z"
    }
  ]
}
```

---

### Search Similar Content

Search for content similar to a query using vector similarity.

**Endpoint:** `POST /embeddings/search`

**Authentication:** Bearer Token (required)

**Request Body:**
```json
{
  "query": "What are your business hours?",
  "botId": "bot_abc123",
  "matchThreshold": 0.7,
  "matchCount": 5
}
```

**Request:**
```bash
curl -X POST https://api.agentdesk.com/api/embeddings/search \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are your business hours?",
    "botId": "bot_abc123",
    "matchThreshold": 0.7,
    "matchCount": 5
  }'
```

**Response (200):**
```json
{
  "query": "What are your business hours?",
  "results": [
    {
      "content": "Our customer support is available Monday to Friday, 9 AM to 5 PM EST.",
      "similarity": 0.89,
      "chunk_id": "chunk_222",
      "source": "Support Hours"
    },
    {
      "content": "Contact us during business hours for immediate assistance.",
      "similarity": 0.76,
      "chunk_id": "chunk_333",
      "source": "Contact Page"
    }
  ]
}
```

---

## Chat

### Send Chat Message

Send a message to the bot and receive a response. This is the main endpoint used by the chat widget.

**Endpoint:** `POST /chat/message`

**Authentication:** Bot API Token (required via `X-Bot-Token` header)

**Request Body:**
```json
{
  "sessionId": "session_abc123",
  "message": "What are your business hours?",
  "visitorMetadata": {
    "name": "John Doe",
    "email": "john@example.com",
    "page": "https://example.com/contact"
  }
}
```

**Request:**
```bash
curl -X POST https://api.agentdesk.com/api/chat/message \
  -H "X-Bot-Token: bot_token_xyz789" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_abc123",
    "message": "What are your business hours?",
    "visitorMetadata": {
      "name": "John Doe"
    }
  }'
```

**Response (200):**
```json
{
  "response": "Our customer support is available Monday to Friday, 9 AM to 5 PM EST. You can reach us via email at support@example.com or through live chat during these hours. Is there anything specific I can help you with?",
  "messageId": "msg_789",
  "sessionId": "session_abc123",
  "timestamp": "2025-01-15T14:30:00Z"
}
```

---

### Get Chat History

Retrieve conversation history for a specific session.

**Endpoint:** `GET /chat/history/:botId/:sessionId`

**Authentication:** Bot API Token (required via `X-Bot-Token` header)

**Parameters:**
- `botId` (path, required) - The bot ID
- `sessionId` (path, required) - The session ID

**Request:**
```bash
curl -X GET https://api.agentdesk.com/api/chat/history/bot_abc123/session_abc123 \
  -H "X-Bot-Token: bot_token_xyz789"
```

**Response (200):**
```json
{
  "bot_id": "bot_abc123",
  "session_id": "session_abc123",
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "Hello!",
      "timestamp": "2025-01-15T14:25:00Z"
    },
    {
      "id": "msg_002",
      "role": "assistant",
      "content": "Hi! How can I help you today?",
      "timestamp": "2025-01-15T14:25:01Z"
    },
    {
      "id": "msg_003",
      "role": "user",
      "content": "What are your business hours?",
      "timestamp": "2025-01-15T14:30:00Z"
    },
    {
      "id": "msg_004",
      "role": "assistant",
      "content": "Our customer support is available Monday to Friday, 9 AM to 5 PM EST.",
      "timestamp": "2025-01-15T14:30:01Z"
    }
  ],
  "total_messages": 4,
  "started_at": "2025-01-15T14:25:00Z"
}
```

---

## Webhooks

### Telegram Webhook

Receives webhook events from Telegram when users message your bot.

**Endpoint:** `POST /webhooks/telegram/:botId`

**Authentication:** None (secured by Telegram's webhook mechanism)

**Request Body:** (Telegram Update object)
```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 987654321,
      "first_name": "John",
      "username": "johndoe"
    },
    "chat": {
      "id": 987654321,
      "type": "private"
    },
    "text": "Hello!"
  }
}
```

**Response (200):**
```json
{
  "ok": true
}
```

---

### WhatsApp Webhook

Receives webhook events from Twilio/WhatsApp when users message your bot.

**Endpoint:** `POST /webhooks/whatsapp/:botId`

**Authentication:** None (secured by Twilio's webhook signature)

**Request Body:** (Twilio Webhook data)
```json
{
  "From": "whatsapp:+1234567890",
  "To": "whatsapp:+0987654321",
  "Body": "What are your hours?",
  "MessageSid": "SM1234567890"
}
```

**Response (200):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Our customer support is available Monday to Friday, 9 AM to 5 PM EST.</Message>
</Response>
```

---

## 💻 Code Examples

### JavaScript / Node.js

```javascript
// Initialize API client
const API_BASE_URL = 'https://api.agentdesk.com/api';
const BEARER_TOKEN = 'your_bearer_token';
const BOT_TOKEN = 'bot_token_xyz789';

// Create a new bot
async function createBot() {
  const response = await fetch(`${API_BASE_URL}/bots`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'My Support Bot',
      personality: 'You are a friendly customer support agent.',
      welcome_message: 'Hi! How can I help?',
      language: 'en'
    })
  });
  
  const bot = await response.json();
  console.log('Bot created:', bot);
  return bot;
}

// Send a chat message
async function sendMessage(sessionId, message) {
  const response = await fetch(`${API_BASE_URL}/chat/message`, {
    method: 'POST',
    headers: {
      'X-Bot-Token': BOT_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId: sessionId,
      message: message,
      visitorMetadata: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    })
  });
  
  const data = await response.json();
  console.log('Bot response:', data.response);
  return data;
}

// Scrape a website
async function scrapeWebsite(botId, url) {
  const response = await fetch(`${API_BASE_URL}/scraper/scrape`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: url,
      botId: botId
    })
  });
  
  const result = await response.json();
  console.log('Scraping complete:', result);
  return result;
}

// Generate embeddings
async function generateEmbeddings(botId) {
  const response = await fetch(`${API_BASE_URL}/embeddings/generate/${botId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BEARER_TOKEN}`
    }
  });
  
  const result = await response.json();
  console.log('Embeddings generated:', result);
  return result;
}
```

---

### Python

```python
import requests
import json

API_BASE_URL = 'https://api.agentdesk.com/api'
BEARER_TOKEN = 'your_bearer_token'
BOT_TOKEN = 'bot_token_xyz789'

# Create a new bot
def create_bot():
    headers = {
        'Authorization': f'Bearer {BEARER_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'name': 'My Support Bot',
        'personality': 'You are a friendly customer support agent.',
        'welcome_message': 'Hi! How can I help?',
        'language': 'en'
    }
    
    response = requests.post(f'{API_BASE_URL}/bots', 
                           headers=headers, 
                           json=data)
    
    bot = response.json()
    print(f'Bot created: {bot}')
    return bot

# Send a chat message
def send_message(session_id, message):
    headers = {
        'X-Bot-Token': BOT_TOKEN,
        'Content-Type': 'application/json'
    }
    
    data = {
        'sessionId': session_id,
        'message': message,
        'visitorMetadata': {
            'name': 'John Doe',
            'email': 'john@example.com'
        }
    }
    
    response = requests.post(f'{API_BASE_URL}/chat/message',
                           headers=headers,
                           json=data)
    
    result = response.json()
    print(f"Bot response: {result['response']}")
    return result

# Scrape a website
def scrape_website(bot_id, url):
    headers = {
        'Authorization': f'Bearer {BEARER_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'url': url,
        'botId': bot_id
    }
    
    response = requests.post(f'{API_BASE_URL}/scraper/scrape',
                           headers=headers,
                           json=data)
    
    result = response.json()
    print(f'Scraping complete: {result}')
    return result

# Get bot analytics
def get_analytics(bot_id):
    headers = {
        'Authorization': f'Bearer {BEARER_TOKEN}'
    }
    
    response = requests.get(f'{API_BASE_URL}/bots/{bot_id}/analytics',
                          headers=headers)
    
    analytics = response.json()
    print(f'Total messages: {analytics["total_messages"]}')
    return analytics
```

---

### cURL Examples

```bash
# Create a bot
curl -X POST https://api.agentdesk.com/api/bots \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support Bot",
    "personality": "Friendly support agent",
    "welcome_message": "Hi! How can I help?"
  }'

# Get all bots
curl -X GET https://api.agentdesk.com/api/bots \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send a chat message
curl -X POST https://api.agentdesk.com/api/chat/message \
  -H "X-Bot-Token: bot_token_xyz789" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_123",
    "message": "What are your hours?"
  }'

# Scrape a URL
curl -X POST https://api.agentdesk.com/api/scraper/scrape \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/faq",
    "botId": "bot_abc123"
  }'

# Generate embeddings
curl -X POST https://api.agentdesk.com/api/embeddings/generate/bot_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get chat history
curl -X GET https://api.agentdesk.com/api/chat/history/bot_abc123/session_123 \
  -H "X-Bot-Token: bot_token_xyz789"
```

---

## 🔔 Webhooks Integration

### Setting Up Webhooks

AgentDesk can send webhook events to your server when certain events occur.

**Supported Events:**
- `message.received` - New message from user
- `session.started` - New chat session
- `session.ended` - Session timeout/end

**Webhook Payload:**
```json
{
  "event": "message.received",
  "timestamp": "2025-01-15T14:30:00Z",
  "bot_id": "bot_abc123",
  "session_id": "session_123",
  "data": {
    "message_id": "msg_789",
    "content": "Hello!",
    "sender": {
      "id": "visitor_456",
      "name": "John Doe"
    }
  }
}
```

---

## 📞 Support

Need help with the API? We're here to assist!

- 📧 **Email**: api-support@agentdesk.com
- 📚 **Documentation**: https://docs.agentdesk.com
- 💬 **Discord**: Join our [developer community](https://discord.gg/agentdesk)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-org/agentdesk/issues)

---

## 📄 License

AgentDesk API is part of the AgentDesk platform, distributed under the MIT License.

For complete license terms, see the [LICENSE](LICENSE) file.

---

<div align="center">

**Built with ❤️ for developers**

[Documentation](#) • [Dashboard](https://app.agentdesk.com) • [Support](#-support)

© 2025 AgentDesk. All rights reserved.

</div>

