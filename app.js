const express = require("express");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ⚡ Token de tu bot de Telegram
const TOKEN = "8567213014:AAFizxx5MTQL-6orVcuEehPM8ZrcyY-9Vjc"; 
const bot = new TelegramBot(TOKEN, { polling: true });

// 💬 Chat ID del usuario
let chatId = null;

// Archivo de datos
const DATA_FILE = path.join(__dirname, "data.json");

// Cargar datos desde archivo
function cargarDatos() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ recordatorios: [], notas: [] }, null, 2));
  }
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  return data;
}

// Guardar datos en archivo
function guardarDatos() {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ recordatorios, notas }, null, 2));
}

// Horario completo de clases
const horario = [
  { "dia": "Lunes", "inicio": "07:00", "fin": "09:00", "materia": "Lenguajes De Interfaz", "aula": "CCOM", "profesor": "Villasis Santos Roger Argenis" },
  { "dia": "Lunes", "inicio": "09:00", "fin": "10:00", "materia": "Administracion De Base De Datos", "aula": "101", "profesor": "Villasis Santos Roger Argenis" },
  { "dia": "Lunes", "inicio": "10:00", "fin": "12:00", "materia": "Lenguajes Y Automatas I", "aula": "101", "profesor": "Villasis Santos Roger Argenis" },
  { "dia": "Lunes", "inicio": "12:00", "fin": "13:00", "materia": "Programacion Web", "aula": "101", "profesor": "Delgado Chan Kelvin Del Jesus" },
  { "dia": "Martes", "inicio": "07:00", "fin": "09:00", "materia": "Programacion Web", "aula": "CCOM", "profesor": "Delgado Chan Kelvin Del Jesus" },
  { "dia": "Martes", "inicio": "09:00", "fin": "11:00", "materia": "Ingenieria De Software", "aula": "101", "profesor": "Diaz Rosado Martina" },
  { "dia": "Martes", "inicio": "11:00", "fin": "12:00", "materia": "Programa Institucional De Tutorías - 6", "aula": "101", "profesor": "Wicab Camara Guadalupe Nicte-Ha" },
  { "dia": "Martes", "inicio": "12:00", "fin": "14:00", "materia": "Administracion De Base De Datos", "aula": "101", "profesor": "Villasis Santos Roger Argenis" },
  { "dia": "Martes", "inicio": "14:00", "fin": "16:00", "materia": "Redes De Computadora", "aula": "LRED", "profesor": "Coyoc Uc Carmen Candelaria" },
  { "dia": "Miércoles", "inicio": "07:00", "fin": "08:00", "materia": "Lenguajes Y Automatas I", "aula": "101", "profesor": "Villasis Santos Roger Argenis" },
  { "dia": "Miércoles", "inicio": "08:00", "fin": "09:00", "materia": "Redes De Computadora", "aula": "101", "profesor": "Coyoc Uc Carmen Candelaria" },
  { "dia": "Miércoles", "inicio": "09:00", "fin": "11:00", "materia": "Administracion De Base De Datos", "aula": "CCOM", "profesor": "Villasis Santos Roger Argenis" },
  { "dia": "Miércoles", "inicio": "11:00", "fin": "12:00", "materia": "Taller De Sistemas Operativos", "aula": "101", "profesor": "Delgado Chan Kelvin Del Jesus" },
  { "dia": "Miércoles", "inicio": "12:00", "fin": "13:00", "materia": "Ingenieria De Software", "aula": "101", "profesor": "Diaz Rosado Martina" },
  { "dia": "Jueves", "inicio": "07:00", "fin": "09:00", "materia": "Redes De Computadora", "aula": "101", "profesor": "Coyoc Uc Carmen Candelaria" },
  { "dia": "Jueves", "inicio": "09:00", "fin": "11:00", "materia": "Lenguajes Y Automatas I", "aula": "CCOM", "profesor": "Villasis Santos Roger Argenis" },
  { "dia": "Jueves", "inicio": "11:00", "fin": "13:00", "materia": "Lenguajes De Interfaz", "aula": "101", "profesor": "Villasis Santos Roger Argenis" },
  { "dia": "Viernes", "inicio": "07:00", "fin": "10:00", "materia": "Taller De Sistemas Operativos", "aula": "101", "profesor": "Delgado Chan Kelvin Del Jesus" },
  { "dia": "Viernes", "inicio": "10:00", "fin": "12:00", "materia": "Ingenieria De Software", "aula": "101", "profesor": "Diaz Rosado Martina" },
  { "dia": "Viernes", "inicio": "12:00", "fin": "14:00", "materia": "Programacion Web", "aula": "101", "profesor": "Delgado Chan Kelvin Del Jesus" },
  { "dia": "Viernes", "inicio": "23:15", "fin": "23:30", "materia": "Prueba de Materia", "aula": "101", "profesor": "Profesor Especial" }
];

