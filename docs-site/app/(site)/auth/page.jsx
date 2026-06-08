import { AuthPanel } from "../../../components/auth-panel";

export const metadata = {
  title: "Sign in | 01 Interview"
};

export default function AuthPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md">
        <AuthPanel />
      </section>
    </main>
  );
}
