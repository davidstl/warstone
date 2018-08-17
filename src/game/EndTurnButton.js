let Constants = require('./Constants')
let Resources = require('./Resources')
let Sprite = require('./Sprite')
let SpriteNode = require('./SpriteNode')

module.exports = class EndTurnButton extends SpriteNode
{
    constructor(game)
    {
        super()

        this._game = game
        
        this.setSprite(Resources._sprite_btnAdvanceUp)
        this.setDrawOrder(Constants.DRAW_ORDER_ADVANCE_BTN)
        this.setPosition(Constants.ADVANCE_BUTTON_POS)
    }

    render()
    {
        if (!this._game.hasMoves(this._game._myPlayer)) Sprite.renderGlow(this)
        super.render()
    }

    renderHover()
    {
        if (!this._game.hasMoves(this._game._myPlayer)) Sprite.renderGlow(this)
        Sprite.renderPos(Resources._sprite_btnAdvanceHover, this.getPosition())
    }

    renderDown()
    {
        if (!this._game.hasMoves(this._game._myPlayer)) Sprite.renderGlow(this)
        Sprite.renderPos(Resources._sprite_btnAdvanceDown, this.getPosition())
    }

    renderDisabled()
    {
        // When the advanced button is disabled, we don't show it
        //TODO: John wants it to look disabled
    }
}
