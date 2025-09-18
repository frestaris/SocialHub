
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
