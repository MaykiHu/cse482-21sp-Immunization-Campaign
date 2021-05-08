/*
 * Credit to Spring 2020 CSE 331 server material, main display of website
 */

import React, {Component} from 'react';
import UserForm from "./UserForm";

class App extends Component<{}, {}> {

    render() {
        return (
            <div>
            <UserForm width={4330} height={2964}/>
            </div>
        );
    }

}

export default App;
