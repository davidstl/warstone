import SpriteNode from "./SpriteNode"

let Resources = require("./Resources")
let mat4 = require("gl-matrix/src/gl-matrix/mat4")

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

exports.TOP_DECK_POS = {x:37 - Resources._sprite_redCardBack.width, y:106 - Resources._sprite_redCardBack.height}
exports.TOP_HAND_POS = {x:exports.WIDTH / 2, y:-Resources._sprite_blueCardBack.height + 40}
exports.TOP_BOARD_POS = {x:exports.WIDTH / 2 - 1, y:exports.HEIGHT / 2 - Resources._sprite_blueCardBack.height - 6}
exports.TOP_PLACE_POS = {x:272, y:47}
exports.TOP_DISCARDED_POS = {x:exports.WIDTH + 50, y:exports.HEIGHT / 2 - Resources._sprite_blueCardBack.height - 10}
exports.BOTTOM_DECK_POS = {x:37 - Resources._sprite_redCardBack.width, y:196 - Resources._sprite_redCardBack.height}
exports.BOTTOM_HAND_POS = {x:exports.WIDTH / 2, y:exports.HEIGHT - 40}
exports.BOTTOM_BOARD_POS = {x:exports.WIDTH / 2 - 1, y:exports.HEIGHT / 2 + 7}
exports.BOTTOM_PLACE_POS = {x:272, y:131}
exports.BOTTOM_DISCARDED_POS = {x:exports.WIDTH + 50, y:exports.HEIGHT / 2 + 10}
exports.ADVANCE_BUTTON_POS = {x:280, y:111}
exports.HAND_SPACING = Resources._sprite_blueCardBack.width - 10
exports.BOARD_SPACING = Resources._sprite_blueCardBack.width + 1

let _spriteNodes = []
let _isInverted = false // Player1 will view the board inverted as it is represented by data
let _hoverSpriteNode = null // Sprite currently being mouse hover
let _downSpriteNode = null // Sprite currently holding mouse down
let _ribbonSprite = null
let _anim = 0
let _gameView = null

exports.gl = null

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

    _gameView = new SpriteNode();
    _gameView.setDrawOrder(exports.DRAW_ORDER_BACKGROUND);
    _gameView.setDimension({x:exports.WIDTH, y:exports.HEIGHT});
    _gameView.setEnabled(true);
    exports.addSpriteNode(_gameView);

    // Add the sprite for the ribbon at the middle
    _ribbonSprite = new SpriteNode(Resources._sprite_ribbon, {x:42, y:119}, exports.DRAW_ORDER_BACKGROUND + 1, {x:237, y:3}, {x:4, y:3, z:4, w:0});
    _ribbonSprite.setClickThrough(true);
    exports.addSpriteNode(_ribbonSprite);

    // BG Deco on each sides
    let deco = new SpriteNode(Resources._sprite_decoBg, {x:39, y:47}, exports.DRAW_ORDER_BACKGROUND + 1, {x:240, y:71}, {x:7, y:7, z:7, w:7});
    deco.setClickThrough(true);
    exports.addSpriteNode(deco);
    deco = new SpriteNode(Resources._sprite_decoBg, {x:39, y:exports.HEIGHT - 47 - 70}, exports.DRAW_ORDER_BACKGROUND + 1, {x:240, y:71}, {x:7, y:7, z:7, w:7});
    deco.setClickThrough(true);
    exports.addSpriteNode(deco);
}

function resetRenderStates()
{
    // Render states
    gl.disable(gl.DEPTH_TEST); // No 3D, no depth required
    gl.disable(gl.CULL_FACE); // No cull face, it's 2D we always see
    gl.enable(gl.BLEND); // Blend on
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Alpha blend
    gl.viewport(0, 0, exports.WIDTH * exports.SCALE, exports.HEIGHT * exports.SCALE); // Viewport cover all window

    // Bind our only texture used, the sprite sheet
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, Resources._spriteSheet);
    gl.uniform1i(Resources._programInfo.uniformLocations.uSampler, 0);

    // Clear screen
    gl.clearColor(exports.BACKGROUND_COLOR[0], exports.BACKGROUND_COLOR[1], exports.BACKGROUND_COLOR[2], exports.BACKGROUND_COLOR[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set orthographic 2D view
    let projectionMatrix = mat4.create();
    mat4.ortho(projectionMatrix, 0, exports.WIDTH, exports.HEIGHT, 0, -999, 999)

    // Set the drawing position to the "identity" point, which is top left
    let modelViewMatrix = mat4.create();

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
        const numComponents = 2;  // pull out 2 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
                                  // 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, Resources._vertexBuffer.position);
        gl.vertexAttribPointer(
            Resources._programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            Resources._programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, Resources._vertexBuffer.color);
        gl.vertexAttribPointer(
            Resources._programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            Resources._programInfo.attribLocations.vertexColor);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, Resources._vertexBuffer.texCoord);
        gl.vertexAttribPointer(
            Resources._programInfo.attribLocations.vertexTexCoord,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            Resources._programInfo.attribLocations.vertexTexCoord);
    }

    // Tell WebGL to use our program when drawing
    gl.useProgram(Resources._programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
        Resources._programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        Resources._programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
}

exports.glBegin = function()
{

}

exports.glEnd = function()
{
    // Do nothing. We just flush at the end of the frame or when vertex buffer is full
}

exports.glColor4f = function(r, g, b, a)
{

}

exports.glTexCoord2f = function(u, v)
{

}

exports.glVertex2f = function(x, y)
{

}

exports.update = function(dt)
{

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

    {
        const offset = 0;
        const vertexCount = 6;
        gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
    }
}
