const map = L.map('map').setView([51.54, -0.09], 14);


const socket = new WebSocket('ws://localhost:3000');
let lStatus = 'all'
const markers = []
socket.onopen = (event) =>{
    console.log("socket connected")
}

socket.onclose = (event) =>{
    console.log("soceket connection closed")
}
socket.onerror = (event) =>{
    console.log("socket error")
}

socket.addEventListener('message', (message)=>{
    const {event, payload} = JSON.parse(message.data)
    liveStatus(lStatus)
    markers.forEach(m=>{
      const car = payload.vehicles.find(i=> i.id === m.id)
      m.marker.setLatLng([car.latitude, car.longitude])
      m.marker.getTooltip().setContent(car.status).update();
    })

})



 function liveStatus(status = 'all'){
  if(status === 'all') itemFilterForAll()
  if(status === 'moving') itemFilterForMoving()
  if(status === 'idle') itemFilterForIdle()
}



const all = document.getElementById('all')
const moving = document.getElementById('moving')
const idle = document.getElementById('idle')
const list = document.getElementById('list')

all.addEventListener('click', itemFilterForAll)
moving.addEventListener('click', itemFilterForMoving)
idle.addEventListener('click', itemFilterForIdle)


function itemFilterForMoving(){
  console.log('moving check');
  lStatus = 'moving'
  markers.forEach(m=>{
    const moving = m.marker.getTooltip()._content
    console.log('moving status', moving);
    if(moving !== 'moving'){
      map.removeLayer(m.marker)
    }else{
      map.addLayer(m.marker)
    }
  })
}
function itemFilterForIdle(){
  console.log('idle checked');
  lStatus = 'idle'

  markers.forEach(m=>{
    const idle = m.marker.getTooltip()._content
    if(idle !== 'idle'){
      map.removeLayer(m.marker)
    }else{
      map.addLayer(m.marker)
    }
  })
}
function itemFilterForAll(){
  lStatus = 'all'

  markers.forEach(m=>{
      map.addLayer(m.marker)
  })
}

function updateMarkers() {
  fetch('http://localhost:3000/api/vehicles')
    .then((response) => response.json())
    .then((data) => {
      maps(data)
      
    });
}

  updateMarkers();
  



var carIcon = L.icon({
    iconUrl: 'car.png',
    // shadowUrl: 'car.png',

    iconSize:     [38, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});



function maps(vehicss) {
  

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function markerLabel(vehicle, statusLabel, lat, lng) {
  return L.marker([lat , lng ],{icon: carIcon}).addTo(map).bindTooltip(statusLabel, { permanent: true, direction: 'top', className: 'status-label' ,offset: [0, -90]});;
}

function vehiclesLooping(vehicles) {
// let markers = []
vehicles.forEach(vehicle => {
 const marker = markerLabel(vehicle, vehicle.status, vehicle.latitude, vehicle.longitude)
 markers.push({id: vehicle.id, marker})
//  marker.setLatLng([vehicle.latitude, vehicle.longitude]);
//  markers.push(marker)
  });
  // markers.forEach((m, i)=>{
  //   let deleteItem = [0,1]
  //   if(deleteItem.includes(i)){
  //     m.remove()
  //   }
  // })
}

vehiclesLooping(vehicss)

}

  

  




