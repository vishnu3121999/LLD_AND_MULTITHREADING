import { redirect } from "next/navigation";

export const metadata = {
  title: "Solved Problems | LLD Playbook"
};

export default function SolvePage() {
  redirect("/problems");
}
