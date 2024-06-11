use tauri::{self, State};

use crate::Database;

#[derive(Clone, serde::Serialize)]
pub struct DatabaseData {
    id: i64,
    task: String,
    comments: String,
    completed: i64,
    due_date: i64,
    sub_tasks: String
}

fn send_query(query: String, state: State<Database>) -> Result<Vec<DatabaseData>, ()> {
    let data = state.database.lock().unwrap();

    let request = data.prepare(query);

    let mut result: Vec<DatabaseData> = vec![];

    match request {
        Ok(ref _statement) => {
            for row in request.unwrap().into_iter().map(|row| row.unwrap()) {
                result.push(DatabaseData {
                    id: row.read::<i64, _>("id"),
                    task: String::from(row.read::<&str, _>("task")),
                    comments: String::from(row.read::<&str, _>("comments")),
                    completed: row.read::<i64, _>("completed"),
                    due_date: row.read::<i64, _>("due_date"),
                    sub_tasks: String::from(row.read::<&str, _>("sub_tasks"))
                });
            }
            Ok(result)
        }
        Err(error) => {
            println!("{:?}", error);
            Err(())
        }
    }
}

#[tauri::command]
pub fn add_task(
    task: &str,
    due_date: i64,
    state: State<Database>,
) -> Result<Vec<DatabaseData>, ()> {
    let query = format!(
        "INSERT INTO tasks (task, comments, completed, due_date, sub_tasks) VALUES ({}, '', 0, {}, '[]');",
        task, due_date
    );

    match send_query(query, state.clone()) {
        Ok(_data) => {
            let query = String::from("SELECT * FROM tasks WHERE id=(SELECT max(id) FROM tasks);");
            send_query(query, state)
        }
        Err(error) => {
            println!("Error: {:?}", error);
            Err(())
        }
    }
}

#[tauri::command]
pub fn get_tasks(value: i64, state: State<Database>) -> Result<Vec<DatabaseData>, ()> {
    let query = format!(
        "select * from tasks where completed = 0 or completed > {} order by due_date",
        value - (2592000 * 1000)
    ); //Get tasks that has not been completed or completed on the last 30 days

    send_query(query, state)
}

#[tauri::command]
pub fn delete_task(task_id: i64, state: State<Database>) -> Result<Vec<DatabaseData>, ()> {
    let query = format!("delete from tasks where id = {}", task_id);

    send_query(query, state)
}

#[tauri::command]
pub fn edit_task(
    task_id: i64,
    column: Vec<&str>,
    value: Vec<&str>,
    state: State<Database>,
) -> Result<Vec<DatabaseData>, ()> {
    if column.len() != value.len() {
        return Err(());
    }

    let mut modifications: Vec<String> = Vec::new();

    for n in 0..column.len() {
        modifications.push(format!("{}='{}'", column[n], value[n]));
    }

    let query = format!(
        "update tasks set {} where id = {}",
        modifications.join(", "),
        task_id
    );

    println!("{}", query);

    send_query(query, state)
}

#[tauri::command]
pub fn migration(state: State<Database>) -> Result<Vec<DatabaseData>, ()> {
    let query = format!("alter table tasks add sub_tasks text");

    match send_query(query, state.clone()) {
        Ok(_data) => {}
        Err(()) => return Err(()),
    }

    let query = format!("update tasks set sub_tasks = \"[]\"");

    send_query(query, state)
}
