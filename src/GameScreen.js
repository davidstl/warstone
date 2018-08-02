import React, { Component } from 'react'
import './GameScreen.css'

let TurnBasedService = require("./game/TurnBasedService")
let Constants = require("./game/Constants")
let Renderer = require("./game/Renderer")
let GameView = require("./game/GameView")
let Input = require("./game/Input")
let Config = require("./game/Config")
let GameState = require("./game/GameState")
let EndTurnButton = require("./game/EndTurnButton")
let DrawButton = require("./game/DrawButton")
let Dialog = require("./game/Dialog")
let DescriptionDialog = require("./game/DescriptionDialog")
let Card = require("./game/Card")
let SpriteNode = require("./game/SpriteNode")
let Resources = require("./game/Resources")

let FRAME_RATE = 60

function safeRemove(array, item)
{
    let index = array.indexOf(item)
    if (index > -1) array.splice(index, 1)
}

// Props:
//  user
//  lobby
//  server
//  onClose()
class GameScreen extends Component
{
    constructor()
    {
        super()

        this._service = null // Service that talks to the server
        this._gameState = null // The actual game data
        this._intervaleId = null // Update/Render main loop logic
        this._gameView = null // Scene graph (more like array of sprites in draw order)
        this._config = null // Server config for game (Decks, draw cost, etc)

        // Players
        this._myPlayer = null // We are always at the bottom of the screen
        this._opponentPlayer = null // At the top of the screen
        this._currentTurnPlayer = null

        // Actions and replaying stuff
        this._replayActionQueue = []
        this._replayDelay = 0

        // State stuff
        this._state = Constants.GameState.IDLE
        this._spellCard = null
        this._attackingCard = null
        this._firstTurn = true
        this._gameEnded = false // Hum, shoud probably be a state
        this._turnCompleted = true
        this._cardDrawed = 0
        this._turnTimer = 0

        // Extra UI stuff
        this._endTurnBtn = null
        this._drawButton = null
        this._dialog = null
        this._descriptionDialog = null
    }

    componentDidMount()
    {
        this._service = new TurnBasedService(this.props.user.id, this.props.lobby, this.props.server,
            this.onNextTurn.bind(this),
            this.onDraw.bind(this),
            this.onVictory.bind(this),
            this.onDefeat.bind(this),
            this.onClose.bind(this))
    }

    onNextTurn(user, gameStateJson)
    {
        // Update the gamestate
        if (this.onGameState(gameStateJson))
        {
            this._currentTurnPlayer = this._gameState.getPlayer(user.profileId)

            // Reset some stuff
            if (this._firstTurn)
            {
                // Draw initial cards
                this.drawInitialCards()

                // This is called from the service thread, so we can sleep here before starting the game and drawing the first card
                setTimeout(this.handleTurnTransition.bind(this, gameStateJson), 250 * 3 + 500)
            }
            else
            {
                this.handleTurnTransition(gameStateJson)
            }
        }
    }

    onDraw(gameState)
    {
        this.onGameState(gameState)
        this.queueEndDialog("draw")
        this.handleTurnTransition(gameState)
    }

    onVictory(gameState, winners)
    {
        this.onGameState(gameState)
        this.queueEndDialog("victory")
        this.handleTurnTransition(gameState)
    }

    onDefeat(gameState, winners)
    {
        this.onGameState(gameState)
        this.queueEndDialog("defeat")
        this.handleTurnTransition(gameState)
    }

    onClose(gameState, reason)
    {
        if (gameState)
        {
            this.onGameState(gameState)
        }
        this.queueEndDialog(reason)
        if (gameState)
        {
            this.handleTurnTransition(gameState)
        }
        else
        {
            this._state = Constants.GameState.END_DIALOG
        }
    }

