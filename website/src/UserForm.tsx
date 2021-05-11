/*
 * Credit to Spring 2020 CSE 331 server material, main site for user
 * input on a form
 */

import React, {Component} from 'react';
import "./UserForm.css";

// The props of this form
interface UserFormProps {
    width: number;   // width of the canvas
    height: number;  // height of the canvas
}

interface UserFormState {
    backgroundImage: HTMLImageElement | null,
    countries: string[]  // list of countries
    districts: string[]  // list of districts (for a country)
    checkedDistricts: Map<String, boolean>  // mapping of campaigned districts
    countryValue: string  // the targeted country
    vaccineCount: number | string,  // number of vaccines (saved as number)
    covidFile: File | null,
    generalFile: File | null,
}

class UserForm extends Component<UserFormProps, UserFormState> {

    // NOTE:
    // This component is a suggestion for you to use, if you would like to.
    // It has some skeleton code that helps set up some of the more difficult parts
    // of getting <canvas> elements to display nicely with large images.
    //
    // If you don't want to use this component, you're free to delete it.

    canvas: React.RefObject<HTMLCanvasElement>;

    constructor(props: UserFormProps) {
        super(props);
        this.state = {
            backgroundImage: null,
            countries: [],  // list of all the countries (populate it when loaded)
            districts: [],  // list of districts for a country
            checkedDistricts: new Map(),
            countryValue: "Choose a Country", // choose a country
            vaccineCount: "",  // value on user input; placeholder
            covidFile: null,  // given by user
            generalFile: null,  // given by user
        };
        this.canvas = React.createRef();
    }

    componentDidMount() {
        this.fetchAndSaveImage();
        this.fetchCountryDropList();
        this.drawBackgroundImage();
        this.redraw();
    }

    componentDidUpdate() {
        this.drawBackgroundImage();
        this.redraw();
    }

    // redraws/refreshes visuals on screen (add other methods here like
    // updating list of districts)
    redraw() {
        if (this.canvas.current === null) {
            throw new Error("Unable to access canvas.");
        }
        const ctx = this.canvas.current.getContext('2d');
        if (ctx === null) {
            throw new Error("Unable to create canvas drawing context.");
        }

        ctx.clearRect(0, 0, this.props.width, this.props.height);
        // Once the image is done loading, it'll be saved inside our state.
        // Otherwise, we can't draw the image, so skip it.
        if (this.state.backgroundImage !== null) {
            // uncomment when we have a background image, if any
            //ctx.drawImage(this.state.backgroundImage, 0, 0);
        }
        this.fetchDistricts(this.state.countryValue);
    }

    // Creates drop-down list of countries from the server data
    fetchCountryDropList() {
        // Get the JSON info from server on countries, sorted alphabetically
        fetch("http://localhost:4567/countries")
            .then((res) => {
                return res.json();
            })
            // Save the country info
            .then(data => {
                this.setState({
                    countries: data.sort()
                })
            });
    }

    // Fetches districts based on country select
    fetchDistricts(countryValue : string) {
        // Get the JSON info from server on districts, sorted alphabetically
        // if country has been selected
        if (countryValue !== "Choose a Country") {
            if (countryValue === "Uganda") {
                fetch("http://localhost:8080/districts")
                    .then((res) => {
                        return res.json();
                    })
                    // Parse and save the districts from JSON into an array
                    .then(data => {
                        let districts = data.District;
                        var districtsArr = [];
                        for (let i = 0; i < Object.keys(districts).length; i++) {
                            districtsArr.push(districts[i]);
                        }
                        this.setState({
                            districts: districtsArr,
                        })
                    });
            } else {
                fetch("http://localhost:4567/" + countryValue + "-districts")
                    .then((res) => {
                        return res.json();
                    })
                    // Save the districts
                    .then(data => {
                        this.setState({
                            districts: data
                        })
                    });
            }
        }
    }

    fetchAndSaveImage() {
        // Creates an Image object, and sets a callback function
        // for when the image is done loading (it might take a while).
        let background: HTMLImageElement = new Image();
        background.onload = () => {
            this.setState({
                backgroundImage: background
            });
        };
        // Once our callback is set up, we tell the image what file it should
        // load from. This also triggers the loading process.
        // remember to uncomment redraw() for background if any
        background.src = "./new_background_here.jpg";  // put new bg if any
    }

    drawBackgroundImage() {
        let canvas = this.canvas.current;
        if (canvas === null) throw Error("Unable to draw, no canvas ref.");
        let ctx = canvas.getContext("2d");
        if (ctx === null) throw Error("Unable to draw, no valid graphics context.");

        if (this.state.backgroundImage !== null) { // This means the image has been loaded.
            // Sets the internal "drawing space" of the canvas to have the correct size.
            // This helps the canvas not be blurry.
            canvas.width = this.state.backgroundImage.width;
            canvas.height = this.state.backgroundImage.height;
            ctx.drawImage(this.state.backgroundImage, 0, 0);
        }
    }

