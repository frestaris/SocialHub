import GradientButton from "../../common/GradientButton";

// Handles dynamic submit button label and states for post forms
// Shows upload progress if uploading media
// Uses GradientButton for consistent UI theme

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
