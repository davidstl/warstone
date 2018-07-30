import React, { Component } from 'react'
import './App.css'
import LoginScreen from './LoginScreen';
import LoadingScreen from './LoadingScreen';
import MainMenuScreen from './MainMenuScreen';
let brainCloud = require("braincloud-react")

let appId = "22819"
let appSecret = "eeeb827e-4e07-42cd-b09b-ffeab6d9cd09"
let bcURL = "https://internal.braincloudservers.com/"

class App extends Component
{
    constructor()
    {
        super();
        
        this.initBC()

        this.state = {
            screen: "login",
            joiningState: ""
        }
    }

    dieWithMessage(message)
    {
        // Close RTT connection
        this.bc.brainCloudClient.deregisterAllRTTCallbacks()
        this.bc.brainCloudClient.resetCommunication()

        // Pop alert message
        alert(message)

        // Go back to default login state
        this.setState({screen: "login"})

        // Initialize BC libs and start over
        this.initBC()
    }

    initBC()
    {
        this.bc = new brainCloud.BrainCloudWrapper("warstone")
        this.bc.initialize(appId, appSecret, "1.0.0", bcURL)
        this.bc.brainCloudClient.setServerUrl(bcURL)
        this.bc.brainCloudClient.enableLogging(true);
    }

    renderTitle()
    {
        return (
            <h1>War Stone</h1>
        )
    }

    onLoginClicked(user, pass)
    {
        this.setState({screen: "loginIn"})

        // Connect to braincloud
        console.log("BC: authenticateUniversal")
        this.bc.authenticateUniversal(user, pass, true, this.onLoggedIn.bind(this))
    }

    onLoggedIn(result)
    {
        console.log(result)
        if (result.status === 200)
        {
            this.setState({})
            this.setState({
                screen: "mainMenu",
                user: {
                    id: result.data.profileId,
                    name: result.data.playerName,
                    pic: result.data.pictureUrl
                }
            })
        }
        else
        {
            this.dieWithMessage("Failed to login");
        }
    }

    onPlayClicked()
    {
        this.setState({screen: "lookingForOpponent"})

        // Enable RTT service
        this.bc.brainCloudClient.enableRTT(() =>
        {
            console.log("RTT Enabled");

            // Register lobby callback
            this.bc.brainCloudClient.registerRTTLobbyCallback(this.onLobbyEvent.bind(this))

            // Find an opponent
            this.bc.lobby.findOrCreateLobby("unranked", 0, 1, {strategy:"ranged-absolute",alignment:"center",ranges:[1000]}, {}, null, {}, true, {}, "", result =>
            {
                if (result.status !== 200)
                {
                    this.dieWithMessage("Failed to find lobby")
                }
                // Success of lobby found will be in the event onLobbyEvent
            })
        }, () =>
        {
            this.dieWithMessage("Failed to enable RTT")
        })
    }

    onLobbyEvent(result)
    {
        if (result.data.lobby)
        {
            this.setState({joiningState: result.data.lobby.state})
        }

        //  {"service":"lobby","operation":"DISBANDED","data":{"lobbyId":"22819:unranked:53","lobby":{"id":"22819:unranked:53","appId":"22819","lobbyType":"unranked","seq":53,"state":"starting","owner":"f6fa3e0e-6aac-497a-84e1-c8db6f545c12","rating":0,"lobbyTypeDef":{"roomConfig":null,"lobbyTypeId":"unranked","teams":{"player1":{"minUsers":1,"maxUsers":1,"autoAssign":true,"code":"player1"},"player2":{"minUsers":1,"maxUsers":1,"autoAssign":true,"code":"player2"}},"rules":{"allowEarlyStartWithoutMax":false,"forceOnTimeStartWithoutReady":true,"onTimeStartSecs":90,"everyReadyMinPercent":100,"everyReadyMinNum":2,"earliestStartSecs":0,"tooLateSecs":180},"launch":{"endpoint":"bcrsm","secret":"16ed75fa3e9b4e5b8ad189ec7f926118","serviceId":"307cab61-e26a-4ce8-bec1-dcbff3910dd7"},"scripts":{"filter":null},"desc":"Unranked match"},"settings":{},"version":1,"numMembers":2,"members":[{"profileId":"1dab1250-facb-419a-80cf-3d2de4e91e0b","name":"david2","pic":"","rating":0,"team":"player2","isReady":true,"extra":{}},{"profileId":"f6fa3e0e-6aac-497a-84e1-c8db6f545c12","name":"david","pic":"","rating":0,"team":"player1","isReady":true,"extra":{}}]},"reason":{"code":"ROOM_READY","desc":"Room successfully launched"}}}
    }

    render()
    {
        switch (this.state.screen)
        {
            case "login":
            {
                return (
                    <div className="App">
                        {this.renderTitle()}
                        <LoginScreen onLogin={this.onLoginClicked.bind(this)} />
                    </div>
                )
                break
            }
            case "loginIn":
            {
                return (
                    <div className="App">
                        {this.renderTitle()}
                        <LoadingScreen text="Login in..."/>
                    </div>
                )
                break
            }
            case "mainMenu":
            {
                return (
                    <div className="App">
                        {this.renderTitle()}
                        <MainMenuScreen user={this.state.user}
                                        onPlay={this.onPlayClicked.bind(this)}/>
                    </div>
                )
                break
            }
            case "lookingForOpponent":
            {
                return (
                    <div className="App">
                        {this.renderTitle()}
                        <LoadingScreen text={`Looking for Opponent... ${this.state.joiningState}`}/>
                    </div>
                )
                break
            }
            default:
            {
                return (
                    <div className="App">
                        {this.renderTitle()}
                        Invalid state
                    </div>
                )
                break;
            }
        }
    }
}

export default App;
