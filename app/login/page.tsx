import { Target } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm"><CardHeader className="items-center text-center"><span className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Target aria-hidden="true" /></span><CardTitle className="text-xl">公考刷题统计</CardTitle><CardDescription>这是个人学习数据，请输入访问密码。</CardDescription></CardHeader><CardContent><LoginForm /></CardContent></Card>
    </main>
  );
}
