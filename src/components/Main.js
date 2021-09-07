import React, {useEffect, useState} from 'react';
import SendIcon from '../icons/bx-send.svg';
import UserIcon from '../icons/bxs-user.svg';
import HomeIcon from '../icons/bxs-home.svg';
import ServerIcon from '../icons/bxs-server.svg';
import AddServerIcon from '../icons/bx-plus-circle.svg';
import '../scss/index.scss';
import 'bootstrap/dist/css/bootstrap.min.css'
import {Container, Modal, Col, Row, Button, DropdownButton, Dropdown, Image, Form, FormControl, Accordion, Card, ListGroup, InputGroup} from 'react-bootstrap';
import {Switch,  Router, Route, Link, useRouteMatch, useParams} from 'react-router-dom';

var client;

document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
})


function CreateChannel (props) {
    const [show,setShow] = useState(false);
    const [channel, setChannel] = useState('');

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleChange = (e) => setChannel(e.target.value);
    const onCreateChannelClick = () => {
        console.log(channel)
        sendMessage(client,JSON.stringify({
            type: "createchannel",
            serverid: props.serverid,
            channel: '#' + channel,
        }))
        setShow(false);
    }

    return(
        <Col>
            {props.customButton(handleShow,props.text)}

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

function DeleteChannel (props) {
    const [show,setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const onDeleteChannelClick = () => {
        sendMessage(client,JSON.stringify({
            type: "deletechannel",
            serverid: props.serverid,
            channelid: props.channelid
        }))
        setShow(false);
    }

    return(
        <>
        {props.customButton(handleShow, props.text)}
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Channel</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete this channel? This cannot be undone.
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={onDeleteChannelClick}>
                    Delete Channel
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
            selectedChannel: '',
        }
    }

    componentDidMount() {
        client = new WebSocket('ws://localhost:8000');

        client.onopen = () => {
            console.log('WebSocket Client Connected');
            if (this.props.match != null) {
                client.send(JSON.stringify({
                    type: "serverchange",
                    serverid: this.props.match.params.serverid,
                }))
            }
        };

        client.onmessage = (message) => {
            const dataFromServer = JSON.parse(message.data);
            if (dataFromServer.type === "initialdata") {
                if (dataFromServer.status === 200) {
                    this.setState({
                        server: dataFromServer.currentservername,
                        servers: dataFromServer.servers,
                        serverid: dataFromServer.currentserverid,
                        channels: dataFromServer.currentserverchannels,
                        username: dataFromServer.username,
                        userid: dataFromServer.userid,
                        channel: dataFromServer.currentchannelname,
                        channelid: dataFromServer.currentchannelid,
                    })
                }
                
            }
            else if (dataFromServer.type === "message"){
                console.log("Testing message received: " + new Date(dataFromServer.createdat));
                this.setState({messages: [...this.state.messages, dataFromServer]});
            }
            else if (dataFromServer.type === "channelcreated") {
                this.setState({channels: [...this.state.channels,dataFromServer.channel]});
            }
            else if  (dataFromServer.type === "channeldeleted") {
                this.setState({channels: this.state.channels.filter(item => item.channelid !== dataFromServer.channelid)})
            }
            else if (dataFromServer.type === "channelhistory") {
                console.log("Channel changed");
                this.setState({messages: dataFromServer.messages});
            }
            else if (dataFromServer.type === "serverchange") {
                this.setState({
                    server: dataFromServer.servername,
                    serverid: dataFromServer.serverid,
                    channels: dataFromServer.channels,
                    channelid: dataFromServer.channelid,
                    channel: dataFromServer.channelname,
                    messages: dataFromServer.messages,
                })
                
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

    componentDidUpdate(){
        if (this.props.match != null) {
            if (this.props.match.params.serverid !== this.state.serverid) {
                client.send(JSON.stringify({
                    type: "serverchange",
                    serverid: this.props.match.params.serverid,
                })) 
            }
        }
    }

    onChangeServerClicked = (serverid) => {
        client.send(JSON.stringify({
            type: "serverchange",
            serverid: serverid,
        })) 
    }

    onChangeChannelClicked(channel, channelid) {
        this.setState({
            channel: channel,
            channelid: channelid,
            messages: [],
        })
        client.send(JSON.stringify({
            type:"channelchange",
            channelid: channelid,
        }))
    }

    changeSelectedChannel(channelid) {
        this.setState({selectedChannel: channelid});
    }

    customListItem = (handleShow, text) => (
        <ListGroup.Item action onClick={handleShow}>{text}</ListGroup.Item>
    )

    customMenu = () => (
        <ListGroup>
            <CreateChannel client={client} serverid={this.state.serverid} text={'Create Channel'} customButton={(handleShow, text) => this.customListItem(handleShow,text)}/>
        </ListGroup>
    )

    customChannelMenu = () => (
        <ListGroup>
            <DeleteChannel client={client} serverid={this.state.serverid} channelid={this.state.selectedChannel} text={'Delete Channel'} customButton={(handleShow, text) => this.customListItem(handleShow,text)}/>
        </ListGroup>
    )

    render() {

        return (
            <div>
                <ContextMenu menu={() => this.customMenu()}
                            channelmenu={() =>  this.customChannelMenu()} 
                            selectedChannel={this.state.selectedChannel} 
                            setSelectedChannel={(channelid) => this.changeSelectedChannel(channelid)}
                />
                <ServerNav  servers = {this.state.servers} 
                            userid = {this.state.userid}
                            username = {this.state.username}
                />
                <ChannelNav server = {this.state.server} 
                            serverid = {this.state.serverid}
                            userid = {this.state.userid}
                            channels = {this.state.channels} 
                            onClick = {(channel,channelid) => this.onChangeChannelClicked(channel,channelid)}
                            channelOnContext = {(channelid) => this.changeSelectedChannel(channelid)} 
                            channelHeader = {"Channels"}
                />
                <ContentNav channel = {this.state.channel} 
                            messages = {this.state.messages}
                            serverid = {this.state.serverid}
                            channelid = {this.state.channelid}
                />
            </div>   
        );
    }
}

function ServerNav (props) {
    const onChangeServerClicked = (serverid) => {
        client.send(JSON.stringify({
            type: "serverchange",
            serverid: serverid,
        }))
        
    }

    return (
        <div className="server-nav">
            <div className="home-btn-header">
                <Button className="home-btn-large">
                    <Image className= "home-icon-large" src={HomeIcon}/>
                </Button>
            </div>
            {props.servers.map((value) => {
                return(
                    <Link key={value.serverid} to={`/server/${value.serverid}`}>
                        <Button  onClick={() => onChangeServerClicked(value.serverid)} className="home-btn-large">
                            <Image className= "home-icon-large" src={ServerIcon}/>
                        </Button>
                    </Link>
                    
            )})}
            <CreateServer client={client} userid={props.userid} username={props.username}/>
        </div>
    )
    
}

class ChannelNav extends React.Component {

    customButton = (handleShow,text) => (
        <Button className="add-channel" onClick={handleShow}>{text}</Button>
    )

    render() {
        return (
            <div className="channel-nav">
                <div className="header">
                    <DropdownButton id="dropdown-basic-button" title={this.props.server}>
                        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                    </DropdownButton>
                </div>
                    <Category
                        header = {this.props.channelHeader}
                        channels = {this.props.channels}
                        onClick = {this.props.onClick}
                        channelOnContext = {this.props.channelOnContext}
                        serverid = {this.props.serverid}
                        userid = {this.props.userid}
                        client={client}
                        customButton={(handleShow,text) => this.customButton(handleShow,text)}
                    />
            </div>
        )
    }   
}

function Category(props)  {
    
    return (
        <Row>
            <Col lg="auto">
                <Accordion className="list">
                    <Card style={{border:"none"}}>
                        <Card.Header className="card-header m-0">
                            <Accordion.Toggle className="shadow-none" style={{backgroundColor:"rgb(79,47,76)",border:"none",}} as={Button} eventKey="0">
                                {props.header}
                            </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse className="accordion-items" eventKey="0">
                            <Card.Body className="card-body">
                                <ListGroup>
                                    {props.channels.map((value) => {
                                        return (<React.Fragment key={value.channelid}>
                                                        <Channel  
                                                            channel={value.channelname} 
                                                            channelid={value.channelid} 
                                                            onClick={props.onClick}
                                                            channelOnContext={props.channelOnContext}    
                                                        /> 
                                                </React.Fragment>)
                                    })}
                                </ListGroup>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
            </Col>
            <CreateChannel client={props.client} serverid={props.serverid} text={'+'} customButton={props.customButton}/>
        </Row>
    );
    
}

class Channel extends React.Component {
    
    render () {
        return (
            <ListGroup.Item className="card-body p-0">
                <Button className="list-item"
                        onClick={() => this.props.onClick(this.props.channel,this.props.channelid)}
                        onContextMenu={() => this.props.channelOnContext(this.props.channelid)}>
                    {this.props.channel}
                </Button>
            </ListGroup.Item>
        );
    }
}

class ContentNav extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            value: '',
        }
        this.onSend = this.onSend.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    onSend() {
        console.log("Sending message");
        client.send(JSON.stringify({
            type: "message",
            serverid: this.props.serverid,
            channelid: this.props.channelid,
            message: this.state.value,
        }));
        this.setState({value: ''});
        
    }

    render () {
        return (
            <div className="main-content">
                <div className="header">
                    <Row style={{width: "100%"}}>
                        <Col>
                            <h5 style={{fontWeight: "bold"}}>{this.props.channel}</h5>
                        </Col>
                        <Col>
                            <Image className="icon-user-medium" src={UserIcon}/>
                        </Col>
                        
                    </Row>
                    
                </div>
                <div className="message-body" style={{height:"150px"}}>
                    <div style={{flex:"1 1 auto"}}></div>
                    {this.props.messages.map((value) => {
                        console.log("Testing message render");
                        return (<div key={new Date(value.createdat)} className="message-content">
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
        )
    }
}

class ContextMenu extends React.Component {
    
    constructor(props){
        super(props);
        this.state = {
            xPos: "0px",
            yPos: "0px",
            showMenu: false,
            className: '',
        }
    }

    componentDidMount() {
        document.addEventListener("click", this.handleClick);
        document.addEventListener("contextmenu", this.handleContextMenu);
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.handleClick);
        document.removeEventListener("contextmenu", this.handleContextMenu);
    }

    handleClick = (e) => {
        console.log(e.target.className);
        if (e.target.className.includes("list-group-item") || e.target.className.includes("modal") || e.target.className.includes("btn") || e.target.className.includes("form")) {
            
        } else {
            if (this.state.showMenu) this.setState({ showMenu: false });
        }
    }

    handleContextMenu = (e) => {
        e.preventDefault();

        if (e.target.className === "channel-nav") {
            this.props.setSelectedChannel('')
        }

        this.setState({
            xPos: `${e.pageX}px`,
            yPos: `${e.pageY}px`,
            showMenu: true,
            className: e.target.className,
        })
    }

    render() {
        const { showMenu, yPos, xPos, className} = this.state;
        
        if (showMenu && className === "channel-nav") {
            return (
                <div
                    className="menu-container"
                    style={{
                        top: yPos,
                        left: xPos,
                        zIndex: 9,
                        position: "absolute",
                    }}>
                    {this.props.menu()}   
                </div>
                
            );
        } else if (showMenu && this.props.selectedChannel !== '') {
            return (
                <div
                    className="menu-container"
                    style={{
                        top: yPos,
                        left: xPos,
                        zIndex: 9,
                        position: "absolute",
                    }}>
                    {this.props.channelmenu()}   
                </div>
            );
        } else return null;
    }
}

export default Main