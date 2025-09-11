users: {
  _id: ObjectId,
  username: String,
  email: String,
  avatar: String,              // profile pic
  role: "creator" | "fan",
  bio: String,

  // For email/password users
  passwordHash: String || null,

  // For social login users (Google, Facebook, etc.)
  providers: [
    {
      provider: String,        // "google" | "facebook" | ...
      providerId: String       // Firebase UID or provider UID
    }
  ],

  followers: [ObjectId],       // list of userIds who follow this user
  createdAt: Date,
  updatedAt: Date
}


videos: {
  _id: ObjectId,
  creatorId: ObjectId,          // reference to Users
  title: String,
  description: String,
  category: String,             // e.g., "Travel", "Music"
  url: String,                  // video link (Cloudinary/S3 or external)
  thumbnail: String,
  duration: Number,             // in seconds
  views: Number,                // global
  likes: [ObjectId],            // global likes (userIds)
  comments: [ObjectId],         // global comments
  createdAt: Date
}


livestreams: {{
  _id: ObjectId,
  creatorId: ObjectId,
  title: String,
  description: String,
  category: String,
  isActive: Boolean,            // true while live
  streamKey: String,            // unique per stream
  url: String,                  // RTMP/WebRTC playback URL
  views: Number,                // global live views
  likes: [ObjectId],            // global likes
  comments: [ObjectId],         // global comments
  startedAt: Date,
  endedAt: Date || null,
  duration: Number || null      // auto-calc when ended
}
}


posts: {
  _id: ObjectId,
  userId: ObjectId,             // who made the post (creator or fan)
  type: "video" | "live" | "text",
  videoId: ObjectId || null,    // set if type = video
  liveStreamId: ObjectId || null,// set if type = live
  content: String,              // caption or text-only post
  category: String,             // mirror from video/live if exists
  views: Number,                // feed views
  likes: [ObjectId],
  comments: [ObjectId],
  createdAt: Date
}


comments: {
  _id: ObjectId,
  userId: ObjectId,              // who wrote the comment
  postId: ObjectId || null,      // if comment belongs to a post
  videoId: ObjectId || null,     // if comment belongs to a video
  liveStreamId: ObjectId || null,// if comment belongs to a live
  content: String,
  createdAt: Date
}


categories: {
  _id: ObjectId,
  name: String,             // "Travel", "Music", "Gaming"
  slug: String,             // "travel", "music", "gaming" (for URLs/filters)
  description: String,      // optional: "Explore travel vlogs & guides"
  createdAt: Date,
  updatedAt: Date
}
