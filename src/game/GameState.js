let Constants = require('./Constants')
let Player = require('./Player')
let Resources = require('./Resources')
let SpriteNode = require('./SpriteNode')

module.exports = class GameState
{
    constructor(gameView, game, config)
    {
        this._player1 = null
        this._player2 = null
        this._gameView = null

        this._gameView = gameView

        // Create uninitialized players
        this._player1 = new Player(!this._gameView.isInverted(), this._gameView, game, config)
        this._player2 = new Player(this._gameView.isInverted(), this._gameView, game, config)
    }

    getPlayer1()
    {
        return this._player1
    }

    getPlayer2()
    {
        return this._player2
    }

    getPlayer(userId)
    {
        if (this._player1.getId() === userId) return this._player1
        if (this._player2.getId() === userId) return this._player2
        return null
    }

    // Get top player from myUserId perspective
    getTopPlayer(myUserId)
    {
        return (this._player1.getId() === myUserId) ? this._player2 : this._player1
    }

    // Get bottom player from myUserId perspective
    getBottomPlayer(myUserId)
    {
        return (this._player1.getId() === myUserId) ? this._player1 : this._player2
    }

    // Get opponent player of "player"
    getOtherPlayer(player)
    {
        return this._player1 == player ? this._player2 : this._player1
    }

    // Deserialize server's game state. This will override all current states
    deserialize(gameStateJson, config)
    {
        this._player1.deserialize(gameStateJson.player1, config)
        this._player2.deserialize(gameStateJson.player2, config)
    }

    // Deserialize only player's deck
    deserializeDecks(gameStateJson)
    {
        this._player1.deserializeDecks(gameStateJson.player1)
        this._player2.deserializeDecks(gameStateJson.player2)
    }

    update(dt)
    {
        this._player1.update(dt);
        this._player2.update(dt);
    }
}
