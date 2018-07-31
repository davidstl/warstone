let Constants = require('./Constants')
let Resources = require('./Resources')
let Sprite = require('./Sprite')
let SpriteNode = require('./SpriteNode').SpriteNode

exports.EndTurnButton = class extends SpriteNode
{
    constructor()
    {
        super()
        
        this.setSprite(Resources._sprite_btnAdvanceUp)
        this.setDrawOrder(Constants.DRAW_ORDER_ADVANCE_BTN)
        this.setPosition(Constants.ADVANCE_BUTTON_POS)
    }

    renderHover()
    {
        Sprite.renderPos(Resources._sprite_btnAdvanceHover, this.getPosition());
    }

    renderDown()
    {
        Sprite.renderPos(Resources._sprite_btnAdvanceDown, this.getPosition());
    }

    renderDisabled()
    {
        // When the advanced button is disabled, we don't show it
        //TODO: John wants it to look disabled
    }
}
