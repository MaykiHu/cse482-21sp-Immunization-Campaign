/*
 * Credit to Spring 2020 CSE 331 server material, main display of website
 */

import React, {Component} from 'react';
import UserForm from "./UserForm";
import Map from "./Map";

class App extends Component<{}, {}> {

    render() {
        return (
            <div>
            <UserForm />
            </div>
        );
    }

}

export default App;
