import React, { Component } from 'react'
import './LoadingScreen.css'

// Props:
//  text
class LoadingScreen extends Component
{
    render()
    {
        return (
            <div className="LoadingScreen">
                <p>{this.props.text}</p>
            </div>
        )
    }
}

export default LoadingScreen;
