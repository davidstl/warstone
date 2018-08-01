let Constants = require('./Constants')
let Resources = require('./Resources')
let SpriteNode = require('./SpriteNode')
let Sprite = require('./Sprite')

class OkButton extends SpriteNode
{
    constructor(game)
    {
        super()

        this._game = game

        this.setPosition(Constants.OK_BTN_POS)
        this.setSprite(Resources._sprite_btnOkUp)
        this.setDrawOrder(Constants.DRAW_ORDER_DIALOG + 1)
        this.setEnabled(true);
    }

    renderHover()
    {
        Sprite.renderPos(Resources._sprite_btnOkHover, this.getPosition())
    }

    renderDown()
    {
        Sprite.renderPos(Resources._sprite_btnOkDown, this.getPosition())
    }

    onClicked()
    {
        this._game.onDialogOkClicked()
    }
}

module.exports = class Dialog extends SpriteNode
{
    constructor(gameView, game)
    {
        super()

        this._gameView = gameView
        this._okButton = null
        this._message = ""

        this.setPosition(Constants.DIALOG_POS)
        this.setDrawOrder(Constants.DRAW_ORDER_DIALOG)
        this.setSprite(Resources._sprite_dialog)
        this.set9Slice(Constants.DIALOG_SIZE, Constants.DIALOG_PADDING)

        this._okButton = new OkButton(game)
    }

    setMessage(message)
    {
        this._message = message
    }

    show()
    {
        this._gameView.addSpriteNode(this)
        this._gameView.addSpriteNode(this._okButton)
    }

    hide()
    {
        this._gameView.removeSpriteNode(this)
        this._gameView.removeSpriteNode(this._okButton)
    }

    render()
    {
        // Draw frame
        super.render()

        // Draw text
        this._gameView.drawText(
            {x:Constants.WIDTH / 2 - Math.floor((this._message.length * 4) / 2), y:Constants.HEIGHT / 2 - 10}, 
            this._message, Constants.DIALOG_TEXT_COLOR);
    }
}
