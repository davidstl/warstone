import React, { Component } from 'react'
import './GameScreen.css'

let GameView = require("./GameView")

let FRAME_RATE = 30

// Props:
class GameScreen extends Component
{
    constructor()
    {
        super()

        this.intervaleId = null
    }

    componentDidMount()
    {
        GameView.initialize(this.refs.glCanvas)

        // _advanceButton = new AdvanceButton(_gameView, this);
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
                <canvas ref="glCanvas" width={GameView.WIDTH * GameView.SCALE} height={GameView.HEIGHT * GameView.SCALE}></canvas> 
            </div>
        )
    }
}

export default GameScreen;
