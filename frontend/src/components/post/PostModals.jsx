// --- Ant Design ---
import { Modal } from "antd";

// --- Components ---
import EditPostForm from "./EditPostForm";

export default function PostModals({
  editingPost,
  deletingPost,
  isDesktop,
  isUpdating,
  isDeleting,
  onUpdate,
  onCloseEdit,
  onCloseDelete,
  onDeleteConfirm,
}) {
  return (
    <>
      {/* ---- Edit Modal ---- */}
      <Modal
        open={!!editingPost}
        title="Edit Post"
        onCancel={onCloseEdit}
        footer={null}
        width={isDesktop ? "70%" : "100%"}
        style={{
          top: isDesktop ? 30 : 5,
          maxWidth: isDesktop ? 600 : "100%",
          padding: "0 16px",
        }}
        destroyOnHidden
      >
        <EditPostForm
          post={editingPost}
          open={!!editingPost}
          onUpdate={onUpdate}
          onClose={onCloseEdit}
          loading={isUpdating}
        />
      </Modal>

      {/* ---- Delete Modal ---- */}
      <Modal
        open={!!deletingPost}
        title="Confirm Delete"
        okText="Yes, delete"
        okType="danger"
        confirmLoading={isDeleting}
        onCancel={onCloseDelete}
        onOk={onDeleteConfirm}
      >
        Are you sure you want to delete{" "}
        <b>
          {deletingPost?.type === "video"
            ? deletingPost?.video?.title
            : "this post"}
        </b>
        ?
      </Modal>
    </>
  );
}
