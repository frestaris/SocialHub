# 🌐 Social Hub

A **modern social platform built with the MERN stack (MongoDB, Express.js, React, Node.js)** that combines posts, community interaction, and real-time chat — all in one place.

> Users can share photos, videos, and posts, chat in real time, follow creators, explore trending content, and manage their profiles seamlessly — with smooth UI powered by React + Ant Design and real-time updates via Socket.IO.

---

## 🚀 Live Demo

- **Website:** [https://social-hub-xi.vercel.app](https://social-hub-xi.vercel.app)
- **Backend:** Hosted on Render
- **Database:** MongoDB Atlas

---

---

## 🖼️ Screenshots

## ![Home Screenshot](./src/assets/homepage-desktop.png)

## ✨ Features

- 🔥 Real-time **chat system** with search, typing indicator, seen ticks, and delivery states
- 🧱 **Explore page** with a **Masonry-style grid layout** showing trending and hot posts
- 📸 **Image and video uploads** directly from your computer or via URL - stored in **Firebase Storage**
- 🎥 **YouTube API integration** - automatically fetches video duration, title, and thumbnail when adding video posts
- 👤 **Firebase authentication** using **Google and GitHub login**
- 🧠 **User Profile Page** - Fully customizable profiles featuring each user's personal post feed. Users can change their cover image, avatar, name, bio, and password, as well as connect additional social logins (Google or GitHub) for future sign-ins. Each profile also displays followers, following counts, and lists for easy navigation.
- 🔎 **Search & Categories** — The app includes a **global search bar** to find posts or users, and a **category sidebar** to explore posts by topic.
- 💬 **Post feed** with likes, comments, replies, and the ability to **share posts via chat**
- 👥 **Follow system** - you can only message users you follow
- 🔔 **Notifications system** for likes, comments, replies, and follows
- 💫 Fully **responsive** and built with **Ant Design** for consistent UI/UX

---

## 🛠️ Tech Stack

### Frontend

- React (Vite)
- Redux Toolkit & RTK Query
- Ant Design UI
- Firebase Auth (Google & GitHub login)
- Firebase Storage (image/video uploads)
- Socket.IO Client (real-time messaging)
- Moment.js (date formatting)

### Backend

- Node.js / Express.js
- MongoDB + Mongoose
- Socket.IO Server
- Firebase Admin SDK (token verification)
- Render (Deployment)

---

## ⚙️ Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/frestaris/SocialHub.git
cd SocialHub
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create a `.env` file

Frontend:

```
VITE_API_BASE_URL=https://your-backend-url.onrender.com

VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id

VITE_YOUTUBE_API_KEY=your-youtube-api-key
```

Backend:

```
PORT=5000
MONGO_URI=your-mongodb-uri
CLIENT_URL=your-frontend-url

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-firebase-private-key"

JWT_SECRET=your-secret-key

```

### 4️⃣ Run the app

Frontend:

```bash
npm run dev
```

Backend:

```bash
npm start
```

---

## 💬 Messaging System

The **real-time chat** in Social Hub is one of its most advanced features — built to replicate the smoothness of modern messaging platforms like Messenger.

### 🔍 Chat Search & Filtering

- Search **users** you follow to start a new chat.
- Search **existing conversations** from your chat list.
- Use **in-chat search** to highlight any word or phrase in message history.

### 💡 Conversation Features

- You can **start a conversation only with users you follow.**
- **Archive conversations** to keep your inbox clean.
- **Typing indicators** show when the other person is typing.
- **Delivered ✓ and Seen ✓✓ ticks** appear dynamically.
- **Last seen** timestamps update in real time.
- Users can **hide their online status** (appear offline).
- Chats include **infinite scroll** for older messages.
- Supports **editing** and **deleting** messages with confirmation modals.
- **Post links** shared in chat automatically display **preview bubbles** (with thumbnail and author).

### 🧩 Key Highlights

- Optimistic UI updates for sent messages.
- Message delivery synced via **Socket.IO** events.
- Typing events debounced using a timeout-based listener.
- Each message includes sender info, timestamps, and real-time seen state.

---

## 🔐 Authentication Flow

1. Login with Firebase (Google or GitHub).
2. Firebase returns a verified ID token.
3. Backend verifies the token and responds with a user profile.
4. Redux persists user + token to localStorage.
5. Token auto-refresh handled by `useAuthTokenRefresh.js`.

---

## 🧩 Folder Structure

### 📦 Backend

<details>
<summary>📁 Click to view full backend structure</summary>

```text
src/
├── config/
│   ├── db.js
│   └── firebaseAdmin.js
├── controllers/
│   ├── authController.js
│   ├── commentController.js
│   ├── conversationController.js
│   ├── notificationController.js
│   ├── postController.js
│   ├── replyController.js
│   └── userController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── chatSocket.js
│   └── socketAuth.js
├── models/
│   ├── commentSchema.js
│   ├── conversationSchema.js
│   ├── messageSchema.js
│   ├── notificationSchema.js
│   ├── postSchema.js
│   └── userSchema.js
└── routes/
    ├── authRoutes.js
    ├── commentRoutes.js
    ├── conversationRoutes.js
    ├── notificationRoutes.js
    ├── postRoutes.js
    ├── replyRoutes.js
    └── userRoutes.js
```

</details>

### 💻 Frontend

<details>
<summary>📁 Click to view full frontend structure</summary>

```text
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWindow/
│   │   │   │   ├── ChatWindow.jsx
│   │   │   │   ├── ChatWindowBody.jsx
│   │   │   │   ├── ChatWindowFooter.jsx
│   │   │   │   └── ChatWindowHeader.jsx
│   │   │   ├── MessageItem/
│   │   │   │   ├── MessageBubble.jsx
│   │   │   │   ├── MessageEditor.jsx
│   │   │   │   ├── MessageItem.jsx
│   │   │   │   ├── MessageMenu.jsx
│   │   │   │   ├── MessageStatusIcon.jsx
│   │   │   │   └── PostPreviewBubble.jsx
│   │   │   ├── ChatButton.jsx
│   │   │   ├── ChatDock.jsx
│   │   │   ├── ChatDrawerMobile.jsx
│   │   │   ├── ChatList.jsx
│   │   │   ├── ChatListItem.jsx
│   │   │   └── ChatModalStart.jsx
│   │   ├── common/
│   │   │   ├── ArrowButton.jsx
│   │   │   ├── CategoryBadge.jsx
│   │   │   ├── FollowButton.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── GradientButton.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── ReusableCarousel.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── notification/
│   │   │   ├── NotificationsDrawer.jsx
│   │   │   ├── NotificationsDropdown.jsx
│   │   │   └── NotificationsList.jsx
│   │   └── post/
│   │       ├── cards/
│   │       │   ├── PostActions.jsx
│   │       │   ├── PostCard.jsx
│   │       │   └── PostDropdown.jsx
│   │       ├── comments/
│   │       │   ├── CommentForm.jsx
│   │       │   ├── CommentItem.jsx
│   │       │   ├── CommentList.css
│   │       │   ├── CommentList.jsx
│   │       │   ├── CommentsSection.jsx
│   │       │   └── ReplyForm.jsx
│   │       ├── form/
│   │       │   ├── EditPostForm.jsx
│   │       │   ├── MediaInput.jsx
│   │       │   ├── PostContent.jsx
│   │       │   ├── PostForm.jsx
│   │       │   ├── PreviewBox.jsx
│   │       │   ├── SubmitButton.jsx
│   │       │   └── VideoFields.jsx
│   │       └── modals/
│   │           ├── PostModals.jsx
│   │           └── Upload.jsx
│   ├── hooks/
│   │   ├── useNotificationsFeed.js
│   │   ├── usePostMedia.js
│   │   └── useSearchHandler.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Login.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── explore/
│   │   │   ├── Explore.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── HotNow.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── TopCreators.jsx
│   │   ├── homepage/
│   │   │   ├── FeaturedCreators.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   └── TrendingPosts.jsx
│   │   ├── post/
│   │   │   ├── Post.jsx
│   │   │   ├── PostInfo.jsx
│   │   │   └── VideoPlayer.jsx
│   │   └── user/
│   │       ├── profile/
│   │       │   ├── AvatarEdit.jsx
│   │       │   ├── CoverEdit.jsx
│   │       │   ├── CoverPreview.jsx
│   │       │   ├── Profile.jsx
│   │       │   ├── ProfileInfo.jsx
│   │       │   ├── UserFeed.jsx
│   │       │   └── UserFollowers.jsx
│   │       └── settings/
│   │           ├── PasswordSettings.jsx
│   │           ├── ProfileInfoForm.jsx
│   │           ├── SettingsModal.jsx
│   │           └── SocialLink.jsx
│   ├── redux/
│   │   ├── auth/
│   │   │   ├── authApi.js
│   │   │   └── authSlice.js
│   │   ├── chat/
│   │   │   ├── chatApi.js
│   │   │   └── chatSlice.js
│   │   ├── comment/
│   │   │   └── commentApi.js
│   │   ├── notification/
│   │   │   └── notificationApi.js
│   │   ├── post/
│   │   │   └── postApi.js
│   │   ├── reply/
│   │   │   └── replyApi.js
│   │   ├── user/
│   │   │   └── userApi.js
│   │   ├── utils/
│   │   │   └── authorizedBaseQuery.js
│   │   └── store.js
│   ├── utils/
│   │   ├── analytics/
│   │   │   ├── AnalyticsTracker.js
│   │   │   └── analytics.js
│   │   ├── firebase/
│   │   │   ├── firebaseErrorMessages.js
│   │   │   ├── uploadToFirebase.js
│   │   │   └── useAuthTokenRefresh.js
│   │   ├── posts/
│   │   │   ├── buildPostPayload.js
│   │   │   ├── categories.js
│   │   │   ├── fetchYouTubeMetadata.js
│   │   │   └── getVideoDuration.js
│   │   ├── sockets/
│   │   │   ├── useChatSocket.js
│   │   │   └── useNotificationsSocket.js
│   │   ├── ScrollToTop.jsx
│   │   ├── baseURL.js
│   │   ├── handleMessage.js
│   │   └── momentShort.js
│   ├── App.jsx
│   ├── firebase.js
│   ├── index.css
│   └── main.jsx
```

</details>

---

## 🧠 Future Enhancements

- Group chats and media sharing
- End-to-end encryption for messages
- Dark mode theme
- Post analytics dashboard
- Voice and video calling integration

---

## 👨‍💻 Author

**Aris Fresta**  
[GitHub](https://github.com/frestaris) • [Live Demo](https://social-hub-xi.vercel.app)

---

## 📄 License

This project is licensed under the **MIT License** — free for personal and commercial use.
