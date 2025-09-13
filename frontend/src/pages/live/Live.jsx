import { Typography, Grid } from "antd";
import { useParams } from "react-router-dom";
import StreamPlayer from "./StreamPlayer";
import ChatBox from "./ChatBox";
import StreamInfo from "./StreamInfo";

const { Title } = Typography;
const { useBreakpoint } = Grid;

const mockStream = {
  id: "1",
  title: "Live Gaming Session",
  creator: "StreamerOne",
  viewers: "4.5K watching",
  img: "https://picsum.photos/1200/600?random=30",
};

const mockChat = [
  { id: 1, author: "Alice", content: "Let’s gooo!! 🔥" },
  { id: 2, author: "Bob", content: "Epic gameplay 😎" },
  { id: 3, author: "Clara", content: "StreamerOne is the best!" },
];

export default function Live() {
  const { id } = useParams();
  const screens = useBreakpoint();

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      <Title level={3} style={{ marginBottom: "20px" }}>
        {mockStream.title}
      </Title>

      {screens.md ? (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "20px",
            }}
          >
            <StreamPlayer img={mockStream.img} title={mockStream.title} />
            <ChatBox messages={mockChat} isDesktop={true} />
          </div>
          <StreamInfo
            creator={mockStream.creator}
            viewers={mockStream.viewers}
          />
        </>
      ) : (
        <>
          <StreamPlayer img={mockStream.img} title={mockStream.title} />
          <StreamInfo
            creator={mockStream.creator}
            viewers={mockStream.viewers}
          />
          <ChatBox messages={mockChat} isDesktop={false} />
        </>
      )}
    </div>
  );
}
