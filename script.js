let lStatus = 'all';
const markers = [];
const map = L.map('map').setView([51.54, -0.09], 12);

//websocket
const socket = new WebSocket('ws://localhost:3008');
const list = document.getElementById('list');

socket.onopen = event => {
  console.log('socket connected');
};

socket.onclose = event => {
  console.log('soceket connection closed');
};
socket.onerror = event => {
  console.log('socket error');
};

//receiving vehicle data from socket
socket.addEventListener('message', message => {
  const { event, payload } = JSON.parse(message.data);
  liveStatus(lStatus);
  markers.forEach(m => {
    const car = payload.vehicles.find(i => i.id === m.id);
    m.marker.setLatLng([car.latitude, car.longitude]);
    m.marker.getTooltip().setContent(`${car.status} (${m.id})`).update();
  });
  removeList(payload.vehicles)
  updateList(payload.vehicles)

});

//filter by live status
function liveStatus(status = 'all') {
  if (status === 'all') itemFilterForAll();
  if (status === 'moving') itemFilterForMoving();
  if (status === 'idle') itemFilterForIdle();
}

const all = document.getElementById('all');
const moving = document.getElementById('moving');
const idle = document.getElementById('idle');


all.addEventListener('click', itemFilterForAll);
moving.addEventListener('click', itemFilterForMoving);
idle.addEventListener('click', itemFilterForIdle);

//creating list of vehicles 
function appendListElement(id, status){
const list = document.getElementById('list');
  const li = document.createElement('li')
  const h2 = document.createElement('h2')
  const div = document.createElement('div')
  const span = document.createElement('span')

  li.classList.add('tracking', 'tracking--running')
  h2.classList.add('tracking__title')
  div.classList.add('tracking__details')
  span.classList.add('tracking__unit')

  h2.textContent = `vehicle #${id}`
  span.textContent = status

  div.append(span)
  li.append(h2)
  li.append(div)
  list.appendChild(li)
}

//removing previous list for showing latest list
function removeList(vehicles){
  for (let i = 0; i <= vehicles.length; i++) {
    if(list.firstChild){
      list.firstChild.remove() 
    }
  }
}

//updating status to the list
function updateList(vehicles){
  vehicles.map(m=>{
    const id = m.id
    const status = m.status;
    appendListElement(id, status) //appending with id and status
  })
}

//filter for moving
function itemFilterForMoving() {
  console.log('moving check');
  lStatus = 'moving';
  markers.forEach(m => {
    const moving = m.marker.getTooltip()._content;
    console.log('moving status', moving);
    if (moving !== 'moving') {
      map.removeLayer(m.marker);
    } else {
      map.addLayer(m.marker);
    }
  });
}

//filter for idle
function itemFilterForIdle() {
  console.log('idle checked');
  lStatus = 'idle';

  markers.forEach(m => {
    const idle = m.marker.getTooltip()._content;
    if (idle !== 'idle') {
      map.removeLayer(m.marker);
    } else {
      map.addLayer(m.marker);
    }
  });
}

//filter for all
function itemFilterForAll() {
  lStatus = 'all';

  markers.forEach(m => {
    map.addLayer(m.marker);
  });
}

//fetching vehicle data from server 
function fetchVehiclesInfo() {
  fetch('http://localhost:3008/api/vehicles') //later connect original api endpoint
    .then(response => response.json())
    .then(data => {
      maps(data);
    });
}

fetchVehiclesInfo();

var carIcon = L.icon({
  iconUrl: 'car.png',
  iconSize: [38, 50], // size of the icon
  shadowSize: [50, 64],
  iconAnchor: [22, 94],
  shadowAnchor: [4, 62],
  popupAnchor: [-3, -76],
});

//rendering map with vehicle coordinates and marker
function maps(vehicss) {
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  function markerLabel(vehicle, statusLabel, lat, lng) {
    return L.marker([lat, lng], { icon: carIcon })
      .addTo(map)
      .bindTooltip(statusLabel, {
        permanent: true,
        direction: 'top',
        className: 'status-label',
        offset: [0, -90],
      });
  }

  //initial vehicles marker appending
  function vehiclesLooping(vehicles) {
    vehicles.forEach(vehicle => {
      const marker = markerLabel(
        vehicle,
       `${vehicle.status} (${vehicle.id})`,
        vehicle.latitude,
        vehicle.longitude
      );
      markers.push({ id: vehicle.id, marker });
    });
  }

  vehiclesLooping(vehicss);
}
