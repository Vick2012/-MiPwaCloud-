// ---------- Lógica de la app: lista de tareas guardada en localStorage ----------
const form = document.getElementById('form-tarea');
const input = document.getElementById('texto-tarea');
const lista = document.getElementById('lista-tareas');

function leerTareas() {
  try { return JSON.parse(localStorage.getItem('tareas')) || []; } catch { return []; }
}

function guardarTareas(tareas) {
  localStorage.setItem('tareas', JSON.stringify(tareas));
}

function pintarTareas() {
  lista.innerHTML = '';
  leerTareas().forEach((tarea, i) => {
    const li = document.createElement('li');
    li.textContent = tarea;
    const btn = document.createElement('button');
    btn.textContent = 'Hecha';
    btn.addEventListener('click', () => {
      const tareas = leerTareas();
      tareas.splice(i, 1);
      guardarTareas(tareas);
      pintarTareas();
    });
    li.appendChild(btn);
    lista.appendChild(li);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const tareas = leerTareas();
  tareas.push(input.value.trim());
  guardarTareas(tareas);
  input.value = '';
  pintarTareas();
});

pintarTareas();
document.getElementById('hora-carga').textContent = new Date().toLocaleTimeString('es-CO');

// ---------- Indicador de conexión ----------
const estado = document.getElementById('estado');
function actualizarEstado() {
  estado.textContent = navigator.onLine ? 'En línea' : 'Sin conexión';
  estado.className = 'estado ' + (navigator.onLine ? 'online' : 'offline');
}
window.addEventListener('online', actualizarEstado);
window.addEventListener('offline', actualizarEstado);
actualizarEstado();

// ---------- Notificación de prueba (usa el Service Worker) ----------
document.getElementById('btn-notificar').addEventListener('click', async () => {
  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') return alert('Permiso de notificaciones denegado');
  const registro = await navigator.serviceWorker.ready;
  registro.showNotification('Agenda UMB', {
    body: 'Recuerda revisar tus tareas pendientes',
    icon: '/icons/icon-192.png',
  });
});

// Registrar el Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registro) => {
        console.log('[App] Service Worker registrado:', registro.scope);
        document.getElementById('sw-estado').textContent = 'registrado (' + registro.scope + ')';
      })
      .catch((error) => {
        console.error('[App] Error al registrar SW:', error);
        document.getElementById('sw-estado').textContent = 'error al registrar';
      });
  });
} else {
  console.log('[App] Service Workers no soportados en este navegador');
}
