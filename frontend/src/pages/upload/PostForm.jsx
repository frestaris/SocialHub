import {
  Form,
  Input,
  Button,
  Select,
  Upload as AntUpload,
  Space,
  Switch,
} from "antd";
import {
  FileTextOutlined,
  UploadOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { uploadToFirebase } from "../../utils/uploadToFirebase";
import { auth } from "../../firebase";
import { useState } from "react";
import { categories } from "../../utils/categories";

const { TextArea } = Input;
const { Option } = Select;

export default function PostForm({ onClose, onCreatePost, loading }) {
  const [form] = Form.useForm();
  const [isUploading, setIsUploading] = useState(false);
  const [useUrl, setUseUrl] = useState(false);

  const handleFinish = async (values) => {
    try {
      let imageUrl = null;

      if (!useUrl && values.image && values.image[0]?.originFileObj) {
        // Upload file to Firebase
        setIsUploading(true);
        const file = values.image[0].originFileObj;
        imageUrl = await uploadToFirebase(
          file,
          auth.currentUser?.uid,
          null,
          "posts"
        );
        setIsUploading(false);
      } else if (useUrl && values.imageUrl) {
        imageUrl = values.imageUrl.trim();
      }

      await onCreatePost({
        type: "text",
        content: values.content,
        category: values.category,
        image: imageUrl,
      });

      form.resetFields();
      if (onClose) onClose();
    } catch (err) {
      console.error("Create post error:", err);
      setIsUploading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      {/* Post Content */}
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

      {/* Category */}
      <Form.Item
        label="Category"
        name="category"
        rules={[{ required: true, message: "Please select a category" }]}
      >
        <Select placeholder="Select category">
          {categories.map((cat) => (
            <Select.Option key={cat.key} value={cat.key}>
              {cat.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* Toggle: File or URL */}
      <Form.Item label="Image Mode (optional)">
        <Space>
          <span>File</span>
          <Switch checked={useUrl} onChange={(checked) => setUseUrl(checked)} />
          <span>URL</span>
        </Space>
      </Form.Item>

      {/* Image Upload OR URL */}
      {!useUrl ? (
        <Form.Item
          label="Attach Image "
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
      ) : (
        <Form.Item
          label="Image URL"
          name="imageUrl"
          rules={[{ type: "url", message: "Please enter a valid URL" }]}
        >
          <Input prefix={<LinkOutlined />} placeholder="Paste image URL" />
        </Form.Item>
      )}

      {/* Submit */}
      <Button
        type="primary"
        htmlType="submit"
        icon={<FileTextOutlined />}
        block
        loading={isUploading || loading}
      >
        {isUploading
          ? "Uploading..."
          : loading
          ? "Publishing..."
          : "Publish Post"}
      </Button>
    </Form>
  );
}
