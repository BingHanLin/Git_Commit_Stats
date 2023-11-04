// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::sync::Mutex;
use std::{thread, time::Duration};

use git_commit_stats::{CommitStatus, GitLogStats};

#[derive(Serialize, Clone)]
pub struct AuthState {
    logged_in: bool,
    counter: usize,
}

#[tauri::command(rename_all = "snake_case")]
async fn import_git_log_file(file_path: String) -> Result<(GitLogStats, Vec<CommitStatus>), ()> {
    match git_commit_stats::open_git_log_file(&file_path.to_string()) {
        Err(err) => eprintln!("{}: {}", file_path, err),
        Ok(file) => {
            if let Ok(commits_status) = git_commit_stats::parse_git_log_file(file) {
                if let Ok(git_log_stats) = git_commit_stats::parse_commits(&commits_status) {
                    return Ok((git_log_stats, commits_status));
                }
            }
        }
    }

    return Err(());
}

#[tauri::command]
fn test_auth(state_mutex: tauri::State<'_, Mutex<AuthState>>) -> AuthState {
    println!("test_auth!");

    match state_mutex.lock() {
        Err(_) => AuthState {
            logged_in: false,
            counter: 0,
        },
        Ok(mut state) => {
            state.logged_in = true;
            state.counter += 1;

            println!("state.counter: {}!", state.counter);

            state.clone()
        }
    }
}

// Return a Result<String, ()> to bypass the borrowing issue
#[tauri::command]
async fn my_custom_command(value: &str) -> Result<String, ()> {
    // Note that the return value must be wrapped in `Ok()` now.

    thread::sleep(Duration::from_millis(4000));
    Ok(format!("{}", value))
}

fn main() {
    tauri::Builder::default()
        .manage(Mutex::new(AuthState {
            logged_in: false,
            counter: 0,
        }))
        .invoke_handler(tauri::generate_handler![
            import_git_log_file,
            test_auth,
            my_custom_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
