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

const vehicleList = [
  { id: 1, lat: 51.55, lng: -0.09, status: 'moving' },
  { id: 2, lat: 51.54, lng: -0.10, status: 'moving' },
  { id: 3, lat: 51.54, lng: -0.08, status: 'moving' },
  { id: 4, lat: 51.53, lng: -0.010, status: 'moving' },
  { id: 5, lat: 51.53, lng: -0.10, status: 'moving' }
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