    mainLoop()
    {
        let dt = 1 / FRAME_RATE

        if (this._gameState)
        {
            this._gameState.update(dt)
        }
        if (this._gameView)
        {
            this._gameView.update(dt)
        }

        if (this._state !== Constants.GameState.IDLE)
        {
            this._turnTimer = Math.max(this._turnTimer - dt, 0.0)
            this._gameView.updateRibbon(this._turnTimer / 60.0)
            if (this._turnTimer === 0.0 && this._state !== Constants.GameState.OPPONENT_TURN)
            {
                this.endMyTurn()
            }
        }

        switch (this._state)
        {
            case Constants.GameState.OPPONENT_TURN:
            {
                this._replayDelay -= dt;
                if (this._replayDelay <= 0.0)
                {
                    if (!this.replayNextAction(this._opponentPlayer))
                    {
                        if (this._gameEnded) // Magic bools!
                        {
                            this._state = Constants.GameState.END_DIALOG
                            this._dialog.show()
                            return
                        }
                    }
                }
                break;
            }
            default:
                break;
        }

        // Show card description
        if (this._gameView.getHovered() instanceof Card)
        {
            let hoveredCard = this._gameView.getHovered()
            if (hoveredCard && !hoveredCard.isBackFaced())
            {
                this._descriptionDialog.show(hoveredCard)
            }
            else
            {
                this._descriptionDialog.hide()
            }
        }
        else
        {
            this._descriptionDialog.hide()
        }

        if (this._gameView)
        {
            this._gameView.renderView()
        }
    }

    onDrawClicked()
    {
        // Is it my turn? No? Ignore it
        if (this._state === Constants.GameState.OPPONENT_TURN ||
            this._state === Constants.GameState.END_DIALOG) return;

        if (this._myPlayer.getEnergy() < this._config.DrawCost)
        {
            // Not enough energy to draw a card
            return;
        }

        this.drawNextCard(this._myPlayer)
    }

    onPlayerClicked(clickedPlayer)
    {
        if (this._state !== Constants.GameState.ATTACKING) return;
        if (clickedPlayer !== this._opponentPlayer) return;
        if (!this._attackingCard) return;

        // Battle
        this.attackPlayer(this._myPlayer, this._attackingCard, clickedPlayer)
        this.setState(Constants.GameState.PICKING)
    }

    onCardClicked(clickedCard)
    {
        // Is it my turn? No? Ignore it
        if (this._state === Constants.GameState.OPPONENT_TURN ||
            this._state === Constants.GameState.END_DIALOG) return;

        // Is this card in hand?
        let hand = this._myPlayer.getHand()
        for (let i = 0; i < hand.length; ++i)
        {
            let card = hand[i]
            if (card === clickedCard)
            {
                // Cancel the attacking card
                this.setState(Constants.GameState.PICKING)

                if (card.getType().Cost > this._myPlayer.getEnergy())
                {
                    // Not enough energy to play that card
                    return;
                }

                if (card.getType().id === "SkipTurnSpell")
                {
                    if (this._spellCard == null)
                    {
                        this.castSpell(this._myPlayer, card);
                    }
                    return;
                }

                if (this._myPlayer.getBoard().length >= this._config.MaxOnBoard)
                {
                    // Too many cards on board already
                    return;
                }

                // Place the card on the board
                this.placeCard(this._myPlayer, card)
                return;
            }
        }

        // Is it a card on the board?
        let board = this._myPlayer.getBoard()
        for (let i = 0; i < board.length; ++i)
        {
            let card = board[i]
            if (card === clickedCard)
            {
                if (card === this._attackingCard)
                {
                    this.setState(Constants.GameState.PICKING) // Cancel attack state
                }
                else if (!card.getMoved())
                {
                    this.setState(Constants.GameState.ATTACKING)
                    this._attackingCard = card
                }
                return;
            }
        }

        // Are we attacking an enemy card?
        if (this._state === Constants.GameState.ATTACKING && this._attackingCard != null)
        {
            board = this._opponentPlayer.getBoard()
            for (let i = 0; i < board.length; ++i)
            {
                let card = board[i]
                if (card === clickedCard)
                {
                    // Battle
                    this.attackCard(this._myPlayer, this._attackingCard, card)
                    this.setState(Constants.GameState.PICKING)
                }
            }
        }
    }
    
