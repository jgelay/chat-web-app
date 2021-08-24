import React, {useState} from 'react';
import SendIcon from '../icons/bx-send.svg';
import UserIcon from '../icons/bxs-user.svg';
import HomeIcon from '../icons/bxs-home.svg';
import ServerIcon from '../icons/bxs-server.svg';
import AddServerIcon from '../icons/bx-plus-circle.svg';
import '../scss/index.scss';
import 'bootstrap/dist/css/bootstrap.min.css'
import {Container, Modal, Col, Row, Button, DropdownButton, Dropdown, Image, Form, FormControl, Accordion, Card, ListGroup, InputGroup} from 'react-bootstrap';

var client;

function CreateChannel (props) {
    const [show,setShow] = useState(false);
    const [channel, setChannel] = useState('');

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleChange = (e) => setChannel(e.target.value);
    const onCreateChannelClick = () => {
        sendMessage(client,JSON.stringify({
            type: "createchannel",
            serverid: props.serverid,
            channel: '#' + channel,
        }))
        setShow(false);
    }

    return(
        <Col>
            <Button className="add-channel" onClick={handleShow}>+</Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create a channel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>CHANNEL NAME</Form.Label>
                            <Form.Control onChange={handleChange} value={channel} placeholder="new-channel"/>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={onCreateChannelClick}>
                        Create Channel
                    </Button>
                </Modal.Footer>
            </Modal>
        </Col>
    );
}

function CreateServer (props) {
    const [show,setShow] = useState(false);
    const [server, setServer] = useState('');

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleChange = (e) => setServer(e.target.value);
    const onCreateServerClick = () => {
        sendMessage(client,JSON.stringify({
            type: "createserver",
            userid: props.userid,
            username: props.username,
            servername: server,
        }))
        setShow(false);
    }

    return(
        <>
        <Button className="home-btn-large" onClick={handleShow}>
            <Image className= "home-icon-large" src={AddServerIcon}/>
        </Button>

        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Create a server</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>SERVER NAME</Form.Label>
                        <Form.Control onChange={handleChange} value={server} placeholder="new-server"/>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={onCreateServerClick}>
                    Create Server
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    );
}

function sendMessage (client,message) {
    client.send(message);
}

