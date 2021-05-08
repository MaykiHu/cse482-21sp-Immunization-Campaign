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
    countries: string[] // list of countries
    startValue: string // the starting building in drop down
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
            countries: [],     // list of all the countries (populate it when loaded)
            startValue: "Benin", // starting country to display
        };
        this.canvas = React.createRef();
    }

    componentDidMount() {
        this.fetchAndSaveImage();
        this.fetchDropList();
        this.drawBackgroundImage();
        this.redraw();
    }

    componentDidUpdate() {
        this.drawBackgroundImage();
        this.redraw();
    }

    // redraws/refreshes visuals on screen (add other methods here like
    // updating the excel preview of the form for example or list of districts)
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
    }

    // Creates drop-down list of countries from the server data of campus buildings
    fetchDropList() {
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

    // Updates the starting country value from the dropdown list
    handleStartChange = (event: any) => {
        this.setState({
           startValue: event.target.value
        });
    }

    // Resets the program to make page as if freshly loaded
    handleClearClick = (event: any) => {
        this.setState({
            startValue: "Benin", // Benin is starting country in drop down list
        })
    }

    render() {
        return (
            <div id="user-form">
                <p id="app-title">Campaign Planning</p>
                <p><br></br><br></br><br></br><br></br><br></br></p>
                <div id="dropdown">
                    <div id="country-dropdown">
                        <p>Country of Interest</p>
                        <select value={this.state.startValue} onChange={this.handleStartChange}>
                            {this.state.countries.map((building) =>
                                <option key={building} value={building}>{building}</option>)}
                        </select>
                    </div>
                </div>
                <canvas ref={this.canvas} width={this.props.width} height={this.props.height}/>
            </div>
        );
    }
}

export default UserForm;