    onDialogOkClicked()
    {
        // Kill it all
        this.props.onClose()
    }

    onGameState(gameStateJson)
    {
        if (!gameStateJson) return false
        if (!this._gameState)
        {
            this._config = new Config(gameStateJson.config)

            this.initialize()

            this._gameView.setInverted(gameStateJson.player1.id === this.props.user.id)
            this._gameState = new GameState(this._gameView, this, this._config)
            this._gameState.deserialize(gameStateJson, this._config)
            this._myPlayer = this._gameState.getPlayer(this.props.user.id)
            this._opponentPlayer = (this._gameState.getPlayer1() === this._myPlayer) ? this._gameState.getPlayer2() : this._gameState.getPlayer1()
        }
        this._gameState.deserializeDecks(gameStateJson);

        if (this._state !== Constants.GameState.OPPONENT_TURN)
        {
            this._drawButton.setEnabled(true)
        }

        return true
    }

    initialize()
    {
        Renderer.initialize(this.refs.glCanvas)
        this._gameView = new GameView()
        this._gameView.onClicked = this.onBGClicked.bind(this)

        // Decks sprites on the left
        for (let i = 0; i < 3; ++i)
        {
            this._gameView.addSpriteNode(new SpriteNode(Resources._sprite_redCardBack, {x:Constants.TOP_DECK_POS.x - i * 4, y:Constants.TOP_DECK_POS.y - i * 3}, Constants.DRAW_ORDER_DECK + i))
            this._gameView.addSpriteNode(new SpriteNode(Resources._sprite_blueCardBack, {x:Constants.BOTTOM_DECK_POS.x - i * 4, y:Constants.BOTTOM_DECK_POS.y - i * 3}, Constants.DRAW_ORDER_DECK + i))
        }

        // Advance button on the right
        this._endTurnBtn = new EndTurnButton()
        this._endTurnBtn.onClicked = this.endMyTurn.bind(this)
        this._gameView.addSpriteNode(this._endTurnBtn)
        
        // Draw button on the left, on top of the deck
        this._drawButton = new DrawButton(this._gameView, this, this._config)
        this._dialog = new Dialog(this._gameView, this)
        this._descriptionDialog = new DescriptionDialog(this._gameView)

        // Start the main loop
        this._intervaleId = setInterval(this.mainLoop.bind(this), 1000 / FRAME_RATE)
    }

    handleTurnTransition(gameStateJson)
    {
        // Check if the packet included a previous turn to replay
        if (gameStateJson.previousTurn)
        {
            let previousUserId = gameStateJson.previousTurn.userId

            // Only replay the turn if it's not us
            if (previousUserId !== this.props.user.id)
            {
                this.queueReplayAction(this._gameState.getPlayer(previousUserId), gameStateJson.previousTurn.action)
            }
        }

        if (this._replayActionQueue.length === 0)
        {
            if (this._gameEnded) // Magic bools!
            {
                this._state = Constants.GameState.END_DIALOG
                this._dialog.show()
                return;
            }    
        }

        // Start the turn only if the replay queue is empty.
        // otherwise it will empty over frames, then start the turn
        // when playback is done
        if (this._replayActionQueue.length === 0 && this._turnCompleted)
        {
            this.startTurn(this._currentTurnPlayer)
        }
    }

