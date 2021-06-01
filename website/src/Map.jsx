// Credit to tutorial from Youtube for the lines of code related to legend
// This is their git:  https://github.com/CodingWith-Adam/covid19-map
// Made modifications on their custom legend

import React, { Component } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import "./Map.css";
import history from "./history";  // to redirect back to home
import districts from "./Uganda-districts.json";
import Legend from "./Legend.jsx";  // Credit
import legendItems from "./LegendItems.js";  // Credit

const legendItemsReverse = [...legendItems].reverse();  // Credit

class Map extends Component {

    districtStyle = {
        fillColor: '#FF4500',
        opacity: 0.7,
        color: "black",
    };

    onEachDistrict = (district, layer) => {
        let districtName = district.properties["2016"]
        let districtClone = districtName;
        const jsonData = this.props.location.state.jsonData;
        let priority = 0;
        let numCount = 0;

        for (let i = 0; i < Object.keys(jsonData).length; i++) {
            // Fixing typos from H.I.S. data
            if(jsonData[i].DISTRICT === "ALEPTONG") {
                jsonData[i].DISTRICT = "ALEBTONG";
            }
            if(jsonData[i].DISTRICT === "NAMAINGO") {
                jsonData[i].DISTRICT = "NAMAYINGO";
            }
            if(jsonData[i].DISTRICT === districtName) {
                districtName += " <br> Priority: " + jsonData[i].PRIORITY + " <br> Vaccines to give: "
                 + Math.floor(jsonData[i].NUM_VACCINE);
                priority = jsonData[i].PRIORITY;
                numCount = jsonData[i].NUM_VACCINE;
                if(numCount > 0) {
                    layer.options.color = "black";
                    layer.options.weight = 8;
                }
            }
        }

        layer.bindPopup(districtName);
        layer.options.fillOpacity = 0.7;
        layer.options.fillColor = priority === 5 ? '#CA0B00' :
                                                 priority === 4  ? '#FF4500	' :
                                                 priority === 3  ? '#FFA500' :
                                                 priority === 2  ? '#FF5733' :
                                                 priority === 1  ? '#FFC300' :
                                                 '#000000';
    }

    // Handles when back button is pressed
    // Redirects to home page
    goBack() {
        history.push("/");
    }

      render() {
        return (
            <div>
                <h1 id="app-title"> Uganda Vaccine Allocation </h1>
                <button id="submit-button" onClick={this.goBack}> Plan More!</button>
                <MapContainer center={[1.347532, 32.510201]} zoom={7} scrollWheelZoom={true}>
                    <Legend legendItems={legendItemsReverse} />
                    <GeoJSON style={this.districtStyle} data={districts.features} onEachFeature={this.onEachDistrict} />
                </MapContainer>
            </div>
        );
      }
    }

export default Map;