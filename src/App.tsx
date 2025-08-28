import { useEffect, useState } from "react";
import Modal from "./components/Modal";
import { Check, Trash2Icon } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface Todo {
  todo: string;
  isdone: boolean;
  ispriority: boolean;
  created_at: string;
  updated_at: string;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [ispriority, setIspriority] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    loadTodos();
  }, []);

  const addTodo = async (priority: boolean) => {
    if (!input.trim()) return;
    await invoke("add_todo", { todo: input, ispriority: priority });
    setInput("");
    setOpen(false);
    loadTodos();
  };

  const removeTodo = async (i: number) => {
    await invoke("remove_todo", { index: i });
    loadTodos();
  };

  const updateTodo = async (index: number, isdone: boolean) => {
    await invoke("update_todo", { index, isdone });
    loadTodos();
  };

  const loadTodos = async () => {
    const result = await invoke<Todo[]>("get_todos");
    console.log(result);
    setTodos(result);
  };

  return (
    <div className="p-8 relative">
      <div className="flex justify-between items-center sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
        <h1 className="text-2xl">Hai {name}, Selamat Datang</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-md text-xl font-bold transition-colors cursor-pointer" onClick={() => setOpen(true)}>+</button>
      </div>

      <Modal 
        isOpen={open} 
        onClose={() => setOpen(false)}
        title="Tambah Tugas Baru"
      >
        <div className="space-y-4">
          <input 
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Masukkan tugas baru..."
            onKeyDown={(e) => e.key === 'Enter' && addTodo(ispriority)}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <input className="w-5 h-5" type="checkbox" checked={ispriority} onChange={() => setIspriority(!ispriority)} />
            <label className="text-gray-500 text-md">Prioritas</label>
          </div>
          <div className="flex gap-2 justify-end">
            <button 
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Batal
            </button>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer" 
              onClick={() => {
                addTodo(ispriority);
                setIspriority(false);
              }}
            >
              Tambah
            </button>
          </div>
        </div>
      </Modal>

      <div className="mt-6 space-y-2">
        {todos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada tugas. Klik tombol + untuk menambah tugas baru!</p>
        ) : (
          todos.map((todo, i) => (
            <div key={i} className={`flex flex-col gap-1 bg-gray-50 p-3 rounded-md border ${todo.isdone ? "bg-green-50 border-green-500" : "border-gray-200 bg-white"} ${todo.ispriority ? "bg-yellow-50 border-yellow-500" : ""}`} >
              <div className="flex items-center justify-between">
                <span className="text-gray-800 flex items-center gap-2">
                  {todo.todo}
                  {todo.ispriority && <span className="text-xs text-gray-500 bg-yellow-500 text-white px-2 py-1 rounded-full">Prioritas</span>}
                </span>
                <div className="flex gap-6">
                  {!todo.isdone && (
                  <button
                    onClick={() => updateTodo(i, true)}
                    className="text-blue-500 hover:text-blue-700 text-lg transition-colors cursor-pointer"
                    title="Selesai"
                  >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => removeTodo(i)}
                    className="text-red-500 hover:text-red-700 text-lg transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2Icon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Dibuat: {todo.created_at.split(" ")[0] + " | " + todo.created_at.split(" ")[1].split(".")[0]}</span>
                {todo.isdone && (
                  <span className="text-gray-500 text-sm">Selesai: {todo.updated_at.split(" ")[0] + " | " + todo.updated_at.split(" ")[1].split(".")[0]}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
