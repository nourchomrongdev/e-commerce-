import ProductCard, { Item } from "./ProductCard";
export const apps: Item[] = [
  { name: "Spotify", type: "Music & Audio", icon: "S", rating: "4.6" },
  { name: "WhatsApp", type: "Communication", icon: "W", rating: "4.5" },
  { name: "Canva", type: "Photo & Video", icon: "C", rating: "4.7" },
  { name: "Duolingo", type: "Education", icon: "D", rating: "4.8" },
  { name: "Netflix", type: "Entertainment", icon: "N", rating: "4.4" },
  { name: "TikTok", type: "Social", icon: "T", rating: "4.6" },
];
export const products: Item[] = [
  {
    name: "Startup Landing Page",
    type: "UI Kit",
    icon: "UI",
    rating: "4.8",
    price: "$24",
  },
  {
    name: "The Ultimate Design",
    type: "eBook",
    icon: "E",
    rating: "4.7",
    price: "$15",
  },
  {
    name: "Full Stack Web Dev",
    type: "Course",
    icon: "JS",
    rating: "4.9",
    price: "$49",
  },
  {
    name: "Modern Resume",
    type: "Template",
    icon: "CV",
    rating: "4.6",
    price: "$9",
  },
  {
    name: "Instagram Post Bundle",
    type: "Graphics",
    icon: "IG",
    rating: "4.8",
    price: "$12",
  },
  {
    name: "Business Plan",
    type: "Template",
    icon: "BP",
    rating: "4.7",
    price: "$18",
  },
];
export default function ProductGrid({
  items,
  product = false,
}: {
  items: Item[];
  product?: boolean;
}) {
  return (
    <div
      className={`grid gap-3 ${product ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6"}`}
    >
      {items.map((item, index) => (
        <ProductCard
          key={item.name}
          item={item}
          index={index}
          product={product}
        />
      ))}
    </div>
  );
}
