import { redirect } from "next/navigation";
import { routes } from "@/lib/routeController";

export default function CreatorPage() {
  redirect(routes.creator.overview());
}
