import {
  Briefcase,
  Car,
  Coffee,
  HeartPulse,
  Home,
  ShoppingCart,
  Tags,
  Utensils,
  Wallet,
  Zap
} from "lucide-react";

export const CATEGORY_ICONS = [
  { value: "utensils", label: "Food" },
  { value: "home", label: "Home" },
  { value: "car", label: "Transport" },
  { value: "shopping-cart", label: "Shopping" },
  { value: "zap", label: "Utilities" },
  { value: "heart-pulse", label: "Health" },
  { value: "briefcase", label: "Work" },
  { value: "wallet", label: "Wallet" },
  { value: "coffee", label: "Cafe" },
  { value: "tags", label: "Other" }
];

const iconMap = {
  utensils: Utensils,
  home: Home,
  car: Car,
  "shopping-cart": ShoppingCart,
  zap: Zap,
  "heart-pulse": HeartPulse,
  briefcase: Briefcase,
  wallet: Wallet,
  coffee: Coffee,
  tags: Tags
};

export default function IconRenderer({ name, size = 18 }) {
  const Icon = iconMap[name] || Tags;
  return <Icon size={size} />;
}
