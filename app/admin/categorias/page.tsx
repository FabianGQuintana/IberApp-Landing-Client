import type { Metadata } from "next";
import { CategoriesView } from "@/components/admin/categories/CategoriesView";

export const metadata: Metadata = { title: "Categorías" };

export default function CategoriesPage() {
  return <CategoriesView />;
}
