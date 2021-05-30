import React, { Component } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import "./Map.css";
import districts from "./Uganda-districts.json";


class Map extends Component {

onEachDistrict = (district, layer) =>{
    const districtName = district.properties["2016"]
    console.log(district);
    layer.bindPopup(districtName);
}

  render() {
  console.log(districts)
    return (
//       <MapContainer center={[1.347532, 32.510201]} zoom={13} scrollWheelZoom={true}>
//         <TileLayer
//           attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
//         <Marker position={[1.347532, 32.510201]}>
//           <Popup>
//             A pretty CSS3 popup. <br /> Easily customizable.
//           </Popup>
//         </Marker>
//       </MapContainer>

<MapContainer center={[1.347532, 32.510201]} zoom={7} scrollWheelZoom={true}>
<GeoJSON data={districts.features} onEachFeature={this.onEachDistrict} />
</MapContainer>
    );
  }
}

export default Map;