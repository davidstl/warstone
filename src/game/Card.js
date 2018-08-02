let Constants = require('./Constants')
let Resources = require('./Resources')
let Sprite = require('./Sprite')
let SpriteNode = require('./SpriteNode')

function safeRemove(array, item)
{
    let index = array.indexOf(item)
    if (index > -1) array.splice(index, 1)
}

module.exports = class Card extends SpriteNode
{
    constructor(id, type, isTopPlayer, hand, board, gameView, game, config)
    {
        super()

        this._id = null
        this._type = null
        this._hp = 0

        this._isTopPlayer = false // This card is owned by the top player. The opponent
        this._gameView = null
        this._game = null
        this._hand = null // The player's hand. We keep a refence on it so we can insert ourself in it. Probably a bad design
        this._board = null // The player's board. We keep a refence on it so we can insert ourself in it. Probably a bad design
        this._cardArt = null
        this._showNoSleepBuff = false

        // State stuff
        this._state = Constants.CardState.IDLE
        this._backFaced = true // Back face is shown and not the card's value
        this._moved = false // Has been placed or have attacked
        this._targetCard = null
        this._targetPlayer = null
        this._config = null

        // Animation stuff
        this._startPosition = {x:0, y:0}
        this._targetPosition = {x:0, y:0}
        this._moveProgress = 0
        this._moveDuration = 0
        this._delay = 0.0
        this._handOffset = {x:0, y:0}

        this._hand = hand
        this._board = board
        this._id = id
        this._type = type
        this._gameView = gameView
        this._isTopPlayer = isTopPlayer
        this._game = game
        this._config = config
        if (Resources._sprite_cardArtMap[type.Art])
        {
            this._cardArt = Resources._sprite_cardArtMap[type.Art]
        }

        // Just for dimension, we actually override the sprite's render function bellow.
        this.setSprite(Resources._sprite_blueCardBack)
    }

    isBackFaced()
    {
        return this._backFaced
    }

    reset()
    {
        this._backFaced = true
        this._state = Constants.CardState.IDLE
    }

    isTopPlayer()
    {
        return this._isTopPlayer
    }

    getState()
    {
        return this._state
    }

    getMoved()
    {
        return this._moved
    }

    setMoved(moved)
    {
        this._moved = moved;
        if (this._showNoSleepBuff && !moved)
            this._showNoSleepBuff = false
    }

    // For moving card away when hovering someting in the hand
    setHandOffset(offset)
    {
        this._handOffset = {...offset}
    }

    getId()
    {
        return this._id
    }

    getType()
    {
        return this._type
    }

    getHP()
    {
        return this._hp
    }

    setHP(hp)
    {
        this._hp = hp
    }

    damage(damage)
    {
        this._hp = Math.max(0, this._hp - damage)
    }

    attackerDamage(attacker)
    {
        let attackerDamage = attacker._hp
        let defenderDamage = this._hp

        // Probably could use a matrix here like we do on the server
        if ((attacker._type.Suit === "ROCK" && this._type.Suit === "SCISSORS") ||
            (attacker._type.Suit === "PAPER" && this._type.Suit === "ROCK") ||
            (attacker._type.Suit === "SCISSORS" && this._type.Suit === "PAPER"))
        {
            attackerDamage *= 2
            defenderDamage /= 2
        }
        else if ((this._type.Suit === "ROCK" && attacker._type.Suit === "SCISSORS") ||
            (this._type.Suit === "PAPER" && attacker._type.Suit === "ROCK") ||
            (this._type.Suit === "SCISSORS" && attacker._type.Suit === "PAPER"))
        {
            attackerDamage /= 2
            defenderDamage *= 2
        }

        this.damage(attackerDamage)
        attacker.damage(defenderDamage)
    }

    // Animate the card away to the discarded pile
    discard(delay)
    {
        safeRemove(this._hand, this)
        safeRemove(this._board, this)
        this._delay = delay
        this._startPosition = {...this.getPosition()}
        this._targetPosition = this._isTopPlayer ? {...Constants.TOP_DISCARDED_POS} : {...Constants.BOTTOM_DISCARDED_POS}
        this.setDrawOrder(Constants.DRAW_ORDER_MOVING_CARD)
        this._moveDuration = 0.5
        this._moveProgress = 0.0
        this._state = Constants.CardState.MOVING_TO_DISCARD
        this.setEnabled(false)
    }

    // Animate the card from deck to hand
    moveFromDeckToHand(delay)
    {
        this._delay = delay
        this._hp = this._type.HP
        this.setPosition(this._isTopPlayer ? Constants.TOP_DECK_POS : Constants.BOTTOM_DECK_POS)
        this._startPosition = {...this.getPosition()}
        this._targetPosition = {...this.handIndexToScreen(this._hand.length, this._hand.length + 1)}
        this.setDrawOrder(Constants.DRAW_ORDER_MOVING_CARD)
        this._gameView.addSpriteNode(this)
        this._moveDuration = 0.5
        this._moveProgress = 0.0
        this._state = Constants.CardState.MOVING_TO_HAND
    }

    // Animate the card from place back to hand
    moveFromPlaceToHand(delay)
    {
        this._delay = delay
        this._startPosition = {...this.getPosition()}
        this._targetPosition = {...this.handIndexToScreen(this._hand.length, this._hand.length + 1)}
        this.setDrawOrder(Constants.DRAW_ORDER_MOVING_CARD)
        this._moveDuration = 0.5
        this._moveProgress = 0.0
        this._state = Constants.CardState.MOVING_TO_HAND;
        this.setEnabled(false)
    }

    // Animate the card from hand to place
    moveFromHandToPlace(delay)
    {
        safeRemove(this._hand, this)
        this._delay = delay
        this._startPosition = {...this.getPosition()}
        this._targetPosition = {...(this._isTopPlayer ? Constants.TOP_PLACE_POS : Constants.BOTTOM_PLACE_POS)}
        this.setDrawOrder(Constants.DRAW_ORDER_MOVING_CARD)
        this._moveDuration = 0.5
        this._moveProgress = 0.0
        this._state = Constants.CardState.MOVING_TO_PLACE;
        this.setEnabled(false)
    }

    // Animate the card from hand to spell (Opponent's place)
    moveFromHandToSpell(delay)
    {
        safeRemove(this._hand, this)
        this._delay = delay
        this._startPosition = {...this.getPosition()}
        this._targetPosition = {...(this._isTopPlayer ? Constants.BOTTOM_PLACE_POS : Constants.TOP_PLACE_POS)}
        this.setDrawOrder(Constants.DRAW_ORDER_MOVING_CARD)
        this._moveDuration = 0.5
        this._moveProgress = 0.0
        this._state = Constants.CardState.MOVING_TO_SPELL
        this.setEnabled(false)
    }

    // Animate the card from hand to a cell where it will slide in.
    moveFromHandToBoard(delay)
    {
        safeRemove(this._hand, this)
        this._delay = delay
        this._startPosition = {...this.getPosition()}
        this._targetPosition = {...this.boardIndexToScreen(this._board.length, this._board.length + 1)}
        if (!this._board.includes(this)) this._board.push(this)
        this._gameView.addSpriteNode(this)
        this.setDrawOrder(Constants.DRAW_ORDER_MOVING_CARD)
        this._moveDuration = 0.35
        this._moveProgress = 0.0
        this._moved = this._type.SleepOnStartTurns > 0 ? true : false
        this._state = Constants.CardState.MOVING_TO_BOARD
        this.setEnabled(false)
        this._showNoSleepBuff = this._type.SleepOnStartTurns === 0 ? true : false
    }

    attackCard(targetCard, delay)
    {
        this._delay = delay
        this._startPosition = {...this.getPosition()}
        this._targetPosition = {...targetCard.getPosition()}
        this.setDrawOrder(Constants.DRAW_ORDER_MOVING_CARD);
        this._moveDuration = 0.35
        this._moveProgress = 0.0
        this._targetCard = targetCard
        this._state = Constants.CardState.MOVING_TO_ATTACK_CARD
        this._moved = true
        this.setEnabled(false)
    }

    attackPlayer(targetPlayer, delay)
    {
        this._delay = delay
        this._startPosition = {...this.getPosition()}
        this._targetPosition = {...targetPlayer.getPosition()}
        this.setDrawOrder(Constants.DRAW_ORDER_MOVING_CARD)
        this._moveDuration = 0.35
        this._moveProgress = 0.0
        this._targetPlayer = targetPlayer
        this._state = Constants.CardState.MOVING_TO_ATTACK_PLAYER
        this._moved = true
        this.setEnabled(false)
    }

    getHandSpacing(handSize)
    {
        let bw = 227.0 - Resources._sprite_blueCardBack.width
        let spacing = Math.max(5, Math.min(Constants.HAND_SPACING, Math.floor(bw / handSize)))
        return spacing
    }

    // Get screen position if the card were at index of a hand of size handsize
    handIndexToScreen(index, handSize)
    {
        let spacing = this.getHandSpacing(handSize);
        let pos = {...(this._isTopPlayer ? Constants.TOP_HAND_POS : Constants.BOTTOM_HAND_POS)}
        pos.x -= (handSize * spacing + (Resources._sprite_blueCardBack.width - spacing)) / 2
        pos.x += index * spacing
        let offset = 0.0
        if (handSize % 2 === 0)
        {
            offset = 0.5
        }
        else
        {
            offset = 0.5
        }
        let angle = (index - handSize / 2.0 + offset) / (handSize / 2.0)
        if (this._isTopPlayer)
            pos.y += (Math.cos(angle) * 20.0) - 15
        else
            pos.y -= (Math.cos(angle) * 20.0) - 15

        return pos
    }

    // Get screen position if the card were at index of a board of size boardsize
    boardIndexToScreen(index, boardSize)
    {
        let pos = {...(this._isTopPlayer ? Constants.TOP_BOARD_POS : Constants.BOTTOM_BOARD_POS)}
        pos.x -= (boardSize * Constants.BOARD_SPACING + (Resources._sprite_blueCardBack.width - Constants.BOARD_SPACING)) / 2
        pos.x += index * Constants.BOARD_SPACING
        return pos
    }

    drawAttackArrow()
    {
        if (!this._isTopPlayer) return;
        if (this.isEnabled())
        {
            let pos = this.getPosition()
            Sprite.renderPos(Resources._sprite_attackArrow, {
                x:pos.x + Resources._sprite_blueCardBack.width / 2 - Resources._sprite_attackArrow.width / 2,
                y:pos.y + Resources._sprite_blueCardBack.height - Resources._sprite_attackArrow.height / 3 + Math.sin(this._gameView.anim * 8.0) - 0.5
            })
        }
    }

    drawBuffs()
    {
        if (this._backFaced) return;
        let pos = {...this.getPosition()}
        pos.x += 2
        if (this._state === Constants.CardState.IN_HAND || this._state === Constants.CardState.MOVING_TO_HAND)
            pos.y += 10
        else
            pos.y += 2
        if (this._type.Taunt)
        {
            Sprite.renderPos(Resources._sprite_taunt, pos)
            pos.y += Resources._sprite_taunt.height + 1
        }
        if (this._showNoSleepBuff || 
           (((this._state === Constants.CardState.IN_HAND || this._state === Constants.CardState.MOVING_TO_HAND)) && this._type.SleepOnStartTurns === 0))
        {
            Sprite.renderPos(Resources._sprite_nosleep, pos)
            pos.y += Resources._sprite_nosleep.height + 1
        }
    }

    render()
    {
        let cardSprite = this.getCardSprite()
        Sprite.renderPosColor(cardSprite, this.getPosition(), this.getColor(false))
        this.drawArt(false)
        this.drawBuffs()
        this.drawScore()
        this.drawName()
        this.drawAttackArrow()
    }

    renderHover()
    {
        let cardSprite = this.getCardSprite()
        Sprite.renderPosColor(cardSprite, this.getPosition(), this.getColor(false))
        Sprite.renderPosColor(this.getCardHoverSprite(), this.getPosition(), this.getCardHoverColor())
        this.drawArt(false)
        this.drawBuffs()
        this.drawScore()
        this.drawName()
        this.drawAttackArrow()
    }

    renderDown()
    {
        let cardSprite = this.getCardSprite()
        Sprite.renderPosColor(cardSprite, this.getPosition(), this.getColor(false))
        this.drawArt(true)
        this.drawBuffs()
        this.drawScore()
        this.drawName()
        this.drawAttackArrow()
    }

    update(dt)
    {
        switch (this._state)
        {
            case Constants.CardState.IN_HAND:
            {
                // Constantly adjust in hand offsets
                let index = this.getHandIndex()
                this._targetPosition = this.handIndexToScreen(index, this._hand.length)
                if (index > 0)
                {
                    let prevPos = this.handIndexToScreen(index - 1, this._hand.length)
                    if (this._targetPosition.x + this._handOffset.x - prevPos.x > Constants.HAND_SPACING)
                    {
                        this._handOffset.x = Math.max(0, Constants.HAND_SPACING - this._targetPosition.x + prevPos.x)
                    }
                }
                this._targetPosition.x += this._handOffset.x
                this._targetPosition.y += this._handOffset.y
                this.updateMoveToward(dt)
                break
            }
            case Constants.CardState.ON_BOARD:
            {
                // Constantly adjust in board offsets
                let index = this.getBoardIndex()
                this._targetPosition = this.boardIndexToScreen(index, this._board.length)
                this.updateMoveToward(dt)
                break
            }
            case Constants.CardState.MOVING_TO_HAND:
            {
                if (this.updateMove(dt))
                {
                    if (!this._hand.includes(this)) this._hand.push(this)
                    this.setDrawOrder((this._isTopPlayer ? Constants.DRAW_ORDER_TOP_HAND : Constants.DRAW_ORDER_BOTTOM_HAND) + this.getHandIndex())
                    this._state = Constants.CardState.IN_HAND
                    if (!this._isTopPlayer) this.setEnabled(true)
                }
                if (this._delay <= 0.0 && !this._isTopPlayer)
                {
                    this._backFaced = false
                }
                break
            }
            case Constants.CardState.MOVING_TO_PLACE:
            {
                if (this.updateMove(dt))
                {
                    this.setDrawOrder(this._isTopPlayer ? Constants.DRAW_ORDER_TOP_PLACE : Constants.DRAW_ORDER_BOTTOM_PLACE)
                    this._state = Constants.CardState.IN_PLACE
                    if (!this._isTopPlayer) this.setEnabled(true)
                }
                break
            }
            case Constants.CardState.MOVING_TO_SPELL:
            {
                if (this.updateMove(dt))
                {
                    this.setDrawOrder(this._isTopPlayer ? Constants.DRAW_ORDER_BOTTOM_PLACE : Constants.DRAW_ORDER_TOP_PLACE)
                    this._state = Constants.CardState.IN_SPELL
                }
                if (this._delay <= 0.0 && this._isTopPlayer)
                {
                    this._backFaced = false
                }
                break
            }
            case Constants.CardState.MOVING_TO_DISCARD:
            {
                if (this.updateMove(dt))
                {
                    this._gameView.removeSpriteNode(this)
                    this._state = Constants.CardState.IDLE
                }
                break
            }
            case Constants.CardState.MOVING_TO_BOARD:
            {
                if (this.updateMoveToBoard(dt))
                {
                    this.setDrawOrder(Constants.DRAW_ORDER_BOARD)
                    this._state = Constants.CardState.ON_BOARD
                    if (!this._isTopPlayer && this._game._state !== Constants.GameState.OPPONENT_TURN)
                    {
                        this.setEnabled(true)
                    }
                }
                if (this._delay <= 0.0)
                {
                    this._backFaced = false
                }
                break
            }
            case Constants.CardState.MOVING_TO_ATTACK_PLAYER:
            {
                if (this.updateMoveToAttack(dt))
                {
                    this._targetPlayer.damage(this.getType().Attack)
                    
                    // Move back
                    this._startPosition = {...this.getPosition()}
                    let boardIndex = this.getBoardIndex()
                    this._targetPosition = this.boardIndexToScreen(boardIndex, this._board.length)
                    this.setDrawOrder(Constants.DRAW_ORDER_MOVING_CARD)
                    this._moveDuration = 0.35
                    this._moveProgress = 0.0
                    this._targetPlayer = null
                    this._state = Constants.CardState.MOVING_BACK_FROM_ATTACK
                }
                break
            }
            case Constants.CardState.MOVING_TO_ATTACK_CARD:
            {
                if (this.updateMoveToAttack(dt))
                {
                    // Do battle
                    let attackerMultiplier = this._config.suits[this.getType().Suit][this._targetCard.getType().Suit]
                    let defenderMultiplier = this._config.suits[this._targetCard.getType().Suit][this.getType().Suit]
            
                    this._targetCard.damage(Math.floor(this.getType().Attack * attackerMultiplier))
                    this.damage(Math.floor(this._targetCard.getType().Attack * defenderMultiplier))
            
                    // Destroy card
                    if (this._targetCard.getHP() === 0)
                    {
                        this._targetCard.discard(0.0)
                    }
                    
                    // Move back
                    this._startPosition = {...this.getPosition()}
                    let boardIndex = this.getBoardIndex()
                    this._targetPosition = this.boardIndexToScreen(boardIndex, this._board.length)
                    this.setDrawOrder(Constants.DRAW_ORDER_MOVING_CARD)
                    this._moveDuration = 0.35
                    this._moveProgress = 0.0
                    this._targetCard = null
                    this._state = Constants.CardState.MOVING_BACK_FROM_ATTACK
                }
                break
            }
            case Constants.CardState.MOVING_BACK_FROM_ATTACK:
            {
                if (this.updateMove(dt))
                {
                    this.setDrawOrder(Constants.DRAW_ORDER_BOARD)
                    this._state = Constants.CardState.ON_BOARD
                    if (this.getHP() === 0)
                    {
                        this.discard(0.0)
                    }
                }
                break
            }
            default:
                break
        }
    }

    onClicked()
    {
        this._game.onCardClicked(this)
    }

    getColor(isDown)
    {
        if ((this._state === Constants.CardState.ON_BOARD && this._moved) || isDown)
        {
            return Constants.DOWN_COLOR
        }
        else
        {
            return Constants.WHITE
        }
    }

    // Get the proper sprite for the card.
    getCardSprite()
    {
        if (this._backFaced)
        {
            if (this._isTopPlayer)
            {
                return Resources._sprite_redCardBack;
            }
            else
            {
                return Resources._sprite_blueCardBack;
            }
        }
        else
        {
            switch (this._type.Suit)
            {
                case "ROCK":
                    return Resources._sprite_rockCard
                case "PAPER":
                    return Resources._sprite_paperCard
                case "SCISSORS":
                    return Resources._sprite_scissorsCard
                default:
                    return null
            }
        }
    }

    getCardHoverColor()
    {
        if (this._isTopPlayer)
        {
            return Constants.CARD_HOVER_OPPONENT_COLOR
        }
        else
        {
            return Constants.CARD_HOVER_COLOR
        }
    }

    // Get the proper sprite for the card.
    getCardHoverSprite()
    {
        switch (this._type.Suit)
        {
            case "ROCK":
                return Resources._sprite_rockHoverCard
            case "PAPER":
                return Resources._sprite_paperHoverCard
            case "SCISSORS":
                return Resources._sprite_scissorsHoverCard
            default:
                return Resources._sprite_hoverCard
        }
    }

    getTextColor()
    {
        if (this._type.Suit === "ROCK")
        {
            return Constants.ROCK_CARD_NUMBER_COLOR
        }
        return Constants.CARD_NUMBER_COLOR
    }

    // Draw the card's stats
    drawScore()
    {
        if (!this._backFaced)
        {
            let pos = this.getPosition()
            let textColor = this.getTextColor()
            if (this._type.Suit === "ROCK")
            {
                textColor = Constants.ROCK_CARD_NUMBER_COLOR
            }
            if (this._type.HP > 0)
            {
                this._gameView.drawHealthStatColor({
                    x: pos.x + Resources._sprite_blueCardBack.width - 3, 
                    y: pos.y + Resources._sprite_blueCardBack.height - 10}, this._hp, true, textColor)
            }
            if (this._type.Attack > 0)
            {
                this._gameView.drawAttackStatColor({x:pos.x + 3, 
                    y:pos.y + Resources._sprite_blueCardBack.height - 10}, this._type.Attack, false, textColor);
            }
            if (this._state === Constants.CardState.IN_HAND || this._state === Constants.CardState.MOVING_TO_HAND)
            {
                this._gameView.drawEnergyStatColor({x:pos.x + 3, y:pos.y + 3}, this._type.Cost, false, textColor,
                    !this._isTopPlayer && this._game.isMyTurn() && this._game.hasEnoughEnergy(this._type.Cost))
            }
        }
    }

    // Draw the name of the card
    drawName()
    {
        if (!this._backFaced)
        {
            let lines = this._type.Name.split(" ")
            let pos = {...this.getPosition()}
            pos.x += Resources._sprite_blueCardBack.width / 2
            pos.y += 44
            let that = this
            lines.forEach(line =>
            {
                that._gameView.drawText(
                    {x:pos.x - line.length * 2, y:pos.y},
                    line, that.getTextColor())
                pos.y += 5
            })
        }
    }

    drawArt(isDown)
    {
        if (!this._backFaced && this._cardArt != null)
        {
            let pos = this.getPosition()
            Sprite.renderPosColor(this._cardArt, {
                x:pos.x + Resources._sprite_blueCardBack.width / 2 - this._cardArt.width / 2,
                y:pos.y + 11}, this.getColor(isDown))
        }
    }

    // Helper function to do nice animation.
    easeBoth(percent)
    {
        // Ease both ways
        if (percent < 0.5)
        {
            percent = percent * percent * 2.0
        }
        else
        {
            let clamped = (percent - 0.5) * 2.0
            let inv = 1 - clamped
            clamped = 1 - inv * inv
            percent = clamped * 0.5 + 0.5
        }
        return percent
    }

    easeIn(percent)
    {
        return percent * percent
    }

    easeOut(percent)
    {
        return 1 - (1 - percent) * (1 - percent)
    }

    // Update movement animation
    updateMove(dt)
    {
        if (this._delay > 0.0)
        {
            this._delay -= dt
            return false
        }
        this._moveProgress += dt
        let percent = this.easeBoth(Math.min(1.0, this._moveProgress / this._moveDuration))
        let newPos = {
            x:this._startPosition.x + (this._targetPosition.x - this._startPosition.x) * percent, 
            y:this._startPosition.y + (this._targetPosition.y - this._startPosition.y) * percent}
        this.setPosition(newPos)
        return (percent >= 1.0) ? true : false
    }

    updateMoveToAttack(dt)
    {
        if (this._delay > 0.0)
        {
            this._delay -= dt
            return false
        }
        this._moveProgress += dt
        if (this._moveProgress < this._moveDuration - .1)
        {
            let percent = this.easeIn(Math.min(1.0, this._moveProgress / (this._moveDuration - .1)))
            let newPos = {
                x:this._startPosition.x + (this._targetPosition.x - this._startPosition.x) * percent, 
                y:this._startPosition.y + (this._targetPosition.y - this._startPosition.y) * percent}
            this.setPosition(newPos)
            return false
        }
        else
        {
            let dir = {x:this._startPosition.x - this._targetPosition.x, y:this._startPosition.y - this._targetPosition.y}
            let len = Math.sqrt(dir.x * dir.x + dir.y * dir.y)
            dir.x /= len
            dir.y /= len
            let progress = this._moveProgress - (this._moveDuration - .1)
            let percent = this.easeOut(Math.min(1.0, progress / .1));
            let newPos = {
                x:this._targetPosition.x + dir.x * 20 * percent,
                y:this._targetPosition.y + dir.y * 20 * percent}
            this.setPosition(newPos)
            return (percent >= 1.0) ? true : false
        }
    }

    updateMoveToBoard(dt)
    {
        if (this._delay > 0.0)
        {
            this._delay -= dt
            return false
        }
        this._moveProgress += dt

        if (this._moveProgress < this._moveDuration - .1)
        {
            let percent = this.easeBoth(Math.min(1.0, this._moveProgress / (this._moveDuration - .1)))
            let newPos = {
                x:this._startPosition.x + (this._targetPosition.x - this._startPosition.x) * percent, 
                y:this._startPosition.y + ((this._targetPosition.y - 20) - this._startPosition.y) * percent}
            this.setPosition(newPos)
            return false
        }
        else
        {
            let percent = this.easeIn(Math.min(1.0, (this._moveProgress - (this._moveDuration - .1)) / .1))
            let newPos = {
                x:this._targetPosition.x, 
                y:(this._targetPosition.y - 20) + 20 * percent}
            this.setPosition(newPos)
            return (percent >= 1.0) ? true : false
        }
    }

    // Get our index position in the hand, or -1
    getHandIndex()
    {
        for (let i = 0; i < this._hand.length; ++i)
        {
            let card = this._hand[i]
            if (card === this) return i
        }
        return -1 // Not supposed to happen
    }

    // Get our index position on the board, or -1
    getBoardIndex()
    {
        for (let i = 0; i < this._board.length; ++i)
        {
            let card = this._board[i]
            if (card === this) return i
        }
        return -1 // Not supposed to happen
    }

    // Update animating toward a position without a fixed duration.
    // This is used when adjusting hand position offsets
    updateMoveToward(dt)
    {
        let position = this.getPosition()
        let dirX = this._targetPosition.x - position.x
        let dirY = this._targetPosition.y - position.y
        let len = (dirX * dirX) + (dirY * dirY)

        if (len > 0)
        {
            len = Math.sqrt(len)
            dirX /= len
            dirY /= len
            let travel = dt * (len * 5 + 100)
            len -= travel
            if (len < 0)
            {
                position.x = this._targetPosition.x
                position.y = this._targetPosition.y
            }
            else
            {
                position.x += dirX * travel
                position.y += dirY * travel
            }
        }
    }
}
