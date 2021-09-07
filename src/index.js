import React from 'react';
import ReactDOM from 'react-dom';
import Login from './components/Login';
import Main from './components/Main';
import Register from './components/Register';
import {BrowserRouter as Router, Switch,  Route, Link, Redirect} from 'react-router-dom';
import axios from 'axios';

var isAuthenticated = false;

export function setAuthenticate(text) {
    console.log(text)
    isAuthenticated = true;
}

export function getAuthenticate() {
    return isAuthenticated;
}

function PrivateRoute ({children, ...rest}){
    //debugger;
    console.log("Private Route authentication check: " + isAuthenticated)
    console.log({...rest});
    return (
        isAuthenticated === true
        ? <Route {...rest} />
        : <Redirect to='/Login' />
    )
}

 
class Index extends React.Component {
    
    constructor(props){
        super(props);
        this.state = {
            authenticated: false,
        }
        this.checkSession();
    }
    
    checkSession() {
        var that = this;
        
        axios({
            method: "get",
            withCredentials: true,
            url: "http://localhost:8000/Session",
        }).then((response) => {
            if (response.status === 200) {
                if (response.data === "Session is still active")
                    setAuthenticate("Authenticating set")
                    that.setState({authenticated: true});     
            } 
        })
    }

    render () {
        if (this.state.authenticated) {
            return (
                <Router>
                    <Switch>
                        <PrivateRoute path='/server/:serverid' render={(props) => <Main {...props}/>}/>
                        <Route path='/Register' render={() => <Register />}/>
                        <Route path='/Login' render={() => <Login />}/>
                        <PrivateRoute path='/' render={() => <Main />}/>
                    </Switch>
                </Router> 
            );
        } else return <h5> Loading </h5>
    }
  }

  ReactDOM.render(
    <Index />,
    document.getElementById('root')
  );
