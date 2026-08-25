import { redirect } from "next/navigation";
import { routes } from "@/lib/routeController";

export default function BuyerPage() {
  redirect(routes.buyer.dashboard());
}