const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


// Mock vehicle data
let vehicles = [];

// Function to generate random latitude and longitude
function getRandomCoordinates() {
  const latitude = (Math.random() - 0.5) * 0.01;
  const longitude = (Math.random() - 0.5) * 0.01;
  return { latitude, longitude };
}

// Function to update vehicle status
// function updateVehicleStatus(vehicle) {
//   const newCoordinates = getRandomCoordinates();
//   vehicle.latitude = newCoordinates.latitude;
//   vehicle.longitude = newCoordinates.longitude;
//   vehicle.status = 'moving';
//   setTimeout(() => {
//     vehicle.status = 'idle';
//   }, 3000); // Set the status to idle after 3 seconds
// }

const vehicleList = [
  { id: 1, lat: 51.54, lng: -0.09, status: 'moving' },
  { id: 2, lat: 51.51, lng: -0.1, status: 'moving' },
  { id: 3, lat: 51.52, lng: -0.2, status: 'moving' },
  { id: 4, lat: 51.57, lng: -0.3, status: 'moving' }
];

for (const vehicle of vehicleList) {
  const vehi = {
    id: vehicle.id,
    latitude:  vehicle.lat,
    longitude: vehicle.lng,
    status: vehicle.status,
  };
  vehicles.push(vehi);
}

function updateRandomStatus(){
  vehicles.forEach(i=>{
    if(Math.random() > 0.5){
      i.status = 'idle'
    }else{
      i.status = 'moving'
    }
  })
}

function updateLatLng(vehicles){
  vehicles.forEach((i)=>{
    if(i.status === 'idle') {
      return
    }
    i.latitude -= 0.0010
    i.longitude -= 0.0010
  })
}

setInterval(() => {
  updateRandomStatus()
}, 10000);

setInterval(() => {
  updateLatLng(vehicles)
}, 2000);

console.log(vehicles)

// API endpoint to get vehicle data
app.get('/api/vehicles', (req, res) => {
  res.json(vehicles);
});


wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    
    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if ( client.readyState === WebSocket.OPEN) {
        client.send('this message from backend');
      }
    });
  });

  setInterval(() => {
    wss.clients.forEach((client) => {
      if ( client.readyState === WebSocket.OPEN) {
        const data = JSON.stringify({event: 'LATLNG_EVENT', payload: {vehicles}})
        client.send(data);
      }
    });
  }, 2000);

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3008;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
