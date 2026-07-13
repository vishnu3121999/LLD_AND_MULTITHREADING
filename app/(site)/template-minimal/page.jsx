import { redirect } from "next/navigation";

export const metadata = {
  title: "LLD Template | LLD Playbook"
};

export default function TemplateMinimalPage() {
  redirect("/lld-template");
}
