import { Form, Input, Button, Upload as AntUpload, Switch } from "antd";
import { LinkOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { handleError } from "../../../utils/handleMessage";

const MAX_ITEMS = 5;

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

// --- Deduplicated error handler ---
let lastError = null;
const triggerError = (msg, context, key) => {
  if (lastError !== key) {
    handleError(msg, context);
    lastError = key;
    setTimeout(() => (lastError = null), 300);
  }
};

export default function MediaInput({ useUpload, setUseUpload }) {
  /**
   * --- File Validation (AntD Upload `beforeUpload`) ---
   */
  const beforeUpload = (file, fileList) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    // Limit check
    if (fileList.length > MAX_ITEMS) {
      triggerError(
        `You can only upload up to ${MAX_ITEMS} files.`,
        "Upload limit reached",
        "uploadLimit"
      );
      return AntUpload.LIST_IGNORE;
    }

    if (!isImage && !isVideo) {
      triggerError(
        "Only images or videos are allowed.",
        "Invalid file",
        "fileType"
      );
      return AntUpload.LIST_IGNORE;
    }

    if (isVideo && fileList.length > 1) {
      triggerError(
        "You can only upload one video.",
        "Invalid upload",
        "multiVideo"
      );
      return AntUpload.LIST_IGNORE;
    }

    if (fileList[0]?.type.startsWith("image/") && isVideo) {
      triggerError(
        "Cannot mix images and video. Choose only images.",
        "Invalid upload",
        "mixed"
      );
      return AntUpload.LIST_IGNORE;
    }

    return false;
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

                      if (urls.length > MAX_ITEMS) {
                        triggerError(
                          `You can only add up to ${MAX_ITEMS} URLs.`,
                          "Limit reached",
                          "urlLimit"
                        );
                        return Promise.reject();
                      }

                      if (youtubeUrls.length > 1) {
                        triggerError(
                          "Only one YouTube URL is allowed.",
                          "Invalid links",
                          "multiYouTube"
                        );
                        return Promise.reject();
                      }

                      if (youtubeUrls.length === 1 && imageUrls.length > 0) {
                        triggerError(
                          "You cannot mix YouTube and image URLs in the same post.",
                          "Invalid links",
                          "mixedUrl"
                        );
                        return Promise.reject();
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
                    {fields.length < MAX_ITEMS && (
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add URL
                      </Button>
                    )}
                  </>
                )}
              </Form.List>

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
          getValueFromEvent={(e) => {
            let fileList = e?.fileList || [];
            if (fileList.length > MAX_ITEMS) {
              triggerError(
                `You can only upload up to ${MAX_ITEMS} files.`,
                "Upload limit reached",
                "uploadLimit"
              );
              fileList = fileList.slice(0, MAX_ITEMS);
            }
            return fileList;
          }}
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
