import React, { Component } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import "./Map.css";
import districts from "./Uganda-districts.json";

class Map extends Component {

    componentDidMount() {
        // take out console.log, just wanted to make sure json is passed
        console.log(Object.keys(this.props.location.state.jsonData).length);
    }


 districtStyle = {
        fillColor: '#FF4500',
        opacity: 0.7,
        color: "black",
    };

    onEachDistrict = (district, layer) =>{
        let districtName = district.properties["2016"]
        let districtClone = districtName;
        const jsonData = this.props.location.state.jsonData;
        //console.log(typeof jsonData);
        //console.log(jsonData[1].PRIORITY);
        //console.log(jsonData.length);
        let priority = 0;
        for (let i = 0; i < 128; i++) {
            if(jsonData[i].DISTRICT === districtName) {
                districtName += " <br> Priority: " + jsonData[i].PRIORITY + " <br> Vaccines to give: "
                 + Math.floor(jsonData[i].NUM_VACCINE);
                priority = jsonData[i].PRIORITY;
            }
        }

        layer.bindPopup(districtName);
        layer.options.fillOpacity = 0.7;
        layer.options.fillColor = priority === 5 ? '#CA0B00' :
                                                 priority === 4  ? '#FF4500	' :
                                                 priority === 3  ? '#ffa500' :
                                                 priority === 2  ? '#FF5733' :
                                                 priority === 1  ? '#FFC300' :
                                                 '#000000';
        if(districtClone === "NOYA" || districtClone === "NEBBI" || districtClone === "KITGUM") {
                layer.options.fillColor = '#900C3F';
                }
    }

      render() {
      //console.log(districts)
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
    <div>
    <h1 style={{textAlign: "center"}}> Uganda Vaccine Allocation </h1>
    <MapContainer center={[1.347532, 32.510201]} zoom={7} scrollWheelZoom={true}>
    <GeoJSON style={this.districtStyle} data={districts.features} onEachFeature={this.onEachDistrict} />
    </MapContainer>
    </div>
        );
      }
    }

export default Map;