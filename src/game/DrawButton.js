let Constants = require('./Constants')
let Resources = require('./Resources')
let SpriteNode = require('./SpriteNode')
let Sprite = require('./Sprite')

module.exports = class DrawButton extends SpriteNode
{
    constructor(gameView, game, config)
    {
        super()

        this._gameView = gameView
        this._game = game
        this._config = config
        
        this.setSprite(Resources._sprite_blueCardBack)
        this.setDrawOrder(Constants.DRAW_ORDER_DECK + 4)
        this.setPosition({x:Constants.BOTTOM_DECK_POS.x - 2 * 4, y:Constants.BOTTOM_DECK_POS.y - 2 * 3})
        gameView.addSpriteNode(this)
    }

    render()
    {
        super.render()
        this.drawCost()
    }

    renderHover()
    {
        this.render()
        Sprite.renderPosColor(Resources._sprite_hoverCard, this.getPosition(), Constants.CARD_HOVER_COLOR)
        this.drawCost()
    }

    renderDown()
    {
        Sprite.renderPosColor(Resources._sprite_blueCardBack, this.getPosition(), Constants.DOWN_COLOR)
        this.drawCost();
    }

    renderDisabled()
    {
    }

    onClicked()
    {
        this._game.onDrawClicked()
    }

    drawCost()
    {
        let pos = {...this.getPosition()}
        pos.x += 20
        pos.y += Resources._sprite_blueCardBack.height + 9
        pos.x += this._gameView.numberSize(this._config.DrawCost) + 8
        this._gameView.drawEnergyStatColor(pos, this._config.DrawCost, true, Constants.ENERGY_COLOR, this._game.hasEnoughEnergy(this._config.DrawCost));
    }
}
