import { Result } from "antd";
import { Link } from "react-router-dom";
import { CompassOutlined } from "@ant-design/icons";
import GradientButton from "../common/GradientButton";

export default function NotFound() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Link to="/explore">
          <GradientButton icon={<CompassOutlined />} text="Back to Explore" />
        </Link>
      }
    />
  );
}
