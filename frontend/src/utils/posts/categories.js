import {
  HomeOutlined,
  FireOutlined,
  PlayCircleOutlined,
  CustomerServiceOutlined,
  ReadOutlined,
  GlobalOutlined,
  HeartOutlined,
  CameraOutlined,
  CoffeeOutlined,
  RocketOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

export const categories = [
  { key: "gaming", icon: PlayCircleOutlined, label: "Gaming" },
  { key: "music", icon: CustomerServiceOutlined, label: "Music" },
  { key: "art", icon: FireOutlined, label: "Art" },
  { key: "fitness", icon: HomeOutlined, label: "Fitness" },
  { key: "news", icon: GlobalOutlined, label: "News" },
  { key: "sport", icon: HeartOutlined, label: "Sport" },
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
  fitness: "green",
  news: "cyan",
  sport: "red",
  learning: "gold",
  travel: "orange",
  technology: "blue",
  food: "gold",
  vlog: "pink",
};
