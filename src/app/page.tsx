import { redirect } from "next/navigation";

export default function Home() {
  redirect("/recipes/1");
}