    replayNextAction(player)
    {
        if (this._replayActionQueue.length === 0)
        {
            return false;
        }

        let action = this._replayActionQueue.shift()

        switch (action.action)
        {
            case "draw":
            {
                let card = player.getCard(action.cardId)
                this.drawCard(player, card)
                this._replayDelay = 0.75
                break
            }
            case "place":
            {
                let card = player.getCard(action.cardId)

                this.placeCard(player, card)
                this._replayDelay = .35 * 2.0
                break
            }
            case "spell":
            {
                let card = player.getCard(action.cardId)

                this.castSpell(player, card)
                this._replayDelay = 0.75
                break
            }
            case "attack":
            {
                let card = player.getCard(action.cardId)
                let targetCard = this._gameState.getOtherPlayer(player).getCard(action.targetCardId)

                this.attackCard(player, card, targetCard)
                this._replayDelay = 0.75
                break
            }
            case "attackPlayer":
            {
                let card = player.getCard(action.cardId);

                this.attackPlayer(player, card, this._gameState.getOtherPlayer(player))
                this._replayDelay = 0.75
                break
            }
            case "advance":
            {
                this.startTurn(this._currentTurnPlayer)
                break;
            }
            default:
                this._replayDelay = 0.0
                break;
        }

        return this._replayActionQueue.length > 0
    }

    queueReplayAction(player, action)
    {
        this._replayActionQueue.push(action)
    }

    drawInitialCardsForPlayer(player)
    {
        let hand = player.getHand()
        let newHand = [...hand]
        hand.splice(0, hand.length)

        for (let i = 0; i < newHand.length; ++i)
        {
            let card = newHand[i]
            card.moveFromDeckToHand(i * 0.25)
        }
    }

    drawInitialCards()
    {
        this.drawInitialCardsForPlayer(this._gameState.getTopPlayer(this.props.user.id))
        this.drawInitialCardsForPlayer(this._gameState.getBottomPlayer(this.props.user.id))
    }

    drawNextCard(player)
    {
        let deck = this._myPlayer.getDeck()
        let card = deck.shift()
        this.drawCard(player, card)
    }

    drawCard(player, card)
    {
        card.moveFromDeckToHand(0)

        if (this._cardDrawed >= this._config.DrawCountOnTurn)
        {
            player.setEnergy(player.getEnergy() - this._config.DrawCost);
        }
        this._cardDrawed++;

        if (player === this._myPlayer)
        {
            this.submitAction({
                action: "draw",
                cardId: card._id
            });
        }
    }

    placeCard(player, card)
    {
        player.setEnergy(player.getEnergy() - card.getType().Cost)
        card.setMoved(true)

        safeRemove(player.getDeck(), card) // Make sure it's not in the deck
        if (!player.getHand().includes(card)) player.getHand().push(card) // Make sure it's in the hand
        card.moveFromHandToBoard(0.0)

        if (player === this._myPlayer)
        {
            this.submitAction({
                action: "place",
                cardId: card._id
            })
        }
    }
    
    attackCard(player, attacker, defender)
    {
        // Battle!
        attacker.attackCard(defender, 0.0)

        if (player === this._myPlayer)
        {
            this.submitAction({
                action: "attack",
                cardId: attacker._id,
                targetCardId: defender._id
            })
        }
    }

    attackPlayer(player, attacker, defender)
    {
        attacker.attackPlayer(defender, 0.0)

        if (player === this._myPlayer)
        {
            this.submitAction({
                action: "attackPlayer",
                cardId: attacker._id
            })
        }
    }
    
    castSpell(player, card)
    {
        player.setEnergy(player.getEnergy() - card.getType().Cost)

        card.moveFromHandToSpell(0)
        this._spellCard = card

        if (player === this._myPlayer)
        {
            this.submitAction({
                action: "spell",
                cardId: card._id
            })
        }
    }
    
    startTurn(player)
    {
        if (this._gameEnded) // Magic bools!
        {
            this._state = Constants.GameState.END_DIALOG
            this._dialog.show()
            return;
        }

        this._cardDrawed = 0
        this._turnTimer = 60.0

        if (player === this._myPlayer)
        {
            this.startMyTurn()
        }
        else
        {
            this.startOpponentTurn()
        }
    }

