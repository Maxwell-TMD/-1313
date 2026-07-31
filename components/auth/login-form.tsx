"use client";

import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <form action={action} className="space-y-4">
      {state.error ? <Alert variant="destructive">{state.error}</Alert> : null}
      <div><Label htmlFor="password">访问密码</Label><Input id="password" name="password" type="password" className="mt-2" autoComplete="current-password" required autoFocus /></div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}><LockKeyhole aria-hidden="true" />{pending ? "正在验证…" : "进入应用"}</Button>
    </form>
  );
}
