let Constants = require('./Constants')
let Resources = require('./Resources')
let Sprite = require('./Sprite')
let SpriteNode = require('./SpriteNode')

module.exports = class EnergyMeter extends SpriteNode
{
    constructor(isTopPlayer, gameView)
    {
        super()

        this._energy = 10
        this._energyCap = 10

        this._isTopPlayer = isTopPlayer
        this._gameView = gameView
    }

    set(energy, energyCap)
    {
        this._energy = energy
        this._energyCap = energyCap
    }

    render()
    {
        let percent = this._energy / this._energyCap
        let pos = {x: 0, y: 0}
        
        if (this._isTopPlayer)
        {
            pos = {x:271, y:8}
        }
        else
        {
            pos = {x:271, y:218};
        }

        Sprite.renderPos(Resources._sprite_energyBg, pos)
        Sprite.renderPosDim(Resources._sprite_energy, 
            {x:pos.x + 10, y:pos.y + 4}, 
            {x:Math.floor(Resources._sprite_energy.width * percent), y:Resources._sprite_energy.height});
    
        if (this._isTopPlayer)
        {
            pos.x += 13;
            pos.y += -3;
        }
        else
        {
            pos.x += 13;
            pos.y += 12;
        }

        pos.x = this._gameView.drawNumbers(pos, this._energy, Constants.ENERGY_COLOR) + 1;
        Sprite.renderPos(Resources._sprite_energySlash, pos)
        pos.x += 5;
        this._gameView.drawNumbers(pos, this._energyCap, Constants.ENERGY_COLOR);
    }
}
