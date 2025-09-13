import { Divider } from "antd";
import { useParams } from "react-router-dom";

import VideoPlayer from "./VideoPlayer";
import VideoInfo from "./VideoInfo";
import CommentsSection from "./CommentsSection";

const mockVideos = [
  {
    id: "1",
    title: "Epic Gameplay Highlights",
    creator: "StreamerOne",
    subscribers: "120K",
    likes: "12K",
    img: "https://picsum.photos/1200/600?random=1",
    description:
      "Check out this amazing gameplay highlight reel with the best moments of the week. Don't forget to subscribe for more epic content!",
  },
  {
    id: "2",
    title: "Live Art Session",
    creator: "Sophia",
    subscribers: "80K",
    likes: "8K",
    img: "https://picsum.photos/1200/600?random=2",
    description:
      "Join me as I create a new art piece live on stream. Watch the full creative process and ask questions in the chat. Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum nobis provident delectus cupiditate iusto nesciunt maiores doloremque. Unde, rem error harum natus ipsum culpa voluptas soluta placeat totam consequatur sed?",
  },
  {
    id: "3",
    title: "Music Studio Jam",
    creator: "Clara",
    subscribers: "45K",
    likes: "5K",
    img: "https://picsum.photos/1200/600?random=3",
    description:
      "Behind the scenes in the music studio! Jamming with friends and experimenting with new sounds.",
  },
];

const mockComments = [
  {
    id: 1,
    author: "Alice",
    content: "This video was awesome!",
    time: "2h ago",
  },
  {
    id: 2,
    author: "Bob",
    content: "Great editing, keep it up!",
    time: "5h ago",
  },
  { id: 3, author: "Charlie", content: "Subscribed 🔥", time: "1d ago" },
];

export default function Video() {
  const { id } = useParams();
  const video = mockVideos.find((v) => v.id === id);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <VideoPlayer src={video?.img} title={video?.title} />
      <VideoInfo video={video} />
      <Divider />
      <CommentsSection comments={mockComments} />
    </div>
  );
}
