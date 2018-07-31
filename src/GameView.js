let Resources = require("./Resources")

let gl = null

// Define a bunch of constants
exports.WIDTH = 320
exports.HEIGHT = 240
exports.SCALE = 3

exports.DRAW_ORDER_BACKGROUND = 0
exports.DRAW_ORDER_NAME = 100
exports.DRAW_ORDER_ADVANCE_BTN = 200
exports.DRAW_ORDER_BOARD = 300
exports.DRAW_ORDER_DECK = 400
exports.DRAW_ORDER_TOP_HAND = 500
exports.DRAW_ORDER_BOTTOM_HAND = 600
exports.DRAW_ORDER_TOP_PLACE = 700
exports.DRAW_ORDER_BOTTOM_PLACE = 800
exports.DRAW_ORDER_MOVING_CARD = 1000
exports.DRAW_ORDER_CARD_DESCRIPTION = 1100
exports.DRAW_ORDER_DIALOG = 1200

exports.OUTLINE_COLOR = [24 / 255, 20 / 255, 37 / 255, 1]
exports.BACKGROUND_COLOR = [38 / 255, 43 / 255, 68 / 255, 1]
exports.CARD_NUMBER_COLOR = [58 / 255, 68 / 255, 102 / 255, 1]
exports.ROCK_CARD_NUMBER_COLOR = [1, 1, 1, 1]
exports.DOWN_COLOR = [.6, .6, .6, 1] // Button down 40% darker
exports.ENERGY_COLOR = [44 / 255, 232 / 255, 245 / 255, 1]
exports.CARD_TEXT_COLOR = [58 / 255, 68 / 255, 102 / 255, 1]
exports.CARD_HOVER_COLOR = [254 / 255, 231 / 255, 97 / 255, 1]
exports.CARD_HOVER_OPPONENT_COLOR = [255 / 255, 0, 68 / 255, 1]
exports.DIALOG_TEXT_COLOR = [90 / 255, 105 / 255, 136 / 255, 1]

// public static final Vector2f TOP_DECK_POS = new Vector2f(37 - Resources._sprite_redCardBack.width, 106 - Resources._sprite_redCardBack.height)
// public static final Vector2f TOP_HAND_POS = new Vector2f(WIDTH / 2, -Resources._sprite_blueCardBack.height + 40)
// public static final Vector2f TOP_BOARD_POS = new Vector2f(WIDTH / 2 - 1, HEIGHT / 2 - Resources._sprite_blueCardBack.height - 6)
// public static final Vector2f TOP_PLACE_POS = new Vector2f(272, 47)
// public static final Vector2f TOP_DISCARDED_POS = new Vector2f(WIDTH + 50, HEIGHT / 2 - Resources._sprite_blueCardBack.height - 10)
// public static final Vector2f BOTTOM_DECK_POS = new Vector2f(37 - Resources._sprite_redCardBack.width, 196 - Resources._sprite_redCardBack.height)
// public static final Vector2f BOTTOM_HAND_POS = new Vector2f(WIDTH / 2, HEIGHT - 40)
// public static final Vector2f BOTTOM_BOARD_POS = new Vector2f(WIDTH / 2 - 1, HEIGHT / 2 + 7)
// public static final Vector2f BOTTOM_PLACE_POS = new Vector2f(272, 131)
// public static final Vector2f BOTTOM_DISCARDED_POS = new Vector2f(WIDTH + 50, HEIGHT / 2 + 10)
// public static final Vector2f ADVANCE_BUTTON_POS = new Vector2f(280, 111)
// public static final float HAND_SPACING = Resources._sprite_blueCardBack.width -  10
// public static final float BOARD_SPACING = Resources._sprite_blueCardBack.width + 1

let _spriteNodes = []
let _isInverted = false // Player1 will view the board inverted as it is represented by data
let _hoverSpriteNode = null // Sprite currently being mouse hover
let _downSpriteNode = null // Sprite currently holding mouse down
let _ribbonSprite = null
let _anim = 0
let _gameView = null

exports.gl = null

exports.initialize = function(canvas)
{
    // Initialize webgl
    gl = canvas.getContext("webgl")
    exports.gl = gl
    
    if (!gl)
    {
        alert("Cannot initialize WebGL. Your browser or computer doesn't support it.")
        return
    }

    Resources.initialize()
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

function resetRenderStates()
{
    // Render states
    gl.disable(gl.DEPTH_TEST); // No 3D, no depth required
    gl.disable(gl.CULL_FACE); // No cull face, it's 2D we always see
    gl.enable(gl.BLEND); // Blend on
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Alpha blend
    gl.viewport(0, 0, exports.WIDTH * exports.SCALE, exports.HEIGHT * exports.SCALE); // Viewport cover all window
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, Resources._spriteSheet); // Bind our only texture used, the sprite sheet

    // Setup orthographic view
    // gl.matrixMode(gl.PROJECTION);
    // gl.loadIdentity();
    // gl.ortho(0, exports.WIDTH, exports.HEIGHT, 0, 1, -1);
    // gl.matrixMode(gl.MODELVIEW);
    // gl.loadIdentity();

    // Clear screen
    // gl.clearColor(exports.BACKGROUND_COLOR[0], exports.BACKGROUND_COLOR[1], exports.BACKGROUND_COLOR[2], exports.BACKGROUND_COLOR[3]);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

exports.renderView = function()
{
    resetRenderStates();
    
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
}
