import React, { Component } from 'react'
import './GameScreen.css'

let Constants = require("./game/Constants")
let Renderer = require("./game/Renderer")
let Resources = require("./game/Resources")
let GameView = require("./game/GameView")
let Input = require("./game/Input")
let EndTurnButton = require("./game/EndTurnButton").EndTurnButton

let FRAME_RATE = 30

// Props:
class GameScreen extends Component
{
    constructor()
    {
        super()

        this.intervaleId = null
        this._endTurnBtn = null
    }

    componentDidMount()
    {
        Renderer.initialize(this.refs.glCanvas)
        Resources.initialize()
        GameView.initialize()

        // Advance button on the right
        this._endTurnBtn = new EndTurnButton()
        GameView.addSpriteNode(this._endTurnBtn)
        this._endTurnBtn.setEnabled(true)
        this._endTurnBtn.onClick = () =>
        {
            this.endTurn()
        }
        
        // _drawButton = new DrawButton(_gameView, this, _config);
        // _dialog = new Dialog(_gameView, this);
        // _descriptionDialog = new DescriptionDialog(_gameView);

        // Start the main loop
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

    onMouseMove(e)
    {
        Input.mousePos.x = Math.floor(e.nativeEvent.offsetX / Constants.SCALE)
        Input.mousePos.y = Math.floor(e.nativeEvent.offsetY / Constants.SCALE)
    }

    onMouseDown(e)
    {
        Input.mouseDown = true
    }

    onMouseUp(e)
    {
        Input.mouseDown = false
    }

    endTurn()
    {
        // Progress to opponent turn
    }

    render()
    {
        return (
            <div className="GameScreen">
                <canvas ref="glCanvas" onMouseDown={this.onMouseDown.bind(this)} onMouseUp={this.onMouseUp.bind(this)} onMouseMove={this.onMouseMove.bind(this)} width={Constants.WIDTH * Constants.SCALE} height={Constants.HEIGHT * Constants.SCALE}></canvas> 
            </div>
        )
    }
}

export default GameScreen;
