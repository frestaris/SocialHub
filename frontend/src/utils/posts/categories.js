import {
  FireOutlined,
  PlayCircleOutlined,
  CustomerServiceOutlined,
  ReadOutlined,
  GlobalOutlined,
  CameraOutlined,
  CoffeeOutlined,
  RocketOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

export const categories = [
  { key: "gaming", icon: PlayCircleOutlined, label: "Gaming" },
  { key: "music", icon: CustomerServiceOutlined, label: "Music" },
  { key: "art", icon: FireOutlined, label: "Art" },
  { key: "news", icon: GlobalOutlined, label: "News" },
  { key: "learning", icon: ReadOutlined, label: "Learning" },
  { key: "travel", icon: CameraOutlined, label: "Travel" },
  { key: "technology", icon: RocketOutlined, label: "Technology" },
  { key: "food", icon: CoffeeOutlined, label: "Food" },
  { key: "vlog", icon: VideoCameraOutlined, label: "Vlog" },
];

export const categoryColors = {
  gaming: "geekblue",
  music: "purple",
  art: "volcano",
  news: "cyan",
  learning: "gold",
  travel: "orange",
  technology: "blue",
  food: "gold",
  vlog: "pink",
};
