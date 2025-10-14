// --- Ant Design Icons ---
import { CheckOutlined } from "@ant-design/icons";

/**
 *
 * --------------------------------------
 * Displays one or two check marks depending on message status.
 *
 * Responsibilities:
 *  Shows ✓ when delivered
 *  Shows ✓✓ (blue) when seen
 *
 * Props:
 * - hasBeenSeen: boolean → whether recipient has seen message
 * - isDelivered: boolean → whether message has been delivered but not yet seen
 */
export default function MessageStatusIcon({ hasBeenSeen, isDelivered }) {
  return (
    <div
      style={{
        position: "relative",
        width: 14,
        height: 10,
        display: "inline-block",
      }}
    >
      {hasBeenSeen ? (
        // Double blue checks → message seen
        <>
          <CheckOutlined
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              fontSize: 10,
              color: "#34b7f1",
              opacity: 0.9,
            }}
          />
          <CheckOutlined
            style={{
              position: "absolute",
              top: 0,
              left: 3,
              fontSize: 10,
              color: "#34b7f1",
            }}
          />
        </>
      ) : isDelivered ? (
        // Double gray checks → delivered, not seen
        <>
          <CheckOutlined
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              fontSize: 10,
              color: "#999",
              opacity: 0.9,
            }}
          />
          <CheckOutlined
            style={{
              position: "absolute",
              top: 0,
              left: 3,
              fontSize: 10,
              color: "#999",
            }}
          />
        </>
      ) : (
        // Single gray check → sent only
        <CheckOutlined
          style={{
            position: "absolute",
            top: 0,
            left: 3,
            fontSize: 10,
            color: "#999",
            opacity: 0.9,
          }}
        />
      )}
    </div>
  );
}
