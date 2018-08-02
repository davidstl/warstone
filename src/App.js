import React, { Component } from 'react'
import './App.css'
import LoginScreen from './LoginScreen';
import LoadingScreen from './LoadingScreen';
import MainMenuScreen from './MainMenuScreen';
import GameScreen from './GameScreen';
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

        this.state = this.makeDefaultState()
    }

    makeDefaultState()
    {
        return {
            screen: "login",
            joiningState: "",
            user: null,
            lobby: null,
            server: null
        }
    }

    dieWithMessage(message)
    {
        // Close RTT connection
        this.bc.brainCloudClient.deregisterAllRTTCallbacks()
        this.bc.brainCloudClient.resetCommunication()

        // Pop alert message
        alert(message)

        // Initialize BC libs and start over
        this.initBC()

        // Go back to default login state
        this.setState(this.makeDefaultState())
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
            this.setState({lobby: result.data.lobby, joiningState: result.data.lobby.state})
        }
        if (result.data.connectData)
        {
            this.setState({server: result.data.connectData})
        }

        if (result.operation === "DISBANDED")
        {
            if (result.data.reason.code === "ROOM_READY" && this.state.server)
            {
                // Start the game!
                this.setState({screen: "game"})
            }
            else
            {
                this.onGameScreenClose()
            }
        }
    }

    onGameScreenClose()
    {
        let state = this.makeDefaultState()
        state.screen = "mainMenu"
        this.setState(state)
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
            case "game":
            {
                return (
                    <div className="App">
                        {this.renderTitle()}
                        <GameScreen user={this.state.user} 
                                    lobby={this.state.lobby} 
                                    server={this.state.server}
                                    onClose={this.onGameScreenClose.bind(this)} />
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
