import React, { Component } from 'react'
import './GameIcon.css'

// Props:
//  name
class GameIcon extends Component
{
    render()
    {
        return (
            <img class="GameIcon" src={`${this.props.name}.png`} alt={`(${this.props.name} icon)`}/>
        )
    }
}

export default GameIcon;
