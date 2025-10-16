import { Typography } from "antd";
const { Title, Paragraph } = Typography;

export default function TermsOfService() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px" }}>
      <Title level={2}>Terms of Service</Title>

      <Paragraph>
        Welcome to <strong>Social Hub</strong>. By using this app, you agree to
        the following terms and conditions. Social Hub is a personal project
        created and maintained by <strong>Aris Fresta</strong>.
      </Paragraph>

      <Title level={4}>1. Use of the Platform</Title>
      <Paragraph>
        You agree to use Social Hub responsibly and to avoid posting or sharing
        any content that is illegal, offensive, hateful, or infringes on the
        rights of others. Any misuse of the platform may result in account
        removal.
      </Paragraph>

      <Title level={4}>2. User Accounts</Title>
      <Paragraph>
        You are responsible for maintaining the confidentiality of your account
        and for all actions performed under it. If you delete your account, all
        your posts will be automatically removed. Comments and replies will
        remain visible to maintain conversation context. If you wish to delete
        or edit comments or replies, you must do so manually before deleting
        your account.
      </Paragraph>

      <Title level={4}>3. Content Ownership</Title>
      <Paragraph>
        You retain full ownership of the content you create. By posting on
        Social Hub, you grant permission for your content to be displayed within
        the app. You may delete your content at any time. Please avoid uploading
        copyrighted material unless you own it or have explicit permission from
        the copyright holder.
      </Paragraph>

      <Title level={4}>4. Liability</Title>
      <Paragraph>
        Social Hub is provided “as is,” without warranties of any kind. I am not
        responsible for data loss, service interruptions, or issues caused by
        third-party services such as Firebase or MongoDB Atlas. Users assume all
        responsibility for how they use the platform.
      </Paragraph>

      <Title level={4}>5. Modifications</Title>
      <Paragraph>
        These terms may be updated occasionally to reflect new features or
        changes in functionality. Continued use of Social Hub after updates
        means you accept the revised terms.
      </Paragraph>

      <Title level={4}>6. Contact</Title>
      <Paragraph>
        For any questions or concerns about these terms, feel free to contact me
        at <a href="mailto:frestaris@gmail.com">frestaris@gmail.com</a>.
      </Paragraph>

      <Paragraph style={{ marginTop: 40, fontSize: 14, color: "#777" }}>
        Last updated: 16/10/2025
      </Paragraph>
    </div>
  );
}
