let Constants = require('./Constants')
let Resources = require('./Resources')
let Sprite = require('./Sprite')
let SpriteNode = require('./SpriteNode')
let EnergyMeter = require('./EnergyMeter')
let Card = require('./Card')

module.exports = class Player extends SpriteNode
{
    constructor(isTopPlayer, gameView, game, config)
    {
        super()

        this._id = null
        this._name = ""
        this._hp = 30 // This is set by the first gamestate from the server anyway
        this._energy = -1
        this._energyCap = -1
        this._cards = []
        this._deck = []
        this._hand = []
        this._discarded = []
        this._board = []

        this._energyMeter = null
        this._gameView = gameView
        this._game = game
        this._config = config
        this._isTopPlayer = isTopPlayer

        this.setSprite(Resources._sprite_playerUp)
        if (this._isTopPlayer)
        {
            this.setPosition({x:Constants.WIDTH - Resources._sprite_playerUp.width - 1, y:1});
        }
        else
        {
            this.setPosition({x:Constants.WIDTH - Resources._sprite_playerUp.width - 1, y:Constants.HEIGHT - Resources._sprite_playerUp.height - 1});
        }

        this.setDrawOrder(Constants.DRAW_ORDER_NAME);
        this._gameView.addSpriteNode(this);

        this._energyMeter = new EnergyMeter(isTopPlayer, gameView);
        this._energyMeter.setDrawOrder(Constants.DRAW_ORDER_NAME);
        this._gameView.addSpriteNode(this._energyMeter);
    }

    getCard(cardId)
    {
        return this._cards[cardId]
    }

    getDeck()
    {
        return this._deck
    }

    getHand()
    {
        return this._hand
    }

    getDiscarded()
    {
        return this._discarded
    }

    getBoard()
    {
        return this._board
    }

    getId()
    {
        return this._id
    }

    getName()
    {
        return this._name
    }

    getHP()
    {
        return this._hp
    }

    getEnergy()
    {
        return this._energy
    }

    setEnergy(energy)
    {
        this._energy = energy
        this._energyMeter.set(this._energy, this._energyCap)
    }

    getEnergyCap()
    {
        return this._energyCap
    }

    setEnergyCap(energyCap)
    {
        this._energyCap = energyCap
        this._energyMeter.set(this._energy, this._energyCap)
    }

    damage(damage)
    {
        this._hp = Math.max(0, this._hp - damage)
    }

    deserialize(playerJson, config)
    {
        this._id = playerJson.id
        this._name = playerJson.name
        this._hp = playerJson.hp
        this._energy = playerJson.energy
        this._energyCap = playerJson.energyCap

        this._energyMeter.set(this._energy, this._energyCap)
        
        for (let i = 0; i < config.deck.length; ++i)
        {
            let cardType = config.deck[i]
            let card = new Card(i, cardType, this._isTopPlayer, this._hand, this._board, this._gameView, this._game, this._config, this)
            this._cards.push(card)
        }

        this.deserializePile(this._deck, playerJson.deck)
        this.deserializePile(this._hand, playerJson.hand)
        this.deserializePile(this._discarded, playerJson.discarded)
        this.deserializePile(this._board, playerJson.board)
    }

    deserializeDecks(playerJson)
    {
        this.deserializePile(this._deck, playerJson.deck);
    }

    update(dt)
    {
        // Update cards
        this._cards.forEach(card => card.update(dt))

        // Update hand
        this.updateHand(dt);
    }

    drawInfo()
    {
        // Draw name + HP
        let playerName = this._name.substr(0, Math.min(11, this._name.length));
        if (this._isTopPlayer)
        {
            this._gameView.drawText({x:272, y:23}, playerName, Constants.NAME_COLOR);
            this.drawHealth({x:272, y:23 + 6}, this._hp);
        }
        else
        {
            this._gameView.drawText({x:272, y:213}, playerName, Constants.NAME_COLOR);
            this.drawHealth({x:272, y:213 - 7}, this._hp);
        }
    }

    drawAttackArrow()
    {
        if (!this._isTopPlayer) return;
        if (this.isEnabled())
        {
            let pos = this.getPosition();
            Sprite.renderPos(Resources._sprite_attackArrow, {
                x:pos.x + Resources._sprite_playerUp.width / 2 - Resources._sprite_attackArrow.width / 2,
                y:pos.y + Resources._sprite_playerUp.height - Resources._sprite_attackArrow.height / 3 + Math.sin(this._gameView.anim * 8.0) - 0.5
            })
        }
    }

    render()
    {
        Sprite.renderPos(Resources._sprite_playerUp, this.getPosition())
        this.drawInfo();
        this.drawAttackArrow();
    }

    renderHover()
    {
        Sprite.renderPos(Resources._sprite_playerHover, this.getPosition())
        this.drawInfo();
        this.drawAttackArrow();
    }

    renderDown()
    {
        Sprite.renderPos(Resources._sprite_playerDown, this.getPosition())
        this.drawInfo();
        this.drawAttackArrow();
    }

    // A pile is a deck, hand or discarded. A pile of card
    deserializePile(pile, pileJson)
    {
        pile.splice(0, pile.length)
        pileJson.forEach(cardId =>
        {
            let card = this.getCard(cardId)
            card.reset()
            pile.push(card)
        })
    }

    updateHand(dt)
    {
        // Card hovering effect in hand
        if (!this._isTopPlayer)
        {
            let hovered = this._gameView.getHovered()
            let offsetAmount = 0.0
            for (let i = 0; i < this._hand.length; ++i)
            {
                let card = this._hand[i]
                let screenPos = card.handIndexToScreen(i, this._hand.length)
                let diff = this._isTopPlayer ? (Constants.TOP_HAND_POS.y - screenPos.y) : (screenPos.y - Constants.BOTTOM_HAND_POS.y)
                if (card === hovered)
                {
                    offsetAmount = 20.0 // Will shift following cards in hand
                    card.setHandOffset({x:0, y:-21 - diff}) // Move our card up for better visibility
                    continue;
                }
                card.setHandOffset({x:offsetAmount, y:0})
                offsetAmount *= .8 // The further we go on the hand after the highlighted card, the less we offset
            }
        }

        // Clean up draw order
        for (let i = 0; i < this._hand.length; ++i)
        {
            let card = this._hand[i]
            if (!this._isTopPlayer && card === this._gameView.getHovered())
            {
                card.setDrawOrder(Constants.DRAW_ORDER_BOTTOM_HAND + this._hand.length + 1);
            }
            else
            {
                card.setDrawOrder((this._isTopPlayer ? Constants.DRAW_ORDER_TOP_HAND : Constants.DRAW_ORDER_BOTTOM_HAND) + i);
            }
        }
    }

    drawHealth(position, hp)
    {
        let color = Constants.HEALTY_COLOR;
        if (hp <= 25) color = Constants.HURT_COLOR;
        if (hp <= 15) color = Constants.DANGER_COLOR;

        let offset = this._gameView.drawNumbers(position, hp, color);
        offset += 2;
        Sprite.renderPos(Resources._sprite_HP, {x:offset, y:position.y})
    }
    
    onClicked()
    {
        this._game.onPlayerClicked(this);
    }
}
