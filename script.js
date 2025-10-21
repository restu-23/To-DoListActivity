// Registrasi Service Worker (agar PWA aktif)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

// Minta izin notifikasi
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

const taskInput = document.getElementById("taskInput");
const deadlineInput = document.getElementById("deadlineInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.classList.toggle("completed", task.completed);

    const text = document.createElement("span");
    text.textContent = task.text;

    const time = document.createElement("span");
    time.classList.add("deadline");
    const deadlineDate = new Date(task.deadline);
    time.textContent = `⏰ ${deadlineDate.toLocaleString()}`;

    const btnGroup = document.createElement("div");
    btnGroup.classList.add("btn-group");

    const completeBtn = document.createElement("button");
    completeBtn.textContent = task.completed ? "↩" : "✔";
    completeBtn.onclick = () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    };

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏";
    editBtn.onclick = () => {
      const newText = prompt("Edit tugas:", task.text);
      if (newText) {
        task.text = newText;
        saveTasks();
        renderTasks();
      }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.onclick = () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    };

    btnGroup.appendChild(completeBtn);
    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);

    li.appendChild(text);
    li.appendChild(time);
    li.appendChild(btnGroup);
    taskList.appendChild(li);
  });
}

addBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();
  const deadline = deadlineInput.value;

  if (taskText === "" || deadline === "") {
    alert("Harap isi tugas dan waktu deadline!");
    return;
  }

  const newTask = {
    text: taskText,
    deadline: new Date(deadline).toISOString(),
    completed: false,
    notified: false,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = "";
  deadlineInput.value = "";
});

// Interval pengecekan waktu (agar jalan di Android/iPhone)
setInterval(() => {
  const now = new Date();
  tasks.forEach((task) => {
    const deadline = new Date(task.deadline);
    const diff = deadline - now;
    if (diff > 0 && diff <= 30 * 60 * 1000 && !task.notified && !task.completed) {
      if (Notification.permission === "granted") {
        new Notification("⏰ Pengingat To-Do List", {
          body: `Tugas "${task.text}" akan berakhir dalam 30 menit!`,
          icon: "https://cdn-icons-png.flaticon.com/512/1029/1029132.png",
        });
      }
      task.notified = true;
      saveTasks();
    }
  });
}, 60000); // cek setiap 1 menit

renderTasks();
