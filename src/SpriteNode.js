class SpriteNode
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
    }

    getPosition()
    {
        return _position;
    }

    setPosition(position)
    {
        _position = {...position};
    }

    // Check if a sprite is enabled
    isEnabled()
    {
        return _enabled;
    }

    // Disabling a sprite will disallow clicks and hover state on it.
    // It will still block clicks on stuff behind it though.
    setEnabled(enabled)
    {
        _enabled = enabled;
    }

    isClickThrough()
    {
        return _clickTrough;
    }

    setClickThrough(clickThrough)
    {
        _clickTrough = clickThrough;
    }

    // The rendering order. Higher the number, higher on top the sprite will appear
    setDrawOrder(drawOrder)
    {
        _drawOrder = drawOrder;
    }

    getDrawOrder()
    {
        return _drawOrder;
    }

    setSprite(sprite)
    {
        _sprite = sprite;
        _dimension.x = _sprite.width;
        _dimension.y = _sprite.height;
    }

    getSprite()
    {
        return _sprite;
    }

    getDimension()
    {
        return _dimension;
    }

    setDimension(dimension)
    {
        _dimension = {...dimension};
    }

    set9Slice(dimension, padding)
    {
        if (!dimension)
        {
            _is9Slice = false;
            return;
        }
        _is9Slice = true;
        _dimension = {...dimension}
        _9SlicePadding = {...padding}
    }

    render()
    {
        if (_sprite)
        {
            if (_is9Slice)
            {
                _sprite.render9Slice(_position, _dimension, _9SlicePadding);
            }
            else
            {
                _sprite.render(_position, _dimension);
            }
        }
    }

    renderHover()
    {
        render();
    }

    renderDown()
    {
        renderHover();
    }

    renderDisabled()
    {
        render();
    }

    contains(point)
    {
        return
            point.x >= _position.x &&
            point.x <= _position.x + _dimension.x &&
            point.y >= _position.y &&
            point.y <= _position.y + _dimension.y;
    }

    onHovered()
    {
    }

    onClicked()
    {
    }
}

export default SpriteNode
