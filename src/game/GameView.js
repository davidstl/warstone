let Constants = require('./Constants')
let Resources = require('./Resources')
let Renderer = require('./Renderer')
let SpriteNode = require('./SpriteNode').SpriteNode

let _gameView = null
let _spriteNodes = []
let _isInverted = false // Player1 will view the board inverted as it is represented by data
let _hoverSpriteNode = null // Sprite currently being mouse hover
let _downSpriteNode = null // Sprite currently holding mouse down
let _ribbonSprite = null
let _anim = 0

exports.initialize = function()
{
    _spriteNodes = []

    _gameView = new SpriteNode();
    _gameView.setDrawOrder(Constants.DRAW_ORDER_BACKGROUND);
    _gameView.setDimension({x:Constants.WIDTH, y:Constants.HEIGHT});
    _gameView.setEnabled(true);
    exports.addSpriteNode(_gameView);

    // Add the sprite for the ribbon at the middle
    _ribbonSprite = new SpriteNode(Resources._sprite_ribbon, {x:42, y:119}, Constants.DRAW_ORDER_BACKGROUND + 1, {x:237, y:3}, {x:4, y:3, z:4, w:0});
    _ribbonSprite.setClickThrough(true);
    exports.addSpriteNode(_ribbonSprite);

    // BG Deco on each sides
    let deco = new SpriteNode(Resources._sprite_decoBg, {x:39, y:47}, Constants.DRAW_ORDER_BACKGROUND + 1, {x:240, y:71}, {x:7, y:7, z:7, w:7});
    deco.setClickThrough(true);
    exports.addSpriteNode(deco);
    deco = new SpriteNode(Resources._sprite_decoBg, {x:39, y:Constants.HEIGHT - 47 - 70}, Constants.DRAW_ORDER_BACKGROUND + 1, {x:240, y:71}, {x:7, y:7, z:7, w:7});
    deco.setClickThrough(true);
    exports.addSpriteNode(deco);
}

// Get the sprite currently hovered by the mouse
exports.getHovered = function()
{
    return _hoverSpriteNode
}

// Player1 will see the board inverted from its represented data
exports.isInverted = function()
{
    return _isInverted
}

// Set wether that player views the board inverted or not
exports.setInverted = function(isInverted)
{
    _isInverted = isInverted
}

// Add a sprite to the renderer
exports.addSpriteNode = function(spriteNode)
{
    if (_spriteNodes.includes(spriteNode)) return;
    _spriteNodes.push(spriteNode)
}

exports.removeSpriteNode = function(spriteNode)
{
    _spriteNodes.remove(spriteNode)
    _spriteNodes.filter(sn => sn !== spriteNode)
}

exports.update = function(dt)
{
    // Global anim helper
    _anim += dt

    // Sort spritenodes
    _spriteNodes.sort((a, b) => a.getDrawOrder() - b.getDrawOrder())
}

exports.renderView = function()
{
    Renderer.beginFrame();
    
    // Render sprites
    _spriteNodes.forEach(spriteNode =>
    {
        // Render the sprite in its proper hover/down state
        if (spriteNode.isEnabled())
        {
            if (spriteNode == _hoverSpriteNode && _hoverSpriteNode.isEnabled())
            {
                if (spriteNode == _downSpriteNode)
                {
                    spriteNode.renderDown();
                }
                else
                {
                    spriteNode.renderHover();
                }
            }
            else if (spriteNode == _downSpriteNode)
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
