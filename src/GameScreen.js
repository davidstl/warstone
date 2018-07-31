import React, { Component } from 'react'
import './GameScreen.css'

let GameView = require("./GameView")

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

        // _gameView = new GameView(this);
        // _advanceButton = new AdvanceButton(_gameView, this);
        // _drawButton = new DrawButton(_gameView, this, _config);
        // _dialog = new Dialog(_gameView, this);
        // _descriptionDialog = new DescriptionDialog(_gameView);

        this.intervaleId = setInterval(() =>
        {
            GameView.renderView()
        }, 1000 / 30) // 30 FPS is enough for web
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
