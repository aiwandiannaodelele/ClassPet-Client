use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::{
    image::Image,
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Manager, WindowEvent,
};

const MAIN_WINDOW: &str = "main";
const FLOAT_WINDOW: &str = "float";
const CONFIG_FILE_NAME: &str = "classpet.json";

#[allow(dead_code)]
struct TrayState(tauri::tray::TrayIcon);

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct AppConfig {
    #[serde(rename = "instanceUrl")]
    instance_url: Option<String>,
}

fn config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("app_config_dir: {e}"))?;
    Ok(dir.join(CONFIG_FILE_NAME))
}

fn read_config(app: &AppHandle) -> AppConfig {
    let Ok(path) = config_path(app) else {
        return AppConfig::default();
    };
    let Ok(s) = fs::read_to_string(path) else {
        return AppConfig::default();
    };
    serde_json::from_str(&s).unwrap_or_default()
}

fn write_config(app: &AppHandle, cfg: &AppConfig) -> Result<(), String> {
    let path = config_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("create_dir_all: {e}"))?;
    }
    let content = serde_json::to_string(cfg).map_err(|e| format!("to_string: {e}"))?;
    fs::write(path, content).map_err(|e| format!("write: {e}"))?;
    Ok(())
}

fn show_main_window(app: &AppHandle) -> Result<(), String> {
    if let Some(float) = app.get_webview_window(FLOAT_WINDOW) {
        let _ = float.hide();
    }
    if let Some(main) = app.get_webview_window(MAIN_WINDOW) {
        let _ = main.show();
        let _ = main.set_focus();
    }
    Ok(())
}

fn hide_main_show_float(app: &AppHandle) -> Result<(), String> {
    if let Some(main) = app.get_webview_window(MAIN_WINDOW) {
        let _ = main.hide();
    }
    if let Some(float) = app.get_webview_window(FLOAT_WINDOW) {
        let _ = float.show();
        let _ = float.set_focus();
    }
    Ok(())
}

fn open_settings(app: &AppHandle) -> Result<(), String> {
    show_main_window(app)?;
    if let Some(main) = app.get_webview_window(MAIN_WINDOW) {
        let target = if cfg!(debug_assertions) {
            "http://localhost:1420/settings"
        } else {
            "tauri://localhost/settings/"
        };
        main.eval(&format!("window.location.replace('{target}')"))
            .map_err(|e| format!("eval: {e}"))?;
    }
    Ok(())
}

#[tauri::command]
fn get_instance_url(app: AppHandle) -> Option<String> {
    read_config(&app).instance_url
}

#[tauri::command]
fn set_instance_url(app: AppHandle, url: String) -> Result<(), String> {
    let url = url.trim().to_string();
    if !(url.starts_with("http://") || url.starts_with("https://")) {
        return Err("实例地址必须以 http:// 或 https:// 开头".to_string());
    }
    let mut cfg = read_config(&app);
    cfg.instance_url = Some(url);
    write_config(&app, &cfg)
}

#[tauri::command]
fn show_main(app: AppHandle) -> Result<(), String> {
    show_main_window(&app)
}

#[tauri::command]
fn hide_main(app: AppHandle) -> Result<(), String> {
    hide_main_show_float(&app)
}

#[tauri::command]
fn open_settings_command(app: AppHandle) -> Result<(), String> {
    open_settings(&app)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let show_i = MenuItem::with_id(app, "show", "显示主窗口", true, None::<&str>)?;
            let edit_i =
                MenuItem::with_id(app, "edit", "修改实例地址", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "退出程序", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&show_i, &edit_i, &quit_i])?;
            let mut tray = TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        let _ = show_main_window(app);
                    }
                    "edit" => {
                        let _ = open_settings(app);
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                });

            #[cfg(target_os = "macos")]
            {
                tray = tray.icon_as_template(true);
            }

            if let Ok(icon) = Image::from_bytes(include_bytes!("../app-icon.png")) {
                tray = tray.icon(icon);
            } else if let Some(icon) = app.default_window_icon() {
                tray = tray.icon(icon.clone());
            }

            let tray = tray.build(app)?;
            app.manage(TrayState(tray));
            Ok(())
        })
        .on_window_event(|window, event| match event {
            WindowEvent::CloseRequested { api, .. } => {
                api.prevent_close();
                let app = window.app_handle();
                if window.label() == MAIN_WINDOW {
                    let _ = hide_main_show_float(app);
                } else {
                    let _ = window.hide();
                }
            }
            _ => {
                if window.label() == MAIN_WINDOW {
                    if window.is_minimized().unwrap_or(false) {
                        let _ = window.unminimize();
                        let app = window.app_handle();
                        let _ = hide_main_show_float(app);
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_instance_url,
            set_instance_url,
            show_main,
            hide_main,
            open_settings_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
