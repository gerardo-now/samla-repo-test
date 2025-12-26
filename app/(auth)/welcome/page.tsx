import { redirect } from "next/navigation";

// Redirect /welcome to /sign-up - no intermediate step needed
export default function WelcomePage() {
  redirect("/sign-up");
}
