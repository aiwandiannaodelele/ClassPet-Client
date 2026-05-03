"use client";

import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function FloatPage() {
  const dragRef = useRef<{ startX: number; startY: number; started: boolean; dragging: boolean }>({
    startX: 0,
    startY: 0,
    started: false,
    dragging: false,
  });

  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    window.addEventListener("contextmenu", onContextMenu, true);
    return () => window.removeEventListener("contextmenu", onContextMenu, true);
  }, []);

  return (
    <>
      <style jsx global>{`
        html,
        body {
          background: transparent !important;
        }
      `}</style>
      <div className="h-screen w-screen bg-transparent flex items-center justify-center">
      <button
        type="button"
        aria-label="显示主窗口"
          className="h-[144px] w-[144px] rounded-full bg-transparent border-0 p-0 flex items-center justify-center select-none outline-none focus-visible:outline-none"
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            started: true,
            dragging: false,
          };
        }}
        onPointerMove={async (e) => {
          if (!dragRef.current.started || dragRef.current.dragging) return;
          const dx = e.clientX - dragRef.current.startX;
          const dy = e.clientY - dragRef.current.startY;
          if (Math.hypot(dx, dy) < 4) return;
          dragRef.current.dragging = true;
          try {
            const win = getCurrentWindow();
            await win.startDragging();
          } catch {}
        }}
        onPointerUp={async (e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          const { dragging } = dragRef.current;
          dragRef.current.started = false;
          dragRef.current.dragging = false;
          if (dragging) return;
          await invoke("show_main");
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Image
          src="/logo.png"
          alt="logo"
          width={96}
          height={96}
          priority
            draggable={false}
            className="h-[96px] w-[96px] object-contain pointer-events-none select-none"
        />
      </button>
      </div>
    </>
  );
}
