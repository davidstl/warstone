let Constants = require('./Constants')
let Resources = require('./Resources')
let Renderer = require('./Renderer')
let SpriteNode = require('./SpriteNode')
let Sprite = require('./Sprite')
let Input = require('./Input')

module.exports = class GameView extends SpriteNode
{
    constructor()
    {
        super()

        this._spriteNodes = []
        this._isInverted = false // Player1 will view the board inverted as it is represented by data
        this._hoverSpriteNode = null // Sprite currently being mouse hover
        this._downSpriteNode = null // Sprite currently holding mouse down
        this._ribbonSprite = null
        this.anim = 0

        this._spriteNodes = []

        this.setDrawOrder(Constants.DRAW_ORDER_BACKGROUND);
        this.setDimension({x:Constants.WIDTH, y:Constants.HEIGHT});
        this.setEnabled(true);
        this.addSpriteNode(this);

        // Add the sprite for the ribbon at the middle
        this._ribbonSprite = new SpriteNode(Resources._sprite_ribbon, {x:42, y:119}, Constants.DRAW_ORDER_BACKGROUND + 1, {x:237, y:3}, {x:4, y:3, z:4, w:0});
        this._ribbonSprite.setClickThrough(true);
        this.addSpriteNode(this._ribbonSprite);

        // BG Deco on each sides
        let deco = new SpriteNode(Resources._sprite_decoBg, {x:39, y:47}, Constants.DRAW_ORDER_BACKGROUND + 1, {x:240, y:71}, {x:7, y:7, z:7, w:7});
        deco.setClickThrough(true);
        this.addSpriteNode(deco);
        deco = new SpriteNode(Resources._sprite_decoBg, {x:39, y:Constants.HEIGHT - 47 - 70}, Constants.DRAW_ORDER_BACKGROUND + 1, {x:240, y:71}, {x:7, y:7, z:7, w:7});
        deco.setClickThrough(true);
        this.addSpriteNode(deco);
    }

    updateRibbon(percent)
    {
        let w = Math.floor(Math.max(6, 237.0 * percent))
        this._ribbonSprite.setPosition({x:42 + 237 - w, y:this._ribbonSprite.getPosition().y})
        this._ribbonSprite.setDimension({x:w, y:3})
    }

    drawNumbers(position, number, color)
    {
        let pos = {...position}
        let digits = []
        do
        {
            digits.push(number % 10)
            number = Math.floor(number / 10)
        }
        while (number > 0);

        for (let i = digits.length - 1; i >= 0; --i)
        {
            let digit = digits[i]
            if (digit >= 0 && digit <= 9)
            {
                Sprite.renderPosColor(Resources._sprite_numbers[digit], pos, color)
            }
            if (digit == 1) pos.x += 2
            else pos.x += 4
        }

        return pos.x
    }

    numberSize(number)
    {
        let size = 0
        do
        {
            let num = number % 10
            if (num === 1) size += 2
            else size += 4
            number = Math.floor(number / 10)
        }
        while (number > 0);
        return size
    }

    drawText(position, text, color)
    {
        let pos = {...position}
        for (let i = 0; i < text.length; ++i)
        {
            let c = text[i]
            c = c.toUpperCase().charCodeAt(0)
            if (c >= '!'.charCodeAt(0) && c <= 'Z'.charCodeAt(0))
            {
                Sprite.renderPosColor(Resources._sprite_font[c - '!'.charCodeAt(0)], pos, color)
            }
            pos.x += 4
        }
        return pos
    }

    drawTextW(position, w, text, color)
    {
        let pos = {...position}
        let startX = pos.x
        for (let i = 0; i < text.length; ++i)
        {
            if (text[i] === '\n')
            {
                pos.x = startX
                pos.y += 5
                continue
            }

            // look ahead
            let wordSize = 0
            for (let j = i; j < text.length; ++j)
            {
                let cc = text[j]
                if (cc === ' ') break;
                ++wordSize
            }
            if (pos.x + wordSize * 4 - startX >= w)
            {
                pos.x = startX
                pos.y += 5
            }
            wordSize += i
            for (; i < wordSize; ++i)
            {
                let c = text[i]
                c = c.toUpperCase().charCodeAt(0)
                if (c >= '!'.charCodeAt(0) && c <= 'Z'.charCodeAt(0))
                {
                    Sprite.renderPosColor(Resources._sprite_font[c - '!'.charCodeAt(0)], pos, color)
                }
                pos.x += 4
            }
            pos.x += 4
        }
        return pos
    }

    drawAttackStatColor(pos, number, rightAligned, color)
    {
        this.drawStat(pos, number, Resources._sprite_attackIcon, rightAligned, color)
    }

    drawHealthStatColor(pos, number, rightAligned, color)
    {
        this.drawStat(pos, number, Resources._sprite_healthIcon, rightAligned, color)
    }

    drawEnergyStatColor(pos, number, rightAligned, color, animate)
    {
        if (animate)
        {
            this.drawStat(pos, number, 
                Resources._sprite_energyIconAnim[Math.floor(this.anim * 8) % Resources._sprite_energyIconAnim.length], 
                rightAligned, color)
        }
        else
        {
            this.drawStat(pos, number, Resources._sprite_energyIcon, rightAligned, color)
        }
    }

    drawAttackStat(pos, number, rightAligned)
    {
        this.drawStat(pos, number, Resources._sprite_attackIcon, rightAligned, Constants.CARD_NUMBER_COLOR)
    }

    drawHealthStat(pos, number, rightAligned)
    {
        this.drawStat(pos, number, Resources._sprite_healthIcon, rightAligned, Constants.CARD_NUMBER_COLOR)
    }

    drawEnergyStat(pos, number, rightAligned, animate)
    {
        this.drawEnergyStat(pos, number, rightAligned, Constants.CARD_NUMBER_COLOR, animate)
    }

    drawStat(pos, number, icon, rightAligned, color)
    {
        if (rightAligned)
        {
            let newPos = {...pos}
            newPos.x -= 7
            Sprite.renderPos(icon, newPos)
            newPos.x -= this.numberSize(number) + 1
            newPos.y += 1
            this.drawNumbers(newPos, number, color)
        }
        else
        {
            Sprite.renderPos(icon, pos)
            this.drawNumbers({x:pos.x + 8, y:pos.y + 1}, number, color)
        }
    }

    // Get the sprite currently hovered by the mouse
    getHovered()
    {
        return this._hoverSpriteNode
    }

    // Player1 will see the board inverted from its represented data
    isInverted()
    {
        return this._isInverted
    }

    // Set wether that player views the board inverted or not
    setInverted(isInverted)
    {
        this._isInverted = isInverted
    }

    // Add a sprite to the renderer
    addSpriteNode(spriteNode)
    {
        if (this._spriteNodes.includes(spriteNode)) return;
        this._spriteNodes.push(spriteNode)
    }

    removeSpriteNode(spriteNode)
    {
        let index = this._spriteNodes.indexOf(spriteNode)
        if (index > -1) this._spriteNodes.splice(index, 1)
        this._spriteNodes.filter(sn => sn !== spriteNode)
    }

    update(dt)
    {
        // Global anim helper
        this.anim += dt

        // Sort spritenodes
        this._spriteNodes.sort((a, b) => a.getDrawOrder() - b.getDrawOrder())

        // Update mouse clicking stuff
        let lastHoverSpriteNode = this._hoverSpriteNode;
        this._hoverSpriteNode = null;
        let clicked = null;

        // We do it in reverse, because sprites rendered on top have priority
        for (let i = this._spriteNodes.length - 1; i >= 0; --i)
        {
            let spriteNode = this._spriteNodes[i];
            if (spriteNode.isClickThrough()) continue;
            if (spriteNode.contains(Input.mousePos))
            {
                this._hoverSpriteNode = spriteNode;
                break;
            }
        }

        // Downed
        if (Input.isMouseJustDown() && this._hoverSpriteNode != null && this._hoverSpriteNode.isEnabled())
        {
            this._downSpriteNode = this._hoverSpriteNode;
        }
        
        // Released
        if (Input.isMouseJustReleased())
        {
            if (this._downSpriteNode != null)
            {
                if (this._downSpriteNode == this._hoverSpriteNode && this._hoverSpriteNode.isEnabled())
                {
                    clicked = this._downSpriteNode;
                }
                this._downSpriteNode = null;
            }
        }

        // Events
        if (lastHoverSpriteNode != this._hoverSpriteNode && this._hoverSpriteNode != null && this._hoverSpriteNode.isEnabled())
        {
            if (this._hoverSpriteNode.onHovered)
            {
                this._hoverSpriteNode.onHovered();
            }
        }
        if (clicked != null)
        {
            if (clicked.onClicked)
            {
                clicked.onClicked();
            }
        }

        Input.lastMouseDown = Input.mouseDown
    }

    renderView()
    {
        Renderer.beginFrame();
        
        // Render sprites
        this._spriteNodes.forEach(spriteNode =>
        {
            // Render the sprite in its proper hover/down state
            if (spriteNode.isEnabled())
            {
                if (spriteNode == this._hoverSpriteNode && this._hoverSpriteNode.isEnabled())
                {
                    if (spriteNode == this._downSpriteNode)
                    {
                        spriteNode.renderDown();
                    }
                    else
                    {
                        spriteNode.renderHover();
                    }
                }
                else if (spriteNode == this._downSpriteNode)
                {
                    spriteNode.renderHover();
                }
                else
                {
                    spriteNode.render();
                }
            }
            else
            {
                spriteNode.renderDisabled();
            }
        })

        Renderer.endFrame();
    }
}