// Colores para materias
const colores = ["#ff9999", "#99ccff", "#99ff99", "#ffcc99", "#ffb3e6", "#ffd699", "#b3ffff", "#d9b3ff"];

// Cargar recordatorios y notas desde archivo
let data = cargarDatos();
let recordatorios = data.recordatorios;
let notas = data.notas;

// Obtener día de la semana en español
function getDiaSemana() {
  const dias = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  return dias[new Date().getDay()];
}

// Página principal
app.get("/", (req, res) => {
  const diaHoy = getDiaSemana();
  const clasesHoy = horario.filter(h => h.dia === diaHoy);

  const contenedores = clasesHoy.map((h,i) => `
    <div class="materia" style="background:${colores[i % colores.length]}">
      <h3>${h.materia}</h3>
      <p><b>Hora:</b> ${h.inicio} - ${h.fin}</p>
      <p><b>Aula:</b> ${h.aula}</p>
      <p><b>Profesor:</b> ${h.profesor}</p>
    </div>
  `).join("");

  const listaMaterias = [...new Set(horario.map(h => h.materia))].map(m => `<option value="${m}">${m}</option>`).join("");

  const listaRecordatorios = recordatorios.map(r => `
    <div style="padding:5px; margin:5px 0; border-radius:5px; color:white; background:${r.estado==="pendiente" ? "#dc3545" : "#28a745"}">
      ${r.estado==="pendiente" ? "⏳ Recordatorio pendiente" : "✅ Recordatorio enviado"}: ${r.materia} - ${new Date(r.fecha).toLocaleString()} - ${r.mensaje}
    </div>
  `).join("");

  const listaNotas = notas.map(n => `
    <div style="padding:5px; margin:5px 0; border-radius:5px; background:#ffc107; color:#333; display:flex; justify-content:space-between; align-items:center;">
      <span>${n.texto}</span>
      <form method="POST" action="/eliminarnota" style="margin:0;">
        <input type="hidden" name="id" value="${n.id}" />
        <button type="submit" style="background:#dc3545; color:white; border:none; border-radius:5px; padding:2px 5px; cursor:pointer;">Eliminar</button>
      </form>
    </div>
  `).join("");

  res.send(`
    <html>
      <head>
        <title>Horario, Recordatorios y Notas</title>
        <style>
          body { font-family: Arial; background: #f0f0f0; padding: 20px; }
          h1, h2 { text-align: center; }
          .container { max-width: 900px; margin: auto; background: #fff; padding: 20px; border-radius: 10px; }
          .horario { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
          .materia { flex: 1 1 200px; padding: 15px; border-radius: 10px; text-align: center; color: #333; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
          form { display: flex; flex-direction: column; gap: 10px; }
          select, input { padding: 10px; border-radius: 5px; border: 1px solid #ccc; }
          button { padding: 10px; border: none; border-radius: 5px; cursor: pointer; }
          button:hover { opacity:0.9; }
        </style>
      </head>
      <body>
        <h1>Horario de Hoy (${diaHoy})</h1>
        <div class="container">
          <div class="horario">${contenedores || "<p>No tienes clases hoy</p>"}</div>

          <h2>Programar Recordatorio</h2>
          <form method="POST" action="/programar">
            <label>Selecciona Materia:</label>
            <select name="materia">${listaMaterias}</select>
            <label>Mensaje:</label>
            <input type="text" name="mensaje" placeholder="Escribe tu recordatorio" required />
            <label>Fecha y Hora:</label>
            <input type="datetime-local" name="fechaHora" required />
            <button type="submit" style="background:#28a745; color:white;">Programar Recordatorio</button>
          </form>

          <h2>Recordatorios</h2>
          <div>${listaRecordatorios || "<p>No hay recordatorios programados</p>"}</div>

          <h2>Notas Pendientes</h2>
          <form method="POST" action="/agregarnota">
            <input type="text" name="texto" placeholder="Escribe tu nota" required/>
            <button type="submit" style="background:#ffc107;">Agregar Nota</button>
          </form>
          <div>${listaNotas || "<p>No hay notas pendientes</p>"}</div>
        </div>
      </body>
    </html>
  `);
});

