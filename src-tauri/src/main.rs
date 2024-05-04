// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod database_commands;

use sqlite::{self, Connection};
use std::sync::Mutex;

pub struct Database {
    database: Mutex<Connection>,
}

fn open_database_connection() -> Connection {
    let database = sqlite::open("./tasks.db").unwrap();

    let query = "
    CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, task TEXT, comments TEXT, due_date INTERGER, completed INTERGER);
    ";

    database.execute(query).unwrap();

    return database;
}

fn main() {
    tauri::Builder::default()
        .manage(Database {
            database: Mutex::new(open_database_connection()),
        })
        .invoke_handler(tauri::generate_handler![
            database_commands::add_task,
            database_commands::get_tasks,
            database_commands::delete_task,
            database_commands::edit_task,
            database_commands::migration
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}