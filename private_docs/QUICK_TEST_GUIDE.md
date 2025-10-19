# Quick Test Guide - Marketing Chatbot Widget

## 🚀 Start Testing in 3 Steps

### Step 1: Start the Frontend
```bash
cd frontend
npm run dev
```

### Step 2: Open Homepage
Navigate to: **http://localhost:3000/**

### Step 3: Click the Chat Bubble
Look for the **turquoise floating button** in the bottom-right corner and click it!

---

## ✅ What You Should See

### Initial State (Closed)
```
┌─────────────────────────────────┐
│                                 │
│     Your Homepage Content       │
│                                 │
│                                 │
│                            ┌──┐ │
│                            │💬│ │ ← Floating Chat Bubble
│                            └──┘ │
└─────────────────────────────────┘
```

### Opened State - Welcome Screen
```
┌────────────────────────────────────┐
│  🤖 AgentDesk          🗑️  ✕     │ ← Header
├────────────────────────────────────┤
│                                    │
│  🤖  היי 👋 כאן הבוט הרשמי של     │
│      AgentDesk.                    │
│      רוצה שאסביר איך מתחילים       │
│      תקופת ניסיון או איך בונים    │
│      את הבוט הראשון שלך?           │
│                                    │
│  ┌────────────────────────────┐   │
│  │ איך מתחילים תקופת ניסיון?  │   │ ← Quick Reply Buttons
│  └────────────────────────────┘   │
│  ┌────────────────────────────┐   │
│  │ איך בונים בוט ראשון?       │   │
│  └────────────────────────────┘   │
│  ┌────────────────────────────┐   │
│  │ מה המחירים וההבדלים?       │   │
│  └────────────────────────────┘   │
│  ┌────────────────────────────┐   │
│  │ אינטגרציה לוורדפרס/אלמנטור │   │
│  └────────────────────────────┘   │
│  ┌────────────────────────────┐   │
│  │ תמיכה ויצירת קשר            │   │
│  └────────────────────────────┘   │
│                                    │
├────────────────────────────────────┤
│  [הקלד הודעה...]            [📤] │ ← Input Area
└────────────────────────────────────┘
```

### Active Conversation
```
┌────────────────────────────────────┐
│  🤖 AgentDesk          🗑️  ✕     │
├────────────────────────────────────┤
│                                    │
│  🤖  היי 👋 כאן הבוט הרשמי...     │
│                                    │
│                  ┌───────────────┐ │
│                  │ מה זה         │ │ ← User Message
│                  │ AgentDesk?    │ │   (Right, Turquoise)
│                  └───────────────┘ │
│                                    │
│  🤖  AgentDesk הוא פלטפורמה...    │ ← Bot Response
│      לבניית בוטים חכמים...        │   (Left, White)
│                                    │
│                  ┌───────────────┐ │
│                  │ כמה זה עולה?  │ │
│                  └───────────────┘ │
│                                    │
│  🤖  • • •                         │ ← Loading Animation
│                                    │
├────────────────────────────────────┤
│  [הקלד הודעה...]            [📤] │
└────────────────────────────────────┘
```

---

## 🧪 5-Minute Test Checklist

### ✅ Basic Functionality
- [ ] Chat bubble appears in bottom-right
- [ ] Click opens chat window smoothly
- [ ] Welcome message appears in Hebrew
- [ ] 5 quick reply buttons are visible
- [ ] Click X closes chat
- [ ] Click bubble again reopens (conversation persists)

### ✅ Quick Replies
- [ ] Click "איך מתחילים תקופת ניסיון?" → Bot explains trial
- [ ] Click "איך בונים בוט ראשון?" → Bot explains process
- [ ] Click "מה המחירים וההבדלים?" → Bot mentions /pricing
- [ ] Quick replies disappear after first use

### ✅ Manual Messages
- [ ] Type "מה זה AgentDesk?" → Bot explains platform
- [ ] Type "איך נרשמים?" → Bot mentions /register?plan=starter
- [ ] Type "צריך תמיכה" → Bot mentions /support
- [ ] Messages appear on correct sides (user right, bot left)

### ✅ RTL & Hebrew
- [ ] All text is right-to-left
- [ ] Hebrew characters display correctly
- [ ] Input field is RTL
- [ ] Scrolling works naturally

### ✅ Persistence
- [ ] Have a conversation (3-4 messages)
- [ ] Close chat window
- [ ] Refresh page (F5)
- [ ] Reopen chat
- [ ] Previous messages are still there ✓