// Programar recordatorio
app.post("/programar", (req,res)=>{
  const {materia, mensaje, fechaHora} = req.body;

  if(!chatId) return res.send("Primero inicia conversación con el bot en Telegram.");

  const fecha = new Date(fechaHora);
  const now = new Date();
  if(fecha <= now) return res.send("❌ La fecha y hora deben ser futuras");

  const recordatorio = { materia, mensaje, fecha, estado: "pendiente" };
  recordatorios.push(recordatorio);
  guardarDatos();

  const segundos = (fecha.getTime() - now.getTime()) / 1000;

  setTimeout(() => {
    bot.sendMessage(chatId, `📌 Recordatorio Programado: ${materia}\n${mensaje}`);
    recordatorio.estado = "enviado"; // cambiar estado a enviado
    guardarDatos();
  }, segundos*1000);

  res.redirect("/");
});

// Agregar nota desde la web
app.post("/agregarnota", (req,res)=>{
  const {texto} = req.body;
  const id = Date.now();
  notas.push({id, texto});
  guardarDatos();
  if(chatId) bot.sendMessage(chatId, `📝 Nota agregada desde la web: ${texto}`);
  res.redirect("/");
});

// Eliminar nota desde la web
app.post("/eliminarnota", (req,res)=>{
  const {id} = req.body;
  notas = notas.filter(n => n.id != id);
  guardarDatos();
  res.redirect("/");
});

// Guardar chatId al iniciar conversación
bot.on("message", msg=>{
  chatId = msg.chat.id;
  bot.sendMessage(chatId,"¡Hola! Ahora puedes programar recordatorios y notas.\n\nPara notas:\n- /notanueva Texto de la nota → agregar nota\n- /notasp → ver y eliminar notas");
});

// Notas: agregar desde Telegram
bot.onText(/\/notanueva (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const texto = match[1];
  const id = Date.now();
  notas.push({ id, texto });
  guardarDatos();
  bot.sendMessage(chatId, `📝 Nota agregada: ${texto}`);
});

// Notas: mostrar y eliminar desde Telegram
bot.onText(/\/notasp/, (msg) => {
  const chatId = msg.chat.id;
  if (notas.length === 0) {
    bot.sendMessage(chatId, "✅ No tienes notas pendientes.");
    return;
  }

  notas.forEach(nota => {
    bot.sendMessage(chatId, `📝 ${nota.texto}`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Eliminar 🗑️", callback_data: `eliminar_${nota.id}` }
          ]
        ]
      }
    });
  });
});

// Manejar botón de eliminar nota Telegram
bot.on("callback_query", (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;

  if (data.startsWith("eliminar_")) {
    const id = parseInt(data.split("_")[1]);
    notas = notas.filter(n => n.id !== id);
    guardarDatos();
    bot.editMessageText("✅ Nota eliminada.", {
      chat_id: msg.chat.id,
      message_id: msg.message_id
    });
  }
});

// Iniciar servidor
app.listen(3000, ()=>console.log("Servidor iniciado en http://localhost:3000"));
