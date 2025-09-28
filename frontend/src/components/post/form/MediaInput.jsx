import {
  Form,
  Input,
  Button,
  Upload as AntUpload,
  Switch,
  message,
} from "antd";
import { LinkOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const MediaIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M4 4h16v12H4z" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="9" cy="10" r="2" fill="currentColor" />
    <path d="M14 9l5 3-5 3z" fill="currentColor" />
  </svg>
);

export default function MediaInput({ useUpload, setUseUpload }) {
  const beforeUpload = (file, fileList) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      message.error("Only images or videos are allowed.");
      return AntUpload.LIST_IGNORE;
    }

    // If first file is a video → allow only one
    if (isVideo && fileList.length > 1) {
      message.error("You can only upload one video.");
      return AntUpload.LIST_IGNORE;
    }

    // If first file is an image → prevent mixing with video
    if (fileList[0]?.type.startsWith("image/") && isVideo) {
      message.error("Cannot mix images and video. Choose only images.");
      return AntUpload.LIST_IGNORE;
    }

    return false; // prevent auto upload
  };

  return (
    <Form.Item label="Media">
      <div style={{ marginBottom: 12 }}>
        <Switch
          checked={useUpload}
          onChange={setUseUpload}
          checkedChildren="Upload"
          unCheckedChildren="URL"
        />
      </div>

      {/* --- URL Mode --- */}
      {!useUpload ? (
        <Form.Item noStyle shouldUpdate>
          {({ getFieldError }) => (
            <>
              <Form.List
                name="mediaUrls"
                rules={[
                  {
                    validator: async (_, urls) => {
                      if (!urls) return Promise.resolve();

                      const cleanUrls = urls
                        .map((u) => u?.trim())
                        .filter(Boolean);

                      const youtubeUrls = cleanUrls.filter(
                        (u) =>
                          u.includes("youtube.com") || u.includes("youtu.be")
                      );
                      const imageUrls = cleanUrls.filter(
                        (u) => !youtubeUrls.includes(u)
                      );

                      if (youtubeUrls.length > 1) {
                        return Promise.reject(
                          new Error("Only one YouTube URL is allowed.")
                        );
                      }

                      if (youtubeUrls.length === 1 && imageUrls.length > 0) {
                        return Promise.reject(
                          new Error(
                            "You cannot mix YouTube and image URLs in the same post."
                          )
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Form.Item
                        key={key}
                        {...restField}
                        name={name}
                        style={{ marginBottom: 8 }}
                        rules={[{ type: "url", message: "Enter a valid URL" }]}
                      >
                        <Input
                          prefix={<LinkOutlined />}
                          placeholder="Paste image or YouTube URL"
                          addonAfter={
                            <DeleteOutlined
                              onClick={() => remove(name)}
                              style={{ cursor: "pointer", color: "red" }}
                            />
                          }
                        />
                      </Form.Item>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add URL
                    </Button>
                  </>
                )}
              </Form.List>

              {/* Show validation errors */}
              {getFieldError("mediaUrls")?.length > 0 && (
                <div style={{ color: "red", marginTop: 4 }}>
                  {getFieldError("mediaUrls")[0]}
                </div>
              )}
            </>
          )}
        </Form.Item>
      ) : (
        /* --- Upload Mode --- */
        <Form.Item
          name="mediaFile"
          valuePropName="fileList"
          getValueFromEvent={(e) => e?.fileList}
        >
          <AntUpload
            multiple
            accept=".jpg,.jpeg,.png,.mp4,.mov,.webm"
            beforeUpload={beforeUpload}
            showUploadList={{
              showPreviewIcon: false,
              showRemoveIcon: true,
              showDownloadIcon: false,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 80,
                height: 80,
                border: "1px dashed #d9d9d9",
                borderRadius: 8,
                cursor: "pointer",
                color: "#1677ff",
              }}
            >
              <MediaIcon />
              <span style={{ fontSize: 12, marginTop: 6 }}>Media</span>
            </div>
          </AntUpload>
        </Form.Item>
      )}
    </Form.Item>
  );
}
