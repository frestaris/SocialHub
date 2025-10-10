// --- Ant Design ---
import { Modal } from "antd";

// --- Components ---
import EditPostForm from "../form/EditPostForm";

export default function PostModals({
  editingPost,
  deletingPost,
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
        width="70%"
        style={{
          top: 10,
          maxWidth: 600,
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
