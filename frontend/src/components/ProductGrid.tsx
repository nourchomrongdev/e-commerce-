import ProductCard, { Item } from "./ProductCard";
export const apps: Item[] = [
  { name: "Spotify", type: "Music & Audio", icon: "S" },
  { name: "WhatsApp", type: "Communication", icon: "W" },
  { name: "Canva", type: "Photo & Video", icon: "C" },
  { name: "Duolingo", type: "Education", icon: "D" },
  { name: "Netflix", type: "Entertainment", icon: "N" },
  { name: "TikTok", type: "Social", icon: "T" },
];
export const products: Item[] = [
  {
    name: "Startup Landing Page",
    type: "UI Kit",
    icon: "UI",
    price: "$24",
  },
  {
    name: "The Ultimate Design",
    type: "eBook",
    icon: "E",
    price: "$15",
  },
  {
    name: "Full Stack Web Dev",
    type: "Course",
    icon: "JS",
    price: "$49",
  },
  {
    name: "Modern Resume",
    type: "Template",
    icon: "CV",
    price: "$9",
  },
  {
    name: "Instagram Post Bundle",
    type: "Graphics",
    icon: "IG",
    price: "$12",
  },
  {
    name: "Business Plan",
    type: "Template",
    icon: "BP",
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
