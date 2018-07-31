let Sprite = require('./Sprite')

exports.SpriteNode = class
{
    constructor(sprite, position, drawOrder, dimension, padding)
    {
        this._sprite = sprite
    
        this._position = position ? {...position} : {x:0, y:0}
        this._dimension = dimension ? {...dimension} : {x:0, y:0}
        this._9SlicePadding = padding ? {...padding} : null
    
        this._drawOrder = drawOrder ? drawOrder : 0
        this._is9Slice = padding ? true : false
        this._enabled = false
        this._clickTrough = false

        this._onClicked = null
        this._onHovered = null
    }

    getPosition()
    {
        return this._position;
    }

    setPosition(position)
    {
        this._position = {...position};
    }

    // Check if a sprite is enabled
    isEnabled()
    {
        return this._enabled;
    }

    // Disabling a sprite will disallow clicks and hover state on it.
    // It will still block clicks on stuff behind it though.
    setEnabled(enabled)
    {
        this._enabled = enabled;
    }

    isClickThrough()
    {
        return this._clickTrough;
    }

    setClickThrough(clickThrough)
    {
        this._clickTrough = clickThrough;
    }

    // The rendering order. Higher the number, higher on top the sprite will appear
    setDrawOrder(drawOrder)
    {
        this._drawOrder = drawOrder;
    }

    getDrawOrder()
    {
        return this._drawOrder;
    }

    setSprite(sprite)
    {
        this._sprite = sprite;
        this._dimension.x = this._sprite.width;
        this._dimension.y = this._sprite.height;
    }

    getSprite()
    {
        return this._sprite;
    }

    getDimension()
    {
        return this._dimension;
    }

    setDimension(dimension)
    {
        this._dimension = {...dimension};
    }

    set9Slice(dimension, padding)
    {
        if (!dimension)
        {
            this._is9Slice = false;
            return;
        }
        this._is9Slice = true;
        this._dimension = {...dimension}
        this._9SlicePadding = {...padding}
    }

    render()
    {
        if (this._sprite)
        {
            if (this._is9Slice)
            {
                Sprite.render9Slice(this._sprite, this._position, this._dimension, this._9SlicePadding);
            }
            else
            {
                Sprite.renderPosDim(this._sprite, this._position, this._dimension);
            }
        }
    }

    renderHover()
    {
        this.render();
    }

    renderDown()
    {
        this.renderHover();
    }

    renderDisabled()
    {
        this.render();
    }

    contains(point)
    {
        return point.x >= this._position.x &&
               point.x <= this._position.x + this._dimension.x &&
               point.y >= this._position.y &&
               point.y <= this._position.y + this._dimension.y;
    }
}