class Main extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            channel: '',
            channelid: '',
            channels: [],
            value: '',
            messages: [],
            servers: [],
            server:'',
            serverid: '',
            sender: '',
            username: '',
            userid: '',
        }

        this.onSend = this.onSend.bind(this);

    }

    componentDidMount() {
        client = new WebSocket('ws://localhost:8000');

        client.onopen = () => {
            console.log('WebSocket Client Connected');
        };
        client.onmessage = (message) => {
            const dataFromServer = JSON.parse(message.data);
            if (dataFromServer.type === "initialdata") {
                if (dataFromServer.status === 200) {
                    this.setState({server: dataFromServer.currentservername});
                    this.setState({servers: dataFromServer.servers});
                    this.setState({serverid: dataFromServer.currentserverid});
                    this.setState({channels: dataFromServer.currentserverchannels});
                    this.setState({username: dataFromServer.username});
                    this.setState({userid: dataFromServer.userid});
                    this.setState({channel: dataFromServer.currentchannelname});
                    this.setState({channelid: dataFromServer.currentchannelid});
                }
                
            }
            else if (dataFromServer.type === "message"){
                console.log("Testing message sent");
                /*if (this.state.sender !== dataFromServer.sender){
                    this.setState({sender: dataFromServer.sender});
                }*/
                this.setState({messages: [...this.state.messages, dataFromServer]});
            }
            else if (dataFromServer.type === "channelcreated") {
                const newchannel = {
                    channelid: dataFromServer.channelid,
                    channelname: dataFromServer.channelname,
                }
                this.setState({channels: [...this.state.channels,newchannel]});
            }
            else if (dataFromServer.type === "channelhistory") {
                console.log("Channel changed");
                this.setState({messages: dataFromServer.messages});
            }
            else if (dataFromServer.type === "serverchange") {
                this.setState({server: dataFromServer.servername});
                this.setState({serverid: dataFromServer.serverid});
                this.setState({channels: dataFromServer.channels});
                this.setState({channelid: dataFromServer.channelid});
                this.setState({channel: dataFromServer.channelname});
                this.setState({messages: dataFromServer.messages});
                console.log(dataFromServer.messages);
            }
            else if (dataFromServer.type === "servercreated") {
                this.setState({server: dataFromServer.servername});
                this.setState({serverid: dataFromServer.serverid});
                this.setState({channelid: dataFromServer.channelid});
                this.setState({channel: dataFromServer.channelname});
                this.setState({channels: dataFromServer.channels});
                this.setState({messages: []});
            }
        };
    }

    renderCategory(i,j){
        return <Category
                header = {i}
                channels={j}
                onClick={(channel,channelid) => this.onChangeChannelClicked(channel,channelid)}
                />
    }

    onChangeChannelClicked(i,j) {
        this.setState({channel: i});
        this.setState({channelid: j});
        this.setState({messages: []});
        client.send(JSON.stringify({
            type:"channelchange",
            channelid: j,
        }))
    }

    onChangeServerClicked(serverid) {
        client.send(JSON.stringify({
            type: "serverchange",
            userid: this.state.userid,
            serverid: serverid,
        }))
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    onSend() {
        console.log("Sending message");
        client.send(JSON.stringify({
            type: "message",
            serverid: this.state.serverid,
            channelid: this.state.channelid,
            message: this.state.value,
        }));
        this.setState({value: ''});
        
    }

    render() {

        return (
            <div>
                <div className="server-nav">
                    <div className="home-btn-header">
                        <Button className="home-btn-large">
                            <Image className= "home-icon-large" src={HomeIcon}/>
                        </Button>
                    </div>
                    {this.state.servers.map((value) => {
                        return(
                            <Button key={value.serverid} onClick={() => this.onChangeServerClicked(value.serverid)} className="home-btn-large">
                                <Image className= "home-icon-large" src={ServerIcon}/>
                            </Button>
                    )})}
                    <CreateServer client={client} userid={this.state.userid} username={this.state.username}/>
                </div>
                <div className="channel-nav">
                    <div className="header">
                        <DropdownButton id="dropdown-basic-button" title={this.state.server}>
                            <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                        </DropdownButton>
                    </div>
                    <Row>
                        <Col lg="auto">
                            {this.renderCategory("Channels",this.state.channels)}
                        </Col>
                        <CreateChannel client={client} serverid={this.state.serverid}/>
                    </Row>
                </div>
                <div className="main-content">
                    <div className="header">
                        <ChannelHeader value={this.state.channel}/>
                        <Image className="icon-user-medium" src={UserIcon}/>
                    </div>
                   <div className="message-body" style={{height:"150px"}}>
                        <div style={{flex:"1 1 auto"}}></div>
                        {this.state.messages.map((value,index) => {
                            console.log("Testing message render");
                            return (<div key={index} className="message-content">
                                    <Image className="icon-user-large" src={UserIcon}/>
                                    <h5 className="sender">{value.sender}</h5>
                                    <h7>{value.message}</h7>
                                    </div>
                        )})}
                   </div>
                    <div className="message-nav">
                        <div className="send-message">
                            <InputGroup >
                                <FormControl value={this.state.value} onChange={(e) => this.handleChange(e)} className="shadow-none" placeholder="Send a message to #general" aria-label="Default" aria-describedby="inputGroup-sizing-default"/>
                            </InputGroup>
                            <Button className="icon-btn-small" style={{float:"right"}} onClick={() => this.onSend()}>
                                <Image src={SendIcon}/>
                            </Button>
                        </div>
                    </div>
                </div>
                
            </div>   
        );
    }
}

class Category extends React.Component {
    
    render() {
        return (
            <Accordion className="list">
                <Card style={{border:"none"}}>
                    <Card.Header className="card-header m-0">
                        <Accordion.Toggle className="shadow-none" style={{backgroundColor:"rgb(79,47,76)",border:"none",}} as={Button} eventKey="0">
                            {this.props.header}
                        </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse className="accordion-items" eventKey="0">
                        <Card.Body className="card-body">
                            <ListGroup>
                                {this.props.channels.map((value) => {
                                    return <Channel key={value.channelid} channel={value.channelname} channelid={value.channelid} onClick={this.props.onClick}/>
                                })}
                            </ListGroup>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        );
    }
}

class ChannelHeader extends React.Component {
    render() {
        return (
            <h5 style={{fontWeight: "bold"}}>{this.props.value}</h5>
        );
    }
}

class Channel extends React.Component {

    render () {
        return (
            <ListGroup.Item className="card-body p-0">
                <Button className="list-item"
                        onClick={() => this.props.onClick(this.props.channel,this.props.channelid)}>
                    {this.props.channel}
                </Button>
            </ListGroup.Item>
        );
    }
}

class Servers extends React.Component {

}

export default Main