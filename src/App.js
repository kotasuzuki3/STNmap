import React, {Component} from "react";
import "./App.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import leafGreen from './assets/leaf-green.png';
import leafShadow from './assets/leaf-shadow.png';


class App extends Component {
  state = {
    greenIcon: {
      lat:35.787449,
      lng:-78.6438197
    },
    zoom: 13
  }
  greenIcon = L.icon({
    iconUrl: leafGreen,
    shadowUrl: leafShadow,
    iconSize: [38,95],
    shadowSize: [50,64],
    iconAnchor: [22,94],
    shadowAnchor: [4,62],
    popupAnchor:[-3,-76]
  });
  render() {
    const positionGreenIcon = [this.state.greenIcon.lat, this.state.greenIcon.lng];
    return (
      <MapContainer className = "map" center={positionGreenIcon} zoom={this.state.zoom}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={positionGreenIcon} icon={this.greenIcon}>
          <Popup>
            I am a green leaf
          </Popup>
        </Marker>
      </MapContainer>
    );
  }
}

export default App;
