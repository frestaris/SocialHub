import { CheckOutlined } from "@ant-design/icons";

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
