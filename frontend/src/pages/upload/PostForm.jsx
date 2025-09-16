import {
  Form,
  Input,
  Button,
  Select,
  message,
  Upload as AntUpload,
} from "antd";
import { FileTextOutlined, UploadOutlined } from "@ant-design/icons";
import { useCreatePostMutation } from "../../redux/post/postApi";
import { useNavigate } from "react-router-dom";
import { uploadToFirebase } from "../../utils/uploadToFirebase";
import { auth } from "../../firebase";
import { useState } from "react";

const { TextArea } = Input;
const { Option } = Select;

export default function PostForm({ onClose }) {
  const [form] = Form.useForm();
  const [createPost, { isLoading }] = useCreatePostMutation();
  const navigate = useNavigate();
  const userId = auth.currentUser?.uid;

  const [isUploading, setIsUploading] = useState(false);

  const handleFinish = async (values) => {
    try {
      let imageUrl = null;

      if (values.image && values.image[0]?.originFileObj) {
        setIsUploading(true);
        const file = values.image[0].originFileObj;
        imageUrl = await uploadToFirebase(file, userId, null, "posts");
        setIsUploading(false);
      }

      await createPost({ ...values, image: imageUrl }).unwrap();
      message.success("Post created successfully!");
      form.resetFields();

      if (onClose) onClose();
      navigate("/explore");
    } catch (err) {
      console.error("Create post error:", err);
      message.error("Failed to create post");
      setIsUploading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.Item
        label="Post Content"
        name="content"
        rules={[
          { required: true, message: "Content is required" },
          { min: 10, message: "Content must be at least 10 characters long" },
        ]}
      >
        <TextArea rows={4} placeholder="What's on your mind?" />
      </Form.Item>

      <Form.Item
        label="Category"
        name="category"
        rules={[{ required: true, message: "Please select a category" }]}
      >
        <Select placeholder="Select category">
          <Option value="update">Update</Option>
          <Option value="announcement">Announcement</Option>
          <Option value="community">Community</Option>
        </Select>
      </Form.Item>

      {/* Image Upload */}
      <Form.Item
        label="Attach Image (optional)"
        name="image"
        valuePropName="fileList"
        getValueFromEvent={(e) => e && e.fileList}
      >
        <AntUpload
          accept="image/*"
          listType="picture"
          maxCount={1}
          beforeUpload={() => false}
        >
          <Button icon={<UploadOutlined />}>Select Image</Button>
        </AntUpload>
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        icon={<FileTextOutlined />}
        block
        loading={isUploading || isLoading}
      >
        {isUploading
          ? "Uploading..."
          : isLoading
          ? "Publishing..."
          : "Publish Post"}
      </Button>
    </Form>
  );
}