    // Updates the country value from the dropdown list
    handleCountryChange = (event: any) => {
        this.setState({
           countryValue: event.target.value,
           checkedDistricts: new Map(),  // clear prev. country checkedDistricts
        });
        this.fetchDistricts(this.state.countryValue);  // update districts to this country
    }

    // Updates vaccine vaccine inventory info and validates input accordingly
    handleVaccineCount = (event: any) => {
        this.setState({
            vaccineCount: event.target.value.replace(/^0+|\D/,'')
        });
    }

    // Updates state of districts campaigned on or not
    handleCheckboxPress = (event: any) => {
        const hasCampaigned = event.target.checked;
        const district = event.target.value;
        this.setState(prevState => ({checkedDistricts: prevState.checkedDistricts.set(district, hasCampaigned)}));
    }

    // Checks and updates covid stats file given if valid type, alerts if not
    handleCovidFile = (event: any) => {
        if (event.target.files[0] !== undefined) {
            const file = event.target.files;
            const fileName = event.target.files[0].name;
            if (fileName !== "covid_stats_template.csv") {
                alert("Different file selected; please provide our covid_stats_template.csv");
                this.setState({
                    covidFile: null
                });
                return false;
            }
            this.setState({
                covidFile: file[0]
            });
            console.log(file);
            return true;
        } else {  // no file provided
            this.setState({
                covidFile: null
            });
        }
    }

    // Checks and updates general stats file given if valid type, alerts if not
    handleGeneralFile = (event: any) => {
        if (event.target.files[0] !== undefined) {
            const file = event.target.files;
            const fileName = event.target.files[0].name;
            if (fileName !== "general_stats_template.csv") {
                alert("Different file selected; please provide our covid_stats_template.csv");
                this.setState({
                    generalFile: null
                });
                return false;
            }
            this.setState({
                generalFile: file
            });
            return true;
        } else {  // no file provided
            this.setState({
                generalFile: null
            });
        }
    }

    // Handles uploading attached covid file to server
    handleSubmit = (event: any) => {
        if (this!.state.covidFile !== null) {
            const formData = new FormData()
            formData.append('file', this.state.covidFile)
            console.log(formData);
            fetch('http://localhost:4567/saveCovidFile', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
            })
            .catch(error => {
                console.error(error)
            })
        }
    }

    render() {
        return (
            <div id="user-form">
                <p id="app-title">Campaign Planning</p>
                <div id="dropdown">
                    <div id="country-dropdown">
                        <p id="category-title">Country of Interest</p>
                        <p id="category-desc">Description Here</p>
                        <select value={this.state.countryValue} onChange={this.handleCountryChange}>
                            <option value="Choose a Country" disabled>Choose a Country</option>
                            {this.state.countries.map((country) =>
                                <option key={country} value={country}>{country}</option>)}
                        </select>
                    </div>
                </div>
                <div id="vaccine-inventory">
                    <p id="category-title">Vaccine Inventory</p>
                    <p id="category-desc">Description Here</p>
                    <input
                        type="text"
                        onPaste={e=>{
                            e.preventDefault();
                            return false}
                        }
                        pattern="[0-9]*"
                        value={this.state.vaccineCount}
                        onChange={this.handleVaccineCount}
                        placeholder="Enter number of vaccines"
                    />
                </div>
                <div id="districts-container">
                    <p id="category-title">Previous Campaigns Held</p>
                    <p id="category-desc">Description Here</p>
                    <div id="districts-list-container">
                        {
                            this.state.districts.map(district => (
                                <li key={district}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            key={district}
                                            value={district}
                                            onChange={this.handleCheckboxPress}
                                        /> {district}
                                    </label>
                                </li>
                            ))
                        }
                    </div>
                </div>
                <form onSubmit={this.handleSubmit} id="covid-stats-container">
                    <p id="category-title">COVID Statistics Regarding Country</p>
                    <p id="category-desc">Description Here</p>
                    <input type="file" name="file" onChange={this.handleCovidFile} accept=".csv"/>
                    <button type="submit"> Update File </button>
                </form>
                <div id="general-stats-container">
                    <p id="category-title">General Statistics Regarding Country</p>
                    <p id="category-desc">Description Here</p>
                    <input type="file" onChange={this.handleGeneralFile} accept=".csv"/>
                </div>
                <canvas ref={this.canvas} width={this.props.width} height={this.props.height}/>
            </div>
        );
    }
}

export default UserForm;