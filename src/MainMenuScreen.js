import React, { Component } from 'react'
import './MainMenuScreen.css'

// Props:
//  user
//  onPlay
class MainMenuScreen extends Component
{
    onPlay()
    {
        this.props.onPlay()
    }

    render()
    {
        return (
            <div className="MainMenuScreen">
                <p>Player: {this.props.user.name}</p>
                <button type="button" onClick={this.onPlay.bind(this)}>Play</button>
            </div>
        )
    }
}

export default MainMenuScreen;
