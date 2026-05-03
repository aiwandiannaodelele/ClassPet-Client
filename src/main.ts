import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

type Mode = "settings" | "float" | "normal";

function getMode(): Mode {
  const mode = new URLSearchParams(window.location.search).get("mode");
  if (mode === "settings") return "settings";
  if (mode === "float") return "float";
  return "normal";
}

function qs<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`missing element: ${selector}`);
  return el as T;
}

async function renderSettings() {
  const saved = await invoke<string | null>("get_instance_url");

  qs<HTMLDivElement>("#app").innerHTML = `
    <div class="content">
      <div class="card" style="width:min(520px,100%);box-shadow:var(--shadow-xl);">
        <div class="card-header">
          <h3 class="card-title">实例地址</h3>
          <p class="card-description">首次使用请填写实例地址，之后会自动加载。</p>
        </div>
        <div class="card-content">
          <form id="settingsForm">
            <label class="label" for="instanceUrl">地址</label>
            <input
              id="instanceUrl"
              class="input"
              placeholder="http:// 或 https://"
              value="${saved ? escapeHtml(saved) : ""}"
              autocomplete="off"
            />
            <p class="field-error" id="error"></p>
          </form>
        </div>
        <div class="card-footer" style="justify-content:flex-end;">
          <button class="btn" data-variant="default" type="submit" form="settingsForm">保存并打开</button>
        </div>
      </div>
    </div>
  `;

  const form = qs<HTMLFormElement>("#settingsForm");
  const input = qs<HTMLInputElement>("#instanceUrl");
  const error = qs<HTMLParagraphElement>("#error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.textContent = "";
    const url = input.value.trim();
    try {
      await invoke("set_instance_url", { url });
      window.location.replace(url);
    } catch (err) {
      error.textContent = String(err);
    }
  });
}

async function renderFloat() {
  qs<HTMLDivElement>("#app").innerHTML = `
    <div class="float-root">
      <button id="floatBall" class="float-ball" type="button" aria-label="显示主窗口">
        <img class="float-logo" src="/src/assets/logo.png" alt="logo" />
      </button>
    </div>
  `;

  const win = getCurrentWindow();
  const ball = qs<HTMLButtonElement>("#floatBall");

  ball.addEventListener("pointerdown", async (e) => {
    if ((e as PointerEvent).button !== 0) return;
    await win.startDragging();
  });

  ball.addEventListener("click", async () => {
    await invoke("show_main");
  });
}

async function boot() {
  const mode = getMode();
  if (mode === "float") {
    await renderFloat();
    return;
  }

  if (mode === "settings") {
    await renderSettings();
    return;
  }

  const url = await invoke<string | null>("get_instance_url");
  if (!url) {
    await renderSettings();
    return;
  }
  window.location.replace(url);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.addEventListener("DOMContentLoaded", () => {
  boot();
});
