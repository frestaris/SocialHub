import GradientButton from "../../common/GradientButton";

export default function SubmitButton({
  isUploading,
  uploadProgress,
  loading,
  isChanged,
  isEdit,
}) {
  let label = isEdit ? "Save Changes" : "Publish";

  if (isUploading) {
    label =
      uploadProgress < 100
        ? `Uploading... ${Math.round(uploadProgress)}%`
        : "Finalizing...";
  } else if (loading) {
    label = isEdit ? "Saving..." : "Publishing...";
  }

  return (
    <GradientButton
      text={label}
      type="primary"
      htmlType="submit"
      block
      loading={isUploading || loading}
      disabled={isEdit ? !isChanged : false}
    />
  );
}
