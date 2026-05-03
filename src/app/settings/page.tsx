"use client";

import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>("");

  // 安全的 invoke 调用
  const safeInvoke = async <T,>(command: string, args?: any): Promise<T | null> => {
    if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
      return await invoke<T>(command, args);
    }
    return null;
  };

  useEffect(() => {
    (async () => {
      const saved = await safeInvoke<string>("get_instance_url");
      if (saved) setValue(saved);
    })();
  }, []);

  async function onSubmit() {
    setError("");
    const url = value.trim();
    try {
      if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
        await invoke("set_instance_url", { url });
        window.location.replace(url);
      } else {
        setError("请在应用内操作");
      }
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="min-h-screen w-full bg-muted/30 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="justify-items-center text-center">
          <Image
            src="/logo.png"
            alt="logo"
            width={64}
            height={64}
            priority
            draggable={false}
            className="h-16 w-16 rounded-2xl select-none"
          />
          <CardTitle className="mt-2 text-2xl">欢迎回来</CardTitle>
          <CardDescription>设置实例地址</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="instance-url">实例地址</Label>
              <Input
                id="instance-url"
                placeholder="http:// 或 https://"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSubmit();
                }}
              />
                {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Separator className="flex-1" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  或者选择服务器
                </span>
                <Separator className="flex-1" />
              </div>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => setValue("https://classpet.cc.cd")}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border text-sm transition-all text-left",
                    value === "https://classpet.cc.cd"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">
                      官方服务器（Cloudflare 全球加速）
                    </span>
                    <span className="text-xs text-muted-foreground">
                      https://classpet.cc.cd
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onSubmit}>
            保存并打开
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
