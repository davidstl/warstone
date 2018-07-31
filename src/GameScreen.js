import React, { Component } from 'react'
import './GameScreen.css'

let Constants = require("./game/Constants")
let Renderer = require("./game/Renderer")
let Resources = require("./game/Resources")
let GameView = require("./game/GameView")

let FRAME_RATE = 30

// Props:
class GameScreen extends Component
{
    constructor()
    {
        super()

        this.intervaleId = null
        this._advanceButton = null
    }

    componentDidMount()
    {
        Renderer.initialize(this.refs.glCanvas)
        Resources.initialize()
        GameView.initialize()

        // Advance button on the right
        // this._advanceButton = new AdvanceButton(this);
        // _drawButton = new DrawButton(_gameView, this, _config);
        // _dialog = new Dialog(_gameView, this);
        // _descriptionDialog = new DescriptionDialog(_gameView);

        this.intervaleId = setInterval(() =>
        {
            let dt = 1 / FRAME_RATE
            GameView.update(dt)
            GameView.renderView()
        }, 1000 / FRAME_RATE)
    }

    componentWillUnmount()
    {
        if (this.intervaleId)
        {
            clearInterval(this.intervaleId)
        }
    }

    render()
    {
        return (
            <div className="GameScreen">
                <canvas ref="glCanvas" width={Constants.WIDTH * Constants.SCALE} height={Constants.HEIGHT * Constants.SCALE}></canvas> 
            </div>
        )
    }
}

export default GameScreen;
