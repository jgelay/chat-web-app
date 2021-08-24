import React from 'react';
import {Container, Form, Button} from  'react-bootstrap';
import '../scss/App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Redirect} from 'react-router-dom';
import axios from 'axios';


class Register extends React.Component {
    
    constructor(props){
        super(props);
        this.state = {
            email: '',
            username: '',
            password: '',
            redirect: null,
        }
    }

    componentDidMount() {
        
    }

    handleClick() {
        axios({
            method: "post",
            data: {
                email: this.state.email,
                username: this.state.username,
                password: this.state.password,
            },
            withCredentials: true,
            url: "http://localhost:8000/Register",
        })
        .then(function (response) {
            console.log(response.status);
        });
    };
    handleEmailChange(e) {
        this.setState({email: e.target.value});
    }

    handleUserNameChange(e) {
        this.setState({username: e.target.value});
    }

    handlePasswordChange(e) {
        this.setState({password: e.target.value});
    }

    render () {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }
        return (
            <div className="App">
                <header className="App-header">
                    <Form>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control onChange={(e) => this.handleEmailChange(e)} value={this.state.email} type="email" placeholder="email@domain.com"/>
                        </Form.Group>
                        <Form.Group controlId="formUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control onChange={(e) => this.handleUserNameChange(e)} value={this.state.username} type="text" placeholder="username"/>
                        </Form.Group>
                        <Form.Group controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control onChange={(e) => this.handlePasswordChange(e)} value={this.state.password} type="password" placeholder="Password"/>
                        </Form.Group>
                        <Button variant="secondary" type="submit" onClick={() => {this.handleClick()}}>Submit</Button>
                    </Form>
                </header>
            </div> 
        )
    }
}

export default Register;