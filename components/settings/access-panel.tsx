import { LogOut, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AccessPanel() {
  if (!process.env.APP_PASSWORD) return null;
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5" aria-hidden="true" />访问保护</CardTitle><CardDescription>生产网站已启用单用户密码保护。</CardDescription></CardHeader><CardContent><form action={logoutAction}><Button type="submit" variant="outline"><LogOut aria-hidden="true" />退出当前设备</Button></form></CardContent></Card>
  );
}
