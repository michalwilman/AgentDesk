# Marketing Chatbot - English Language Update

## Overview
The marketing chatbot has been updated from Hebrew to English to match the website's language.

---

## 🔄 Changes Made

### 1. API Changes (`frontend/app/api/homebot/route.ts`)

#### System Prompt
- **Changed from**: Hebrew instructions
- **Changed to**: English instructions
- Bot now responds in English with professional, friendly tone

#### Error Messages
| Hebrew (Old) | English (New) |
|--------------|---------------|
| שולחים מהר מדי, חכו רגע וננסה שוב 😊 | You're sending messages too fast. Please wait a moment 😊 |
| מצטער, לא הצלחתי ליצור תשובה | Sorry, I couldn't generate a response. Please try again. |
| זמן תגובה ארוך מדי - אנא נסו שוב | Response time too long - please try again |
| חלה תקלה זמנית. רוצים לנסות שוב? | A temporary error occurred. Would you like to try again? |

#### Locale
- Default locale changed from `'he'` to `'en'`

---

### 2. Component Changes (`frontend/components/home/HomeChatWidget.tsx`)

#### Welcome Message
**Old (Hebrew):**
```
היי 👋 כאן הבוט הרשמי של AgentDesk.
רוצה שאסביר איך מתחילים תקופת ניסיון או איך בונים את הבוט הראשון שלך?
```

**New (English):**
```
Hi 👋 I'm the official AgentDesk chatbot.
Would you like me to explain how to start a trial or how to build your first bot?
```

#### Quick Reply Buttons
| Hebrew (Old) | English (New) |
|--------------|---------------|
| איך מתחילים תקופת ניסיון? | How do I start a free trial? |
| איך בונים בוט ראשון? | How do I build my first bot? |
| מה המחירים וההבדלים? | What are the pricing plans? |
| אינטגרציה לוורדפרס/אלמנטור | WordPress/Elementor integration |
| תמיכה ויצירת קשר | Support & contact |

#### UI Text Changes
| Element | Hebrew (Old) | English (New) |
|---------|--------------|---------------|
| Online status | מקוון | Online |
| Clear chat button | נקה שיחה | Clear chat |
| Close chat button | סגור צ'אט | Close chat |
| Open chat button | פתח צ'אט | Open chat |
| Send button | שלח הודעה | Send message |
| Input placeholder | הקלד הודעה... | Type your message... |
| Retry button | נסה שוב | Try again |
| Error rate limit | שולחים מהר מדי, חכו רגע 😊 | You're sending messages too fast, please wait a moment 😊 |
| General error | חלה תקלה זמנית. רוצים לנסות שוב? | A temporary error occurred. Would you like to try again? |

#### RTL → LTR
- Removed all `dir="rtl"` attributes
- Changed text alignment from `text-right` to default (left)
- Removed `mr-auto` class (used for RTL positioning)

#### Storage Key
- **Changed from**: `'agentdesk_home_chat_history'`
- **Changed to**: `'agentdesk_home_chat_history_en'`
- This ensures old Hebrew conversations don't appear when users open the chat

---

## 🎯 Example Responses (English)

### Trial Question
**User**: "How do I start a free trial?"

**Bot Response**:
```
To start your free 7-day trial, [click here to sign up](/register?plan=starter) 🎉

No credit card required! You'll be able to:
• Create your first bot
• Upload content or add website links
• Customize colors and language
• Test all features

[Get started now](/register?plan=starter)
```

### Building Bot Question
**User**: "How do I build my first bot?"

**Bot Response**:
```
Building your bot is easy! Here's how:

1. Sign up for a free account
2. Name your bot
3. Upload content or add website links
4. The bot learns automatically!
5. Customize colors and language

[Start building your bot](/register?plan=starter) 🚀
```

### Pricing Question
**User**: "What are the pricing plans?"

**Bot Response**:
```
We have multiple plans to fit your needs:

• Starter Plan - Perfect for small businesses
• Professional Plan - For growing companies
• Enterprise Plan - Custom solutions

All plans include a 7-day free trial!

[View all plans and pricing](/pricing)
[Start free trial](/register?plan=starter)
```

---

## 🧪 Testing

### Quick Test
1. Open http://localhost:3000/
2. Click the chat bubble (bottom-right)
3. Verify:
   - ✅ Welcome message is in English
   - ✅ Quick reply buttons are in English
   - ✅ "Online" status is displayed
   - ✅ Text flows left-to-right (not RTL)

### Full Test
1. Ask: "How do I start a trial?"
   - ✅ Bot responds in English with clickable links
2. Ask: "What are the prices?"
   - ✅ Bot mentions pricing page with links
3. Ask: "I need help"
   - ✅ Bot directs to support with links
4. Type quickly multiple times
   - ✅ Error message in English: "You're sending messages too fast..."
5. Clear chat
   - ✅ Resets to English welcome message

---

## 📊 Impact

### User Experience
- ✅ Consistent language across entire website
- ✅ Better accessibility for English-speaking visitors
- ✅ Professional and clear communication
- ✅ No confusion between Hebrew and English content

### Technical
- ✅ All text is now in English
- ✅ LTR text direction (removed RTL)
- ✅ New storage key prevents old chats from showing
- ✅ No linting errors
- ✅ Clickable links still work perfectly

---

## 🔧 Technical Details

### Files Modified
- `frontend/app/api/homebot/route.ts` - System prompt and error messages
- `frontend/components/home/HomeChatWidget.tsx` - UI text and messages

### Locale Settings
- API default: `locale = 'en'`
- Component sends: `locale: 'en'`
- OpenAI responds: In English

### Storage
- Old key: `agentdesk_home_chat_history` (Hebrew conversations)
- New key: `agentdesk_home_chat_history_en` (English conversations)
- Old conversations won't interfere with new ones

---

## ✅ Checklist

- [x] System prompt translated to English
- [x] All error messages translated
- [x] Welcome message translated
- [x] Quick replies translated
- [x] UI labels translated (Online, Clear chat, etc.)
- [x] ARIA labels translated
- [x] Placeholders translated
- [x] Button text translated
- [x] RTL removed (LTR only)
- [x] Storage key updated
- [x] Locale changed to 'en'
- [x] No linting errors
- [x] Links still work
- [x] Tested and working

---

## 🎉 Result

The chatbot is now **fully in English** and matches the website's language! 

Users will see:
- English welcome message
- English quick replies
- English bot responses
- English error messages
- Left-to-right text flow
- All clickable links working

**Status**: ✅ Complete and ready for production

---

**Update Date**: October 15, 2025  
**Version**: 3.0 - English Language  
**Previous Version**: 2.0 - Hebrew with clickable links

