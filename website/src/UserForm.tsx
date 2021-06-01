/*
 * Credit to Spring 2020 CSE 331 server material, main site for user
 * input on a form
 */

import React, {Component} from 'react';
import "./UserForm.css";
import "./Map.jsx";
import history from "./history";

interface UserFormProps {

}

interface UserFormState {
    countries: string[]  // list of countries
    districts: string[]  // list of districts (for a country)
    checkedDistricts: Map<String, boolean>  // mapping of campaigned districts
    countryValue: string  // the targeted country
    vaccineCount: number | string,  // number of vaccines (saved as number)
    covidFile: File | null,
    generalFile: File | null,
}

class UserForm extends Component<UserFormProps, UserFormState> {

    constructor(props: UserFormProps) {
        super(props)
        this.state = {
            countries: [],  // list of all the countries (populate it when loaded)
            districts: [],  // list of districts for a country
            checkedDistricts: new Map(),
            countryValue: "Choose a Country", // choose a country
            vaccineCount: "",  // value on user input; placeholder
            covidFile: null,  // given by user
            generalFile: null,  // given by user
        };
    }

    componentDidMount() {
        this.fetchCountryDropList();
        this.redraw();
    }

    componentDidUpdate() {
        this.redraw();
    }

    // redraws/refreshes visuals on screen (add other methods here like
    // updating list of districts)
    redraw() {
        this.fetchDistricts(this.state.countryValue);
    }

    // Creates drop-down list of countries from the server data
    // Try to see why visuals are bugged on dropdown (non-essential)
    fetchCountryDropList() {
        // Get the JSON info from server on countries, sorted alphabetically
        fetch("http://localhost:8080/countries")
        .then((res) => {
            return res.json();
        })
        // Save the country info
        .then(data => {
            let countries = data.countries;
            var countriesArr = [];
            for (let i = 0; i < Object.keys(countries).length; i++) {
                countriesArr.push(countries[i]);
            }
            this.setState({
                countries: countriesArr,
            })
        });
    }