    resetMovesForPlayer(player)
    {
        let board = player.getBoard()
        for (let i = 0; i < board.length; ++i)
        {
            let card = board[i]
            card.setMoved(false)
        }
    }

    resetMoves()
    {
        this.resetMovesForPlayer(this._myPlayer)
        this.resetMovesForPlayer(this._opponentPlayer)
    }

    startMyTurn()
    {
        if (!this._firstTurn)
        {
            // Increment energy
            let energyCap = this._myPlayer.getEnergyCap()
            energyCap++
            this._myPlayer.setEnergyCap(energyCap)
            this._myPlayer.setEnergy(energyCap)
        }
        this._firstTurn = false
        this._turnCompleted = false

        this.resetMoves()
        this.setState(Constants.GameState.PICKING)

        // Draw a card from the deck
        for (let i = 0; i < this._config.DrawCountOnTurn; ++i)
        {
            this.drawNextCard(this._myPlayer)
        }
    }

    startOpponentTurn()
    {
        console.log("Start opponent turn")
        if (!this._firstTurn)
        {
            // Increment energy
            let energyCap = this._opponentPlayer.getEnergyCap()
            energyCap++;
            this._opponentPlayer.setEnergyCap(energyCap)
            this._opponentPlayer.setEnergy(energyCap)
        }
        this._firstTurn = false

        this.resetMoves()
        this.setState(Constants.GameState.OPPONENT_TURN)
    }

    submitAction(action)
    {
        this._service.submitTurn({
            action: action
        })
    }
    
    endMyTurn()
    {
        this.submitAction({
            action: "advance"
        });

        this._turnCompleted = true
        this._currentTurnPlayer = null
        this.setState(Constants.GameState.OPPONENT_TURN)
    }

    queueEndDialog(message)
    {
        this._dialog.setMessage(message)
        this._gameEnded = true
    }
    
    setState(state)
    {
        this._state = state;

        let board = this._myPlayer.getBoard()
        for (let i = 0; i < board.length; ++i)
        {
            let card = board[i]
            card.setEnabled(this._state === Constants.GameState.PICKING && !card.getMoved())
        }

        board = this._opponentPlayer.getBoard()
        let hasTaunts = !board.every(card => !card.getType().Taunt)
        
        for (let i = 0; i < board.length; ++i)
        {
            let card = board[i]
            if (card.getType().Taunt === hasTaunts || !hasTaunts)
            {
                card.setEnabled(this._state === Constants.GameState.ATTACKING)
            }
        }
        if (!hasTaunts)
        {
            this._opponentPlayer.setEnabled(this._state === Constants.GameState.ATTACKING);
        }

        if (this._attackingCard != null && this._state !== Constants.GameState.ATTACKING)
        {
            this._attackingCard = null;
        }

        this._endTurnBtn.setEnabled(this._state !== Constants.GameState.OPPONENT_TURN);
        this._drawButton.setEnabled(this._state !== Constants.GameState.OPPONENT_TURN);
    }
    
    onBGClicked()
    {
        if (this._state === Constants.GameState.ATTACKING)
        {
            this.setState(Constants.GameState.PICKING)
        }
    }
    
    isMyTurn()
    {
        return (this._state !== Constants.GameState.OPPONENT_TURN);
    }

    componentWillUnmount()
    {
        if (this._intervaleId)
        {
            clearInterval(this._intervaleId)
        }
    }
    
    hasEnoughEnergy(cost)
    {
        return this._myPlayer.getEnergy() >= cost
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

    render()
    {
        return (
            <div className="GameScreen">
                <canvas ref="glCanvas" 
                        onMouseDown={this.onMouseDown.bind(this)} 
                        onMouseUp={this.onMouseUp.bind(this)} 
                        onMouseMove={this.onMouseMove.bind(this)} 
                        width={Constants.WIDTH * Constants.SCALE} 
                        height={Constants.HEIGHT * Constants.SCALE}/>
            </div>
        )
    }
}

export default GameScreen;
