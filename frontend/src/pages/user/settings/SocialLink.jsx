import { Typography } from "antd";
const { Text } = Typography;

export default function SocialLink({
  providerId,
  label,
  icon,
  color,
  provider,
  linkedProviders,
  handleLinkProvider,
}) {
  const isLinked = linkedProviders.includes(providerId);

  return (
    <div
      onClick={!isLinked ? () => handleLinkProvider(provider) : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        borderRadius: 8,
        cursor: isLinked ? "default" : "pointer",
        background: isLinked ? "#f6ffed" : "#fafafa",
        transition: "background 0.3s ease",
      }}
      onMouseEnter={(e) => {
        if (!isLinked) {
          e.currentTarget.style.background = "#e6f7ff";
        }
      }}
      onMouseLeave={(e) => {
        if (!isLinked) {
          e.currentTarget.style.background = "#fafafa";
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon && <span style={{ fontSize: 22, color }}>{icon}</span>}
        {isLinked ? (
          <Text strong style={{ color: "#52c41a" }}>
            Connected with {label}
          </Text>
        ) : (
          <Text type="secondary">Click to connect your {label} account</Text>
        )}
      </div>
    </div>
  );
}
