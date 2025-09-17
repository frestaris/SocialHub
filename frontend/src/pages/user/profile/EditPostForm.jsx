import {
  Form,
  Input,
  Button,
  Select,
  Upload as AntUpload,
  Space,
  Switch,
} from "antd";
import { UploadOutlined, LinkOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { uploadToFirebase } from "../../../utils/uploadToFirebase";
import { auth } from "../../../firebase";
import { categories } from "../../../utils/categories";

const { TextArea } = Input;
const { Option } = Select;

export default function EditPostForm({
  post,
  open,
  onClose,
  onUpdate,
  loading,
}) {
  const [form] = Form.useForm();
  const [isUploading, setIsUploading] = useState(false);
  const [useUrl, setUseUrl] = useState(
    !!post?.image && post.image.startsWith("http")
  );
  const [isChanged, setIsChanged] = useState(false);

  const initialValues = {
    content: post?.content,
    category: post?.category,
    imageUrl: post?.image || null,
  };

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
      setIsChanged(false);
    }
  }, [open, post]);

  const handleValuesChange = (_, allValues) => {
    const changed = Object.keys(initialValues).some(
      (key) => allValues[key] !== initialValues[key]
    );
    setIsChanged(changed);
  };

  const handleFinish = async (values) => {
    try {
      let imageUrl = null;

      if (!useUrl && values.image && values.image[0]?.originFileObj) {
        setIsUploading(true);
        imageUrl = await uploadToFirebase(
          values.image[0].originFileObj,
          auth.currentUser?.uid,
          null,
          "posts"
        );
        setIsUploading(false);
      } else if (useUrl && values.imageUrl) {
        imageUrl = values.imageUrl.trim();
      }

      await onUpdate({
        id: post._id,
        content: values.content,
        category: values.category,
        image: imageUrl,
      });

      if (onClose) onClose();
    } catch (err) {
      console.error("Update post error:", err);
      setIsUploading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onValuesChange={handleValuesChange}
      onFinish={handleFinish}
    >
      <Form.Item
        label="Post Content"
        name="content"
        rules={[{ required: true, message: "Content is required" }]}
      >
        <TextArea rows={4} />
      </Form.Item>

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

      <Form.Item label="Image Mode (optional)">
        <Space>
          <span>File</span>
          <Switch checked={useUrl} onChange={setUseUrl} />
          <span>URL</span>
        </Space>
      </Form.Item>

      {!useUrl ? (
        <Form.Item
          label="Attach Image"
          name="image"
          valuePropName="fileList"
          getValueFromEvent={(e) => e?.fileList}
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
          rules={[{ type: "url", message: "Invalid URL" }]}
        >
          <Input prefix={<LinkOutlined />} />
        </Form.Item>
      )}

      <Button
        type="primary"
        htmlType="submit"
        block
        loading={isUploading || loading}
        disabled={!isChanged}
      >
        Save Changes
      </Button>
    </Form>
  );
}
