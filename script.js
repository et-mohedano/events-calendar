let events = [];

/* Variables para controlar el mes a visualizar */
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth(); // 0-indexado

/* Actualiza la lista de eventos (tarjetas) y redibuja el calendario mensual */
function updateEventList() {
  const eventList = document.getElementById('eventList');
  eventList.innerHTML = '';
  if (events.length === 0) {
    eventList.innerHTML = '<p>No hay eventos programados.</p>';
  } else {
    events.forEach((ev, index) => {
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card';
      eventCard.setAttribute('data-index', index);
      
      const eventInfo = document.createElement('div');
      eventInfo.className = 'event-info';
      eventInfo.innerHTML = `<div><strong>Fecha:</strong> ${ev.date}</div>
                             <div><strong>Evento:</strong> ${ev.name}</div>`;
      
      const eventActions = document.createElement('div');
      eventActions.className = 'event-actions';
      
      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.textContent = 'Editar';
      editBtn.addEventListener('click', () => editEvent(index));
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Eliminar';
      deleteBtn.addEventListener('click', () => deleteEvent(index));
      
      eventActions.appendChild(editBtn);
      eventActions.appendChild(deleteBtn);
      
      eventCard.appendChild(eventInfo);
      eventCard.appendChild(eventActions);
      
      eventList.appendChild(eventCard);
    });
  }
  drawMonthCalendar(); // Redibuja el calendario mensual cada vez que se actualiza la lista
}

/* Manejo del formulario para agregar eventos */
document.getElementById('eventForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('eventName').value;
  const date = document.getElementById('eventDate').value;
  events.push({ name, date });
  updateEventList();
  e.target.reset();
});

/* Edición inline de eventos */
function editEvent(index) {
  const eventList = document.getElementById('eventList');
  const eventCard = eventList.querySelector(`.event-card[data-index='${index}']`);
  
  // Reemplaza el contenido por un formulario de edición
  eventCard.innerHTML = '';
  const editForm = document.createElement('form');
  editForm.innerHTML = `
    <input type="text" name="editName" value="${events[index].name}" required>
    <input type="date" name="editDate" value="${events[index].date}" required>
    <button type="submit" class="save-btn">Guardar</button>
    <button type="button" class="cancel-btn">Cancelar</button>
  `;
  
  editForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const newName = editForm.editName.value;
    const newDate = editForm.editDate.value;
    events[index] = { name: newName, date: newDate };
    updateEventList();
  });
  
  editForm.querySelector('.cancel-btn').addEventListener('click', function() {
    updateEventList();
  });
  
  eventCard.appendChild(editForm);
}

/* Eliminar un evento */
function deleteEvent(index) {
  events.splice(index, 1);
  updateEventList();
}

/* Descargar la configuración en JSON */
document.getElementById('downloadJSON').addEventListener('click', function() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "calendario.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
});

/* Importar configuración desde un archivo JSON */
document.getElementById('importJSON').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedEvents = JSON.parse(e.target.result);
      if (Array.isArray(importedEvents)) {
        events = importedEvents;
        updateEventList();
      } else {
        alert("El archivo JSON no tiene el formato correcto.");
      }
    } catch (error) {
      alert("Error al leer el archivo JSON.");
    }
  };
  reader.readAsText(file);
});

