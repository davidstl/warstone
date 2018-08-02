let Constants = require('./Constants')
let Resources = require('./Resources')
let SpriteNode = require('./SpriteNode')

module.exports = class DescriptionDialog extends SpriteNode
{
    constructor(gameView)
    {
        super(Resources._sprite_dialog, {x:0, y:0}, Constants.DRAW_ORDER_CARD_DESCRIPTION, {x:83, y:40}, Constants.DIALOG_PADDING)

        this._card = null
        this._gameView = gameView
    }

    show(card)
    {
        this._card = card
        let cardPos = this._card.getPosition()
        if (cardPos.x + Resources._sprite_blueCardBack.width / 2 > Constants.WIDTH / 2)
        {
            this.setPosition({x:cardPos.x - this.getDimension().x, y:cardPos.y - 2})
        }
        else
        {
            this.setPosition({x:cardPos.x + 50, y:cardPos.y - 2})
        }
        this._gameView.addSpriteNode(this)
    }

    hide()
    {
        this._gameView.removeSpriteNode(this)
    }

    render()
    {
        super.render()
        let pos = {...this.getPosition()}
        pos.x += 6
        pos.y += 6

        let cur = this._gameView.drawText(pos, "SUIT: ", Constants.DIALOG_TEXT_COLOR)
        this._gameView.drawText(cur, this._card.getType().Suit, Constants.CARD_NUMBER_COLOR)
        pos.y += 5

        pos.y += 5
        let text = this._card.getType().Description
        this._gameView.drawTextW(pos, this.getDimension().x - 13, text, Constants.CARD_NUMBER_COLOR)
    }
}
