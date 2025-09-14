import { Divider, Spin, Result, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useGetVideoByIdQuery } from "../../redux/video/videoApi";

import VideoPlayer from "./VideoPlayer";
import VideoInfo from "./VideoInfo";
import CommentsSection from "./CommentsSection";

export default function Video() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetVideoByIdQuery(id);
  const video = data?.video;

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large"></Spin>
      </div>
    );
  }

  if (!video) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Result
          status="404"
          title="Video Not Found"
          subTitle="Sorry, the video you are looking for does not exist or has been removed."
          extra={
            <Button type="primary" onClick={() => navigate("/")}>
              Back Home
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <VideoPlayer src={video.url} title={video.title} />
      <VideoInfo video={video} />
      <Divider />
      <CommentsSection comments={video.comments || []} />
    </div>
  );
}
