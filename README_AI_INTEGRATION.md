# AI Chatbot Integration - BookWise Angular

## 🤖 Overview
Successfully integrated AI-powered book recommendations into the BookWise Angular application with a chat interface.

## 📋 Implementation Summary

### 1. **AI Service** (`src/app/shared/services/ai.service.ts`)
- ✅ Added `ChatMessage`, `ChatRequest`, `ChatResponse` interfaces
- ✅ Implemented `sendChatMessage()` method for POST `/ai/chat/{user_id}`
- ✅ Maintains conversation history and recommendations

### 2. **Chatbot Component** (`src/app/shared/chatbot/`)
- ✅ Updated to use new AI chat endpoint
- ✅ Integrated with user preferences service
- ✅ Displays AI recommendations with book details
- ✅ Quick action buttons for common requests
- ✅ Fallback to Gemini API if backend fails

### 3. **User Preferences** (`src/app/pages/profile/`)
- ✅ AI Preferences tab in profile page
- ✅ Favorite genres and authors selection
- ✅ Reading preferences (book length, writing style, era)
- ✅ Save/load preferences to/from backend
- ✅ Integration with PreferencesService

### 4. **Backend Integration**
- ✅ Endpoint: `POST /ai/chat/{user_id}`
- ✅ Request format matches Python backend requirements
- ✅ Handles conversation history and user preferences
- ✅ Returns AI recommendations with match percentages

## 🔧 API Endpoints Used

### Chat Endpoint
```typescript
POST /ai/chat/{user_id}
Request: {
  message: string,
  conversation_history?: ChatMessage[]
}
Response: {
  response: string,
  recommendations?: AIRecommendation[],
  timestamp: string
}
```

### Preferences Endpoints
```typescript
GET /users/{user_id}/preferences
POST /users/{user_id}/preferences
```

## 💬 Chat Message Structure
```typescript
interface ChatMessage {
  type: "user" | "ai";
  message: string;
  timestamp: string;
}
```

## 🎯 Key Features

### Chat Interface
- ✅ Input field: "Ask me about books, recommendations..."
- ✅ Send button with loading states
- ✅ Scrollable message history
- ✅ Auto-scroll to bottom on new messages
- ✅ Typing indicators

### Sample User Messages
- "Recommend me some fantasy books"
- "I like mystery novels, what do you have?"
- "Show me books by Stephen King"
- "What's trending right now?"

### AI Recommendations Display
- ✅ Book cover images
- ✅ Match percentage (0-100%)
- ✅ AI-generated reasons
- ✅ Book details (title, author, condition)
- ✅ View book buttons

### Quick Actions
- ✅ 📚 Recommendations
- ✅ 🔄 How it Works
- ✅ 🤖 AI Features

## 🔄 Data Flow

1. **User sets preferences** in Profile → AI Preferences tab
2. **User sends chat message** in chatbot
3. **Frontend sends request** to `/ai/chat/{user_id}` with:
   - User message
   - Conversation history
   - User preferences (automatically included by backend)
4. **Backend processes** with Python AI service:
   - Loads user preferences
   - Loads reading history
   - Loads available books
   - Generates AI recommendations using Gemini
5. **Frontend displays** AI response and recommendations

## 🚀 Quick Start

### For Users:
1. **Set Preferences**: Go to Profile → AI Preferences tab
2. **Select favorite genres and authors**
3. **Choose reading preferences**
4. **Click "Update Preferences"**
5. **Open chatbot** (floating button bottom-right)
6. **Ask for recommendations**: "Recommend me some books"

### For Developers:
1. **Backend**: Ensure `/ai/chat/{user_id}` endpoint is running
2. **Frontend**: Chatbot component is already integrated
3. **Test**: Use browser console to see API calls and responses

## 🐛 Error Handling
- ✅ Fallback to Gemini API if backend fails
- ✅ Guest user support (limited features)
- ✅ Loading states and error messages
- ✅ Graceful degradation

## 📱 UI/UX Features
- ✅ Modern gradient design
- ✅ Responsive layout
- ✅ Smooth animations
- ✅ Hover effects
- ✅ Loading indicators
- ✅ Success/error feedback

## 🔧 Configuration
- API URL: `environment.apiUrl`
- Gemini API: Fallback for general questions
- User preferences: Stored in backend database
- Conversation history: Maintained in session

## ✅ Testing Checklist
- [ ] User can set preferences in profile
- [ ] Chatbot opens and displays welcome message
- [ ] User can send messages
- [ ] AI responds with recommendations
- [ ] Book details display correctly
- [ ] Quick action buttons work
- [ ] Error handling works
- [ ] Guest users get limited features

## 🎯 Next Steps
1. Test with real backend API
2. Add more quick action buttons
3. Implement book rating system
4. Add conversation export feature
5. Enhance AI prompt engineering 