### ✅ Clear Chat
- [ ] Click trash icon (🗑️) in header
- [ ] Chat resets to welcome message
- [ ] Quick replies appear again

### ✅ Loading States
- [ ] Send a message
- [ ] Three dots animate while waiting
- [ ] Dots disappear when response arrives

### ✅ Mobile View
- [ ] Open DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Select "iPhone 12 Pro" or similar
- [ ] Chat appears as full-width sheet from bottom
- [ ] All buttons are touch-friendly

### ✅ Keyboard Navigation
- [ ] Press Tab → Focus moves to chat bubble
- [ ] Press Enter → Chat opens
- [ ] Press Tab → Focus moves through elements
- [ ] Type message and press Enter → Message sends
- [ ] Press Escape → Chat closes

---

## 🎯 Expected Bot Responses

### Question: "איך מתחילים תקופת ניסיון?"
**Expected**: Bot explains 7-day free trial, no credit card needed, mentions `/register?plan=starter`

### Question: "איך בונים בוט?"
**Expected**: Bot explains: register → name bot → upload content/add links → bot learns automatically → customize colors/language

### Question: "מה המחירים?"
**Expected**: Bot mentions multiple plans, directs to `/pricing`, mentions free trial

### Question: "אינטגרציה לוורדפרס"
**Expected**: Bot explains WordPress, Elementor, Shopify support, simple HTML embed

### Question: "צריך תמיכה"
**Expected**: Bot directs to `/support`

### Question: "What's the weather?" (Off-topic)
**Expected**: Bot redirects back to AgentDesk-related topics

---

## 🐛 Error Testing

### Network Error Test
1. Open DevTools → Network tab
2. Set "Offline" mode
3. Send a message
4. **Expected**: Red error box with "חלה תקלה זמנית. רוצים לנסות שוב?"
5. Click "נסה שוב" button
6. **Expected**: Retry button appears
7. Turn network back online
8. Click retry
9. **Expected**: Message sends successfully

### Rate Limit Test
1. Send 3-4 messages very quickly (within 1 second)
2. **Expected**: Error message "שולחים מהר מדי, חכו רגע 😊"
3. Wait 2 seconds
4. Try again
5. **Expected**: Works normally

---

## 📱 Mobile Specific Tests

### Portrait Mode
- [ ] Full-width sheet (100vw)
- [ ] Height is ~80% of viewport (80vh)
- [ ] Header stays at top
- [ ] Input stays at bottom (above keyboard)
- [ ] Scrolling works smoothly

### Landscape Mode
- [ ] Chat still accessible
- [ ] Not too tall (leaves room for content)
- [ ] Input visible above keyboard

### Touch Interactions
- [ ] Tap bubble opens chat
- [ ] Tap X closes chat
- [ ] Tap quick replies sends message
- [ ] Scroll messages smoothly
- [ ] Tap input focuses keyboard
- [ ] Tap send button works

---

## 🔍 Console Telemetry Check

Open DevTools Console (F12 → Console tab) and look for these events:

```
[HOMEBOT] homebot_opened
[HOMEBOT] homebot_message_sent { message: "..." }
[HOMEBOT] homebot_message_received { tokensUsed: 123 }
[HOMEBOT] homebot_closed
[HOMEBOT] homebot_chat_cleared
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Chat bubble doesn't appear"
**Solution**: Check if frontend is running on port 3000

### Issue: "Bot doesn't respond"
**Solution**: Check `OPENAI_API_KEY` is set in `.env.local`

### Issue: "Messages not in Hebrew"
**Solution**: Bot is configured for Hebrew, check API endpoint

### Issue: "Conversation doesn't persist"
**Solution**: Check browser localStorage is enabled (not in incognito mode)

### Issue: "Quick replies don't work"
**Solution**: Check console for errors, ensure API is responding

### Issue: "Rate limit errors immediately"
**Solution**: Wait 2 seconds between requests, check server rate limiting

---

## ✨ Success Criteria

Your implementation is successful if:

✅ Chat opens/closes smoothly  
✅ Bot responds in Hebrew about AgentDesk  
✅ Quick replies work on first load  
✅ Conversation persists on refresh  
✅ Clear chat resets properly  
✅ Mobile view is full-width sheet  
✅ RTL text is correct  
✅ Error handling works  
✅ No console errors  
✅ No interference with dashboard bots

---

## 🎉 Ready to Test!

Open http://localhost:3000/ and start clicking! 🚀

If everything works as described above, your marketing chatbot is **fully functional** and ready for production! 🎊

