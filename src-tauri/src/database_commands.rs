use tauri::{self, State};
use sqlite;
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

#[derive(Clone, serde::Serialize)]
pub struct Template {
    id: i64,
    name: String,
    sub_tasks:String
}

fn send_query(query: String, state: State<Database>) -> Result<Vec<DatabaseData>, ()> {
    let data = state.database.lock().unwrap();

    let request = data.prepare(query);

    let mut result: Vec<DatabaseData> = vec![];

    match request {
        Ok(mut statement) => {
            while let Ok(sqlite::State::Row) = statement.next() {
                result.push(DatabaseData {
                    id: statement.read::<i64, _>("id").unwrap(),
                    task: statement.read::<String, _>("task").unwrap().replace("\\u0027", "'"),
                    comments: statement.read::<String, _>("comments").unwrap().replace("\\u0027", "'"),
                    completed: statement.read::<i64, _>("completed").unwrap(),
                    due_date: statement.read::<i64, _>("due_date").unwrap(),
                    sub_tasks: statement.read::<String, _>("sub_tasks").unwrap()
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

fn send_query_template (query: String, state: State<Database>) -> Result<Vec<Template>, ()> {
    let data = state.database.lock().unwrap();

    let request = data.prepare(query);

    let mut result: Vec<Template> = vec![];

    match request {
        Ok(mut statement) => {
            while let Ok(sqlite::State::Row) = statement.next() {
                result.push(Template {
                    id: statement.read::<i64, _>("id").unwrap(),
                    name: statement.read::<String, _>("name").unwrap(),
                     sub_tasks: statement.read::<String, _>("sub_tasks").unwrap()
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
        "INSERT INTO tasks (task, comments, completed, due_date, sub_tasks) VALUES ('{}', '', 0, {}, '[]');",
        task.to_string().replace("'", "\\u0027"), due_date
    );

    println!("{}", query);

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
pub fn get_tasks(_value: i64, state: State<Database>) -> Result<Vec<DatabaseData>, ()> {
    // let query = format!(
    //     "select * from tasks where completed = 0 or completed > {} order by due_date",
    //     value - (2592000 * 1000)
    // ); //Get tasks that has not been completed or completed on the last 30 days

    let query = format!(
        "select * from tasks order by due_date"
    ); 

    send_query(query, state)
}

#[tauri::command]
pub fn delete_task(task_id: i64, state: State<Database>) -> Result<Vec<DatabaseData>, ()> {
    let query = format!("DELETE FROM tasks WHERE id = {}", task_id);

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
        modifications.push(format!("{}='{}'", column[n], value[n].to_string().replace("'", "\\u0027")));
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
pub fn get_all_templates(state: State<Database>) -> Result<Vec<Template>, ()> {
    let query = format!("SELECT * FROM sub_tasks_templates;");

    match send_query_template(query, state) {
        Ok(data) => Ok(data),
        Err(()) => Err(())
    }
}

#[tauri::command]
pub fn add_sub_task_template(state: State<Database>, sub_tasks: &str, name: &str) -> Result<(), ()> {
    let query = format!("INSERT INTO sub_tasks_templates (name, sub_tasks) VALUES ('{}', '{}');", name, sub_tasks);

    match send_query_template(query, state) {
        Ok(_data) => Ok(()),
        Err(()) => Err(())
    }
}

#[tauri::command]
pub fn delete_sub_task_template(state: State<Database>, id: i64) -> Result<(), ()> {
    let query = format!("DELETE FROM sub_tasks_templates WHERE id = {};", id);

    match send_query_template(query, state) {
        Ok(_data) => Ok(()),
        Err(()) => Err(())
    }
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


