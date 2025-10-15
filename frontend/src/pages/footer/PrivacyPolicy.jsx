import { Typography } from "antd";
const { Title, Paragraph } = Typography;

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px" }}>
      <Title level={2}>Privacy Policy</Title>

      <Paragraph>
        This Privacy Policy describes how <strong>Social Hub</strong> handles
        basic information when you use the application. Social Hub is a personal
        project created and maintained by a single developer (
        <strong>Aris Fresta</strong>).
      </Paragraph>

      <Title level={4}>1. Information Collected</Title>
      <Paragraph>
        Social Hub uses Firebase Authentication to allow users to sign in with
        Google or Github. When you log in, Firebase may share your public
        profile information (name, email address, and profile picture). This
        data is managed securely by Firebase and is not stored or shared by me
        outside of the app’s normal functionality.
      </Paragraph>

      <Title level={4}>2. How Information Is Used</Title>
      <Paragraph>
        The information retrieved from Firebase is used only to display your
        profile, manage your posts, and enable basic features such as likes,
        comments, and messaging. I do not sell, trade, or share your data with
        anyone.
      </Paragraph>

      <Title level={4}>3. Analytics and Cookies</Title>
      <Paragraph>
        The app may use Google Analytics or similar tools to collect anonymous
        usage data—such as page views or general traffic trends—to help improve
        performance. No personally identifiable information is collected through
        analytics.
      </Paragraph>

      <Title level={4}>4. Data Storage and Security</Title>
      <Paragraph>
        Data such as posts or chat messages are stored in Firebase and MongoDB
        Atlas. These services provide secure hosting and encryption. I do not
        manually access or modify user data except for maintenance or debugging.
      </Paragraph>

      <Title level={4}>5. Your Control</Title>
      <Paragraph>
        You can delete your account at any time directly through the app. When
        an account is deleted, all posts created by that user are automatically
        removed from the database in cascade. However, comments and replies that
        were part of other users’ discussions will remain visible to preserve
        the context of conversations.
      </Paragraph>

      <Paragraph>
        If you wish to delete or edit your comments or replies, you must do so
        manually and individually before deleting your account. Once your
        account is removed, you will no longer have access to modify or manage
        any remaining content associated with it.
      </Paragraph>

      <Title level={4}>6. Contact</Title>
      <Paragraph>
        If you have any questions about privacy or data handling in Social Hub,
        please contact me at{" "}
        <a href="mailto:frestaris.web.developer@gmail.com">
          frestaris.web.developer@gmail.com
        </a>
        .
      </Paragraph>

      <Paragraph style={{ marginTop: 40, fontSize: 14, color: "#777" }}>
        Last updated: {new Date().toLocaleDateString()}
      </Paragraph>
    </div>
  );
}
