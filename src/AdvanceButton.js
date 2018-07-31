import SpriteNode from './SpriteNode'

let Resources = require("./Resources")
let GameView = require('./GameView')

class AdvanceButton extends SpriteNode
{
    constructor(game)
    {
        super()

        this._game = game
        this.setSprite(Resources._sprite_btnAdvanceUp);
        this.setDrawOrder(GameView.DRAW_ORDER_ADVANCE_BTN);
        this.setPosition(GameView.ADVANCE_BUTTON_POS);
        GameView.addSpriteNode(this);
    }

    renderHover()
    {
        Resources._sprite_btnAdvanceHover.render(this.getPosition());
    }

    renderDown()
    {
        Resources._sprite_btnAdvanceDown.render(this.getPosition());
    }

    renderDisabled()
    {
        // When the advanced button is disabled, we don't show it
        //TODO: John wants it to look disabled
    }

    onClicked()
    {
        this._game.advance();
    }
}

export default AdvanceButton