/* Descargar el build para embeber el calendario */
document.getElementById('downloadHTML').addEventListener('click', function() {
  const embedHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Calendario Embebido</title>
  <style>
    body {
      font-family: "Poppins", serif;
      margin: 0;
      padding: 20px;
      background: #f0f0f0;
    }
    .calendar-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 20px 0;
    }
    .calendar-nav button {
      padding: 5px 10px;
      font-size: 1.2em;
      cursor: pointer;
      background: #007BFF;
      color: #fff;
      border: none;
      border-radius: 4px;
    }
    #currentMonthYear {
      margin: 0 15px;
      font-weight: 500;
      font-size: 1.1em;
    }
    .calendar-view {
      margin-top: 20px;
      overflow-x: auto;
    }
    .calendar-view ul {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      list-style: none;
      padding: 0;
      margin: 0;
      gap: 0.5rem;
    }
    .calendar-view ul li {
      display: flex;
      flex-direction: column;
      aspect-ratio: 1;
      padding: 1rem;
      font-weight: 300;
      font-size: 0.8rem;
      box-sizing: border-box;
      background: rgba(255, 255, 255, 0.25);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.18);
    }
    .calendar-view ul li time {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    .calendar-view ul li.today {
      background: #ffffff70;
    }
    .calendar-view ul li.today time {
      font-weight: 800;
    }
  </style>
</head>
<body>
  <div id="calendarEmbed">
    <div class="calendar-nav">
      <button id="prevMonth">&#9664;</button>
      <span id="currentMonthYear"></span>
      <button id="nextMonth">&#9654;</button>
    </div>
    <div class="calendar-view" id="calendarView"></div>
  </div>
  <script>
    (function(){
      var events = ${JSON.stringify(events, null, 2)};
      var currentDate = new Date();
      var currentYear = currentDate.getFullYear();
      var currentMonth = currentDate.getMonth();
      function drawMonthCalendar() {
        var calendarView = document.getElementById('calendarView');
        calendarView.innerHTML = '';
        var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        var monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
        document.getElementById('currentMonthYear').textContent = monthNames[currentMonth] + " " + currentYear;
        var ul = document.createElement('ul');
        for (var day = 1; day <= daysInMonth; day++) {
          var li = document.createElement('li');
          var dayStr = day < 10 ? '0' + day : day;
          var monthStr = (currentMonth + 1) < 10 ? '0' + (currentMonth + 1) : (currentMonth + 1);
          var dateStr = currentYear + '-' + monthStr + '-' + dayStr;
          var timeEl = document.createElement('time');
          timeEl.textContent = day;
          li.appendChild(timeEl);
          var dayEvents = events.filter(function(ev){ return ev.date === dateStr; });
          if(dayEvents.length > 0){
            var eventsDiv = document.createElement('div');
            dayEvents.forEach(function(ev){
              var eventP = document.createElement('p');
              eventP.textContent = ev.name;
              eventsDiv.appendChild(eventP);
            });
            li.appendChild(eventsDiv);
          }
          ul.appendChild(li);
        }
        calendarView.appendChild(ul);
      }
      document.getElementById('prevMonth').addEventListener('click', function(){
        if(currentMonth === 0){
          currentMonth = 11;
          currentYear--;
        } else {
          currentMonth--;
        }
        drawMonthCalendar();
      });
      document.getElementById('nextMonth').addEventListener('click', function(){
        if(currentMonth === 11){
          currentMonth = 0;
          currentYear++;
        } else {
          currentMonth++;
        }
        drawMonthCalendar();
      });
      drawMonthCalendar();
    })();
  </script>
</body>
</html>
  `;
  const dataStr = "data:text/html;charset=utf-8," + encodeURIComponent(embedHTML);
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "calendario_embed_build.html");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
});

/* Función para dibujar el calendario mensual en la vista principal */
function drawMonthCalendar() {
  const calendarView = document.getElementById('calendarView');
  calendarView.innerHTML = ''; // Limpia el calendario previo

  // Número de días del mes actual (currentMonth y currentYear)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Actualiza el encabezado con el mes y año actual
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  document.getElementById('currentMonthYear').textContent = `${monthNames[currentMonth]} ${currentYear}`;

  // Crea el elemento <ul> para el calendario
  const ul = document.createElement('ul');

  // Genera cada día del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const li = document.createElement('li');

    // Formatea la fecha en "YYYY-MM-DD"
    const dayStr = day < 10 ? '0' + day : day;
    const monthStr = (currentMonth + 1) < 10 ? '0' + (currentMonth + 1) : (currentMonth + 1);
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

    // Crea el elemento <time> con el número del día
    const timeEl = document.createElement('time');
    timeEl.textContent = day;
    li.appendChild(timeEl);

    // Si es el día de hoy y coincide con el mes y año actual, añade la clase "today"
    const today = new Date();
    if (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    ) {
      li.classList.add('today');
    }

    // Busca eventos que correspondan a esta fecha
    const dayEvents = events.filter(ev => ev.date === dateStr);
    if (dayEvents.length > 0) {
      const eventsDiv = document.createElement('div');
      dayEvents.forEach(ev => {
        const eventP = document.createElement('p');
        eventP.textContent = ev.name;
        eventsDiv.appendChild(eventP);
      });
      li.appendChild(eventsDiv);
    }

    ul.appendChild(li);
  }

  calendarView.appendChild(ul);
}

/* Funciones para la navegación del calendario */
document.getElementById('prevMonth').addEventListener('click', function() {
  if (currentMonth === 0) {
    currentMonth = 11;
    currentYear--;
  } else {
    currentMonth--;
  }
  drawMonthCalendar();
});

document.getElementById('nextMonth').addEventListener('click', function() {
  if (currentMonth === 11) {
    currentMonth = 0;
    currentYear++;
  } else {
    currentMonth++;
  }
  drawMonthCalendar();
});

// Renderiza la vista inicial
updateEventList();
