import {
  Card,
  List,
  Space,
  Typography,
  Grid,
  Button,
  Modal,
  Form,
  Input,
  message,
  Dropdown,
} from "antd";
import {
  EyeOutlined,
  LikeOutlined,
  CommentOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import moment from "moment";
import { useState } from "react";
import {
  useUpdateVideoMutation,
  useDeleteVideoMutation,
} from "../../../redux/video/videoApi";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../../../firebase";

const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function VideoList({
  videos,
  sortBy,
  setSortBy,
  currentUserId,
}) {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const [updateVideo, { isLoading: isUpdating }] = useUpdateVideoMutation();
  const [deleteVideo, { isLoading: isDeleting }] = useDeleteVideoMutation();

  const [editingVideo, setEditingVideo] = useState(null);
  const [deletingVideo, setDeletingVideo] = useState(null);
  const [form] = Form.useForm();

  // ---- Edit handlers ----
  const handleEdit = (video) => {
    setEditingVideo(video);
    form.setFieldsValue({
      title: video.title,
      description: video.description,
    });
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updateVideo({ id: editingVideo._id, ...values }).unwrap();
      message.success("Video updated!");
      setEditingVideo(null);
    } catch (err) {
      console.error("Update error:", err);
      message.error("Failed to update video");
    }
  };

  // ---- Delete handlers ----
  const handleDeleteConfirm = async () => {
    try {
      if (!deletingVideo) return;

      const deleteFromFirebase = async (fileUrl) => {
        if (!fileUrl) return;
        try {
          let path;
          if (fileUrl.includes("/o/")) {
            path = decodeURIComponent(fileUrl.split("/o/")[1].split("?")[0]);
          } else if (fileUrl.startsWith("gs://")) {
            path = fileUrl.replace(
              `gs://${storage.app.options.storageBucket}/`,
              ""
            );
          } else {
            console.warn("⚠️ Not a Firebase Storage URL, skipping:", fileUrl);
            return;
          }
          const fileRef = ref(storage, path);
          await deleteObject(fileRef);
        } catch (err) {
          console.warn("⚠️ Failed to delete from Firebase:", err.message);
        }
      };

      await deleteFromFirebase(deletingVideo.url);
      await deleteFromFirebase(deletingVideo.thumbnail);

      await deleteVideo(deletingVideo._id).unwrap();
      message.success("Video deleted from Firebase and MongoDB!");
      setDeletingVideo(null);
    } catch (err) {
      console.error("❌ Error deleting video:", err);
      message.error("Failed to delete video");
    }
  };

  // ---- Thumbnail renderer ----
  const renderThumbnail = (video, style = {}) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      <img
        src={video.thumbnail}
        alt={video.title}
        style={{
          width: "100%",
          height: style.height || "180px",
          objectFit: "cover",
          borderRadius: "8px",
          ...style,
        }}
      />
      <span
        style={{
          position: "absolute",
          bottom: "6px",
          right: "6px",
          background: "rgba(0,0,0,0.75)",
          color: "#fff",
          fontSize: "12px",
          padding: "2px 6px",
          borderRadius: "4px",
        }}
      >
        {Math.floor(video.duration / 60)}:
        {(video.duration % 60).toString().padStart(2, "0")}
      </span>
    </div>
  );

  return (
    <>
      <Card
        title="All Videos"
        extra={
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid #ddd",
            }}
          >
            <option value="popularity">Most Popular</option>
            <option value="oldest">Oldest</option>
            <option value="newest">Newest</option>
          </select>
        }
      >
        <List
          itemLayout={isMobile ? "vertical" : "horizontal"}
          dataSource={videos}
          renderItem={(video) => (
            <List.Item style={{ position: "relative" }}>
              {isMobile ? (
                <Card
                  hoverable
                  cover={
                    <div style={{ padding: "12px" }}>
                      <Link to={`/video/${video._id}`}>
                        {renderThumbnail(video)}
                      </Link>
                    </div>
                  }
                  style={{ marginBottom: 12 }}
                >
                  {/* Title */}
                  <Link to={`/video/${video._id}`}>
                    <Text
                      strong
                      style={{ display: "block", marginBottom: "8px" }}
                    >
                      {video.title}
                    </Text>
                  </Link>

                  {/* Stats */}
                  <Space size="middle" wrap>
                    <Text>
                      <EyeOutlined /> {video.views}
                    </Text>
                    <Text>
                      <LikeOutlined /> {video.likes?.length || 0}
                    </Text>
                    <Text>
                      <CommentOutlined /> {video.comments?.length || 0}
                    </Text>
                    <Text>
                      <CalendarOutlined /> {moment(video.createdAt).fromNow()}
                    </Text>
                  </Space>

                  {/* Mobile-only buttons below content */}
                  {video.creatorId?._id?.toString() ===
                    currentUserId?.toString() && (
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(video)}
                      >
                        Edit
                      </Button>
                      <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => setDeletingVideo(video)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </Card>
              ) : (
                <Card style={{ width: "100%", position: "relative" }}>
                  <List.Item.Meta
                    avatar={
                      <Link to={`/video/${video._id}`}>
                        {renderThumbnail(video, {
                          width: "200px",
                          height: "110px",
                        })}
                      </Link>
                    }
                    title={
                      <>
                        <Link
                          to={`/video/${video._id}`}
                          style={{ color: "#1677ff", fontWeight: 600 }}
                        >
                          {video.title}
                        </Link>
                        {video.description && (
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: 14 }}>
                              {video.description}
                            </Text>
                          </div>
                        )}
                      </>
                    }
                    description={
                      <Space size="middle" wrap>
                        <Text>
                          <EyeOutlined /> {video.views}
                        </Text>
                        <Text>
                          <LikeOutlined /> {video.likes?.length || 0}
                        </Text>
                        <Text>
                          <CommentOutlined /> {video.comments?.length || 0}
                        </Text>
                        <Text>
                          <CalendarOutlined />{" "}
                          {moment(video.createdAt).fromNow()}
                        </Text>
                      </Space>
                    }
                  />

                  {/* Desktop-only dropdown */}
                  {video.creatorId?._id?.toString() ===
                    currentUserId?.toString() && (
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 10,
                      }}
                    >
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: "edit",
                              label: "Edit",
                              icon: <EditOutlined />,
                              onClick: () => handleEdit(video),
                            },
                            {
                              key: "delete",
                              label: "Delete",
                              danger: true,
                              icon: <DeleteOutlined />,
                              onClick: () => setDeletingVideo(video),
                            },
                          ],
                        }}
                        trigger={["click"]}
                        placement="bottomRight"
                      >
                        <Button
                          type="text"
                          size="large"
                          icon={<MoreOutlined style={{ fontSize: 20 }} />}
                          shape="circle"
                        />
                      </Dropdown>
                    </div>
                  )}
                </Card>
              )}
            </List.Item>
          )}
        />
      </Card>

      {/* ---- Edit Modal ---- */}
      <Modal
        open={!!editingVideo}
        title="Edit Video"
        onCancel={() => setEditingVideo(null)}
        onOk={handleEditSubmit}
        okText="Save"
        okButtonProps={{ loading: isUpdating }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Title"
            name="title"
            rules={[
              { required: true, message: "Title is required" },
              { min: 5, message: "Title must be at least 5 characters" },
            ]}
          >
            <Input placeholder="Enter video title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Description is required" },
              {
                min: 10,
                message: "Description must be at least 10 characters",
              },
            ]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ---- Delete Modal ---- */}
      <Modal
        open={!!deletingVideo}
        title="Confirm Delete"
        okText="Yes, delete"
        okType="danger"
        confirmLoading={isDeleting}
        onCancel={() => setDeletingVideo(null)}
        onOk={handleDeleteConfirm}
      >
        Are you sure you want to delete{" "}
        <b>{deletingVideo?.title || "this video"}</b>?
      </Modal>
    </>
  );
}
