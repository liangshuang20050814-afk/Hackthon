// [Owner: D] Entry route. The app opens straight into login/sign up — no
// separate marketing hero screen — so this just forwards there. Once real
// session state exists, this is also where a logged-in user would be sent
// straight to /matches instead.
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/login");
}