    // Fetches districts based on country select
    fetchDistricts(countryValue : string) {
        // Get the JSON info from server on districts, sorted alphabetically
        // if country has been selected
        if (countryValue !== "Choose a Country") {
            fetch("http://localhost:8080/" + countryValue + "-districts")
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
                alert("Different file selected; please provide our general_stats_template.csv");
                this.setState({
                    generalFile: null
                });
                return false;
            }
            this.setState({
                generalFile: file[0]
            });
            return true;
        } else {  // no file provided
            this.setState({
                generalFile: null
            });
        }
    }

    // Delays response by @param ms
    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Checks if user submitted form is valid
    // @return true if valid, false w/ alert of what's missing
    isValidSubmission() {
        var noErrorMsg = "Please do the following before submitting: \n\n"
        var errorMessage = noErrorMsg;
        if (this.state.countryValue === "Choose a Country") {
            errorMessage += "- Choose your Country of Interest\n";
        }
        if (this.state.vaccineCount === "") {
            errorMessage += "- Enter a non-zero amount of vaccine doses \n";
        }
        if (this.state.covidFile == null) {
            errorMessage += "- Upload our COVID Stats Template \n";
        }
        if (this.state.generalFile == null) {
            errorMessage += "- Upload our General Stats Template \n";
        }
        if (errorMessage !== noErrorMsg) {  // User didn't submit required
            alert(errorMessage);
            return false;
        }
        return true;
    }

    // Handles uploading the state of the website to backend for planning
    handleSubmit = (event: any) => {
        event.preventDefault();

        // Send to submit for planning + Map if user submitted all fields
        // Do nothing but warn and prevent send if notValidSubmission
        if (this.isValidSubmission()) {
            // User can view their plan from algo on the Map
            // Send to backend (local atm), the JSON stringified states
            // and any user uploads
            var stateFile = new File([JSON.stringify([this.state.countryValue,
                this.state.vaccineCount,
                Array.from(this.state.checkedDistricts.entries())])], "states.json");
            const formData = new FormData()
                formData.append('stateFile', stateFile)
            if (this.state.generalFile !== null) {
                formData.append('generalFile', this.state.generalFile)
            }
            if (this.state.covidFile !== null) {
                formData.append('covidFile', this.state.covidFile)
            }
            const reqOptions = {
                method: 'POST',
                body: formData
            };
            fetch('http://localhost:8080/results', reqOptions)
            .then((res) => {
              const resJson = res.json();
              return resJson;
            })
            // Redirects to /Map w/ the jsonData from results
            // in Map component, access jsonData by:
            // this.props.location.state.jsonData
            .then((data) => {
                history.push({pathname: "/Map", state: {jsonData: data}});
             })
            .catch(error => {
                console.error(error)
            });
        }
    }

    // For downloading files, fetching to download from fileName
    download = (event: any, fileName: string) => {
        event.preventDefault();  // prevents refreshing page/wiping data
        let link = document.createElement('a'); // Create link
        link.download = fileName; // What the file name is
        link.href = "./" + fileName;
        link.click(); // Click to download the link

        // For further implementation, may consider a GET non-locally download
    }

    // Gets the file name of a file if not null
    getFileName = (file: any) => {
        if (file != null) {
            return file.name;
        }
    }

    render() {
        return (
            <div id="form-wrapper">
                <p id="app-title">Vaccine Campaign Planning Tool</p>
                <form onSubmit={this.handleSubmit} id="user-form">
                    <div id="dropdown">
                        <div id="country-dropdown">
                            <p id="category-title">Country of Interest</p>
                            <p id="category-desc">Let us know which country you'd like to plan a campaign for</p>
                            <select value={this.state.countryValue} onChange={this.handleCountryChange}>
                                <option value="Choose a Country" disabled>Choose a Country</option>
                                {this.state.countries.map((country) =>
                                    <option key={country} value={country}>{country}</option>)}
                            </select>
                        </div>
                    </div>
                    <div id="vaccine-inventory">
                        <p id="category-title">Vaccine Inventory</p>
                        <p id="category-desc">Let us know how many doses of two-dose vaccines you have <br></br>(ex: Pfizer 1 vial = 6 doses)</p>
                        <input
                            type="text"
                            onPaste={e=>{
                                e.preventDefault();
                                return false}
                            }
                            pattern="[0-9]*"
                            value={this.state.vaccineCount}
                            onChange={this.handleVaccineCount}
                            placeholder="Enter number of doses"
                        />
                    </div>
                    <div id="districts-container">
                        <p id="category-title">Previous Campaigns Held</p>
                        <p id="category-desc">Let us know which districts you've started/completed campaigns in</p>
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
                    <div id="covid-stats-container">
                        <p id="category-title">COVID Statistics Regarding Country</p>
                        <p id="category-desc">Let us know more on this country's COVID-related stats by uploading
                            our template
                        </p>
                        <label id="download-btn"
                            onClick={(event) => this.download(event, "covid_stats_template.csv")}>
                            Download COVID Stats Template
                        </label>
                        <label id="upload-btn">
                            Upload COVID Stats Template
                            <input type="file" name="file" style={{display:'none'}} onChange={this.handleCovidFile} accept=".csv"/>
                        </label>
                        <p id="file-p"> {this.getFileName(this.state.covidFile)} </p>
                    </div>
                    <div id="general-stats-container">
                        <p id="category-title">General Statistics Regarding Country</p>
                        <p id="category-desc">Let us know more about general stats of this country by uploading
                            our template
                        </p>
                        <label id="download-btn"
                            onClick={(event) => this.download(event, "general_stats_template.csv")}>
                            Download General Stats Template
                        </label>
                        <label id="upload-btn">
                            Upload General Stats Template
                            <input type="file" name="file" style={{display:'none'}} onChange={this.handleGeneralFile} accept=".csv"/>
                        </label>
                        <p id="file-p"> {this.getFileName(this.state.generalFile)} </p>
                    </div>
                    <button id="submit-button" type="submit"> Send to Plan </button>
                </form>
            </div>
        );
    }
}

export default UserForm;