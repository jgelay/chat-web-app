import React from 'react';
import {Container, Form, Button} from  'react-bootstrap';
import '../scss/App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as authenticate from '../index';
import {Link, Redirect, useHistory} from 'react-router-dom';
import axios from 'axios';


class Login extends React.Component {
    
    constructor(props){
        super(props);
        this.state = {
            username: '',
            password: '',
            redirect: null,
            authenticated: authenticate.getAuthenticate(),
        }
        
    }

    componentDidMount() {
            var that = this;
            axios({
                method: "get",
                withCredentials: true,
                url: "http://localhost:8000/Session",
            })
            .then(response => {
                console.log(response);
                if (response.status === 200) {
                    if (response.data === "Session is still active") {
                        that.setState({authenticated:true});          
                    }
                }
            });
    }

    handleClick() {
        var that = this;

        axios({
            method: "post",
            data: {
                username: this.state.username,
                password: this.state.password,
            },
            withCredentials: true,
            url: "http://localhost:8000/Login",
        })
        .then(response => {
            if (response.status === 200) {
                that.setState({authenticated: true});
            }
        });
        
    };

    handleUserNameChange(e) {
        this.setState({username: e.target.value});
    }

    handlePasswordChange(e) {
        this.setState({password: e.target.value});
    }

    render () {
        if (this.state.authenticated) {
            authenticate.setAuthenticate();
            return <Redirect to='/' />
        }

        return (
            <div className="App">
                <header className="App-header">
                    <Form>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Username</Form.Label>
                            <Form.Control onChange={(e) => this.handleUserNameChange(e)} value={this.state.username} type="email" placeholder="username"/>
                        </Form.Group>
                        <Form.Group controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control onChange={(e) => this.handlePasswordChange(e)} value={this.state.password} type="password" placeholder="Password"/>
                        </Form.Group>
                        <Button variant="secondary" type="submit" onClick={() => {this.handleClick()}}>Login</Button>
                    </Form>
                </header>
            </div> 
        )
    }
}

export default Login;