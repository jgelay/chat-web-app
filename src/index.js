import React from 'react';
import ReactDOM from 'react-dom';
import Login from './components/Login';
import Main from './components/Main';
import Register from './components/Register';
import {BrowserRouter as Router, Switch,  Route, Link, Redirect} from 'react-router-dom';

var isAuthenticated = false;

export function setAuthenticate() {
    isAuthenticated = true;
}

export function getAuthenticate() {
    return isAuthenticated;
}

function PrivateRoute ({children, ...rest}){
    //debugger;
    console.log("Private Route authentication check: " + isAuthenticated)
    return (
        isAuthenticated === true
        ? <Route {...rest} />
        : <Redirect to='/Login' />
    )
}

class Index extends React.Component {
    render () {
        return (
            <Router>
                <Switch>
                    <Route path='/Register' render={() => <Register />}/>
                    <Route path='/Login' render={() => <Login />}/>
                    <PrivateRoute path='/' render={() => <Main />}/>
                </Switch>
            </Router> 
        );
    }
  }

  ReactDOM.render(
    <Index />,
    document.getElementById('root')
  );
