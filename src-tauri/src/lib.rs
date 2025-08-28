#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::State;
use std::sync::Mutex;
use std::fs;
use std::path::{Path, PathBuf};
use std::env;
use serde::{Deserialize, Serialize};
use chrono::Utc;
use chrono_tz::Asia::Jakarta;

#[derive(Serialize, Deserialize, Clone)]
struct Todo {
    todo: String,
    isdone: bool,
    ispriority: bool,
    created_at: String,
    updated_at: String,
}

struct TodoState {
    todos: Mutex<Vec<Todo>>,
    file_path: String,
}

impl TodoState {
    fn get_documents_path() -> Result<PathBuf, Box<dyn std::error::Error>> {
        let home_dir = env::var("HOME")?;
        let documents_path = Path::new(&home_dir).join("Documents").join("todo-app");
        
        // Buat direktori jika belum ada
        if !documents_path.exists() {
            fs::create_dir_all(&documents_path)?;
        }
        
        Ok(documents_path)
    }

    fn save_to_file(&self) -> Result<(), Box<dyn std::error::Error>> {
        let todos = self.todos.lock().unwrap();
        let json = serde_json::to_string_pretty(&*todos)?;
        
        // Pastikan direktori ada sebelum menyimpan
        let file_path = Path::new(&self.file_path);
        if let Some(parent) = file_path.parent() {
            fs::create_dir_all(parent)?;
        }
        
        fs::write(&self.file_path, json)?;
        Ok(())
    }

    fn load_from_file(&self) -> Result<(), Box<dyn std::error::Error>> {
        if Path::new(&self.file_path).exists() {
            let json = fs::read_to_string(&self.file_path)?;
            let loaded_todos: Vec<Todo> = serde_json::from_str(&json)?;
            let mut todos = self.todos.lock().unwrap();
            *todos = loaded_todos;
        }
        Ok(())
    }
}

#[tauri::command]
fn add_todo(state: State<TodoState>, todo: String, ispriority: bool) {
    {
        let mut todos = state.todos.lock().unwrap();
        todos.push(Todo {
            todo,
            isdone: false,
            ispriority,
            created_at: Utc::now().with_timezone(&Jakarta).to_string(),
            updated_at: "".to_string(),
        });
    }
    let _ = state.save_to_file();
}

#[tauri::command]
fn update_todo(state: State<TodoState>, index: usize, isdone: bool) {
    {
        let mut todos = state.todos.lock().unwrap();
        if index < todos.len() {
            todos[index].isdone = isdone;
            todos[index].ispriority = false;
            todos[index].updated_at = Utc::now().with_timezone(&Jakarta).to_string();
        }
    }
    let _ = state.save_to_file();
}

#[tauri::command]
fn get_todos(state: State<TodoState>) -> Vec<Todo> {
    let todos = state.todos.lock().unwrap();
    todos.clone()
}

#[tauri::command]
fn remove_todo(state: State<TodoState>, index: usize) {
    {
        let mut todos = state.todos.lock().unwrap();
        if index < todos.len() {
            todos.remove(index);
        }
    }
    let _ = state.save_to_file();
}

pub fn run() {
    // Dapatkan path ke folder Documents/todo-app
    let documents_path = TodoState::get_documents_path()
        .unwrap_or_else(|_| PathBuf::from(".")); // Fallback ke direktori saat ini jika gagal
    
    let file_path = documents_path.join("todos.json").to_string_lossy().to_string();
    
    let todo_state = TodoState {
        todos: Mutex::new(Vec::new()),
        file_path,
    };
    
    // Load existing todos from file
    let _ = todo_state.load_from_file();
    
    tauri::Builder::default()
        .manage(todo_state)
        .invoke_handler(tauri::generate_handler![
            // Import fungsi disini
            add_todo, 
            get_todos, 
            remove_todo, 
            update_todo
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}
