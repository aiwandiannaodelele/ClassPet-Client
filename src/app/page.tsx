"use client";

import { invoke } from "@tauri-apps/api/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const url = await invoke<string | null>("get_instance_url");
        if (cancelled) return;

        if (!url) {
          router.replace("/settings");
          return;
        }

        window.location.replace(url);
      } catch {
        router.replace("/settings");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
