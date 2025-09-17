// categories.js
import {
  HomeOutlined,
  FireOutlined,
  PlayCircleOutlined,
  CustomerServiceOutlined,
  ReadOutlined,
  BulbOutlined,
  GlobalOutlined,
  HeartOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

export const categories = [
  { key: "gaming", icon: PlayCircleOutlined, label: "Gaming" },
  { key: "music", icon: CustomerServiceOutlined, label: "Music" },
  { key: "art", icon: FireOutlined, label: "Art" },
  { key: "fitness", icon: HomeOutlined, label: "Fitness" },
  { key: "news", icon: GlobalOutlined, label: "News" },
  { key: "sport", icon: HeartOutlined, label: "Sport" },
  { key: "learning", icon: ReadOutlined, label: "Learning" },
  { key: "podcast", icon: BulbOutlined, label: "Podcast" },
  { key: "fashion", icon: ShoppingOutlined, label: "Fashion" },
];

export const categoryColors = {
  gaming: "geekblue",
  music: "purple",
  art: "volcano",
  fitness: "green",
  news: "cyan",
  sport: "red",
  learning: "gold",
  podcast: "lime",
  fashion: "magenta",
};
