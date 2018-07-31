import SpriteNode from "./SpriteNode"
import { Z_FULL_FLUSH } from "zlib";
import { MAX_SPRITE_COUNT } from "./Resources";

let Resources = require("./Resources")
let mat4 = require("gl-matrix/src/gl-matrix/mat4")

// Define a bunch of constants
export let WIDTH = 320
export let HEIGHT = 240
export let SCALE = 3

export let DRAW_ORDER_BACKGROUND = 0
export let DRAW_ORDER_NAME = 100
export let DRAW_ORDER_ADVANCE_BTN = 200
export let DRAW_ORDER_BOARD = 300
export let DRAW_ORDER_DECK = 400
export let DRAW_ORDER_TOP_HAND = 500
export let DRAW_ORDER_BOTTOM_HAND = 600
export let DRAW_ORDER_TOP_PLACE = 700
export let DRAW_ORDER_BOTTOM_PLACE = 800
export let DRAW_ORDER_MOVING_CARD = 1000
export let DRAW_ORDER_CARD_DESCRIPTION = 1100
export let DRAW_ORDER_DIALOG = 1200

export let OUTLINE_COLOR = [24 / 255, 20 / 255, 37 / 255, 1]
export let BACKGROUND_COLOR = [38 / 255, 43 / 255, 68 / 255, 1]
export let CARD_NUMBER_COLOR = [58 / 255, 68 / 255, 102 / 255, 1]
export let ROCK_CARD_NUMBER_COLOR = [1, 1, 1, 1]
export let DOWN_COLOR = [.6, .6, .6, 1] // Button down 40% darker
export let ENERGY_COLOR = [44 / 255, 232 / 255, 245 / 255, 1]
export let CARD_TEXT_COLOR = [58 / 255, 68 / 255, 102 / 255, 1]
export let CARD_HOVER_COLOR = [254 / 255, 231 / 255, 97 / 255, 1]
export let CARD_HOVER_OPPONENT_COLOR = [255 / 255, 0, 68 / 255, 1]
export let DIALOG_TEXT_COLOR = [90 / 255, 105 / 255, 136 / 255, 1]

export let TOP_DECK_POS = {x:37 - Resources._sprite_redCardBack.width, y:106 - Resources._sprite_redCardBack.height}
export let TOP_HAND_POS = {x:WIDTH / 2, y:-Resources._sprite_blueCardBack.height + 40}
export let TOP_BOARD_POS = {x:WIDTH / 2 - 1, y:HEIGHT / 2 - Resources._sprite_blueCardBack.height - 6}
export let TOP_PLACE_POS = {x:272, y:47}
export let TOP_DISCARDED_POS = {x:WIDTH + 50, y:HEIGHT / 2 - Resources._sprite_blueCardBack.height - 10}
export let BOTTOM_DECK_POS = {x:37 - Resources._sprite_redCardBack.width, y:196 - Resources._sprite_redCardBack.height}
export let BOTTOM_HAND_POS = {x:WIDTH / 2, y:HEIGHT - 40}
export let BOTTOM_BOARD_POS = {x:WIDTH / 2 - 1, y:HEIGHT / 2 + 7}
export let BOTTOM_PLACE_POS = {x:272, y:131}
export let BOTTOM_DISCARDED_POS = {x:WIDTH + 50, y:HEIGHT / 2 + 10}
export let ADVANCE_BUTTON_POS = {x:280, y:111}
export let HAND_SPACING = Resources._sprite_blueCardBack.width - 10
export let BOARD_SPACING = Resources._sprite_blueCardBack.width + 1

let _spriteNodes = []
let _isInverted = false // Player1 will view the board inverted as it is represented by data
let _hoverSpriteNode = null // Sprite currently being mouse hover
let _downSpriteNode = null // Sprite currently holding mouse down
let _ribbonSprite = null
let _anim = 0
let _gameView = null
let _spriteCount = 0
let _vertexCount = 0
let _quadVertexCount = 0
let _currentColor = [1, 1, 1, 1]

export let gl = null

// Get the sprite currently hovered by the mouse
export let getHovered = function()
{
    return _hoverSpriteNode
}

// Player1 will see the board inverted from its represented data
export let isInverted = function()
{
    return _isInverted
}

// Set wether that player views the board inverted or not
export let setInverted = function(isInverted)
{
    _isInverted = isInverted
}

// Add a sprite to the renderer
export let addSpriteNode = function(spriteNode)
{
    if (_spriteNodes.includes(spriteNode)) return;
    _spriteNodes.push(spriteNode)
}

export let removeSpriteNode = function(spriteNode)
{
    _spriteNodes.remove(spriteNode)
    _spriteNodes.filter(sn => sn !== spriteNode)
}

export let initialize = function(canvas)
{
    // Initialize webgl
    gl = canvas.getContext("webgl")
    
    if (!gl)
    {
        alert("Cannot initialize WebGL. Your browser or computer doesn't support it.")
        return
    }

    Resources.initialize(gl)

    _gameView = new SpriteNode();
    _gameView.setDrawOrder(DRAW_ORDER_BACKGROUND);
    _gameView.setDimension({x:WIDTH, y:HEIGHT});
    _gameView.setEnabled(true);
    addSpriteNode(_gameView);

    // Add the sprite for the ribbon at the middle
    _ribbonSprite = new SpriteNode(Resources._sprite_ribbon, {x:42, y:119}, DRAW_ORDER_BACKGROUND + 1, {x:237, y:3}, {x:4, y:3, z:4, w:0});
    _ribbonSprite.setClickThrough(true);
    addSpriteNode(_ribbonSprite);

    // BG Deco on each sides
    let deco = new SpriteNode(Resources._sprite_decoBg, {x:39, y:47}, DRAW_ORDER_BACKGROUND + 1, {x:240, y:71}, {x:7, y:7, z:7, w:7});
    deco.setClickThrough(true);
    addSpriteNode(deco);
    deco = new SpriteNode(Resources._sprite_decoBg, {x:39, y:HEIGHT - 47 - 70}, DRAW_ORDER_BACKGROUND + 1, {x:240, y:71}, {x:7, y:7, z:7, w:7});
    deco.setClickThrough(true);
    addSpriteNode(deco);
}

function resetRenderStates()
{
    // Render states
    gl.disable(gl.DEPTH_TEST); // No 3D, no depth required
    gl.disable(gl.CULL_FACE); // No cull face, it's 2D we always see
    gl.enable(gl.BLEND); // Blend on
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Alpha blend
    gl.viewport(0, 0, WIDTH * SCALE, HEIGHT * SCALE); // Viewport cover all window

    // Bind our only texture used, the sprite sheet
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, Resources._spriteSheet);
    gl.uniform1i(Resources._programInfo.uniformLocations.uSampler, 0);

    // Clear screen
    gl.clearColor(BACKGROUND_COLOR[0], BACKGROUND_COLOR[1], BACKGROUND_COLOR[2], BACKGROUND_COLOR[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set orthographic 2D view
    let projectionMatrix = mat4.create();
    mat4.ortho(projectionMatrix, 0, WIDTH, HEIGHT, 0, -999, 999)

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

    _spriteCount = 0
    _vertexCount = 0
    _quadVertexCount = 0
}

export let glBegin = function()
{
    // Do nothing, irrelevant
}

export let glEnd = function()
{
    // Do nothing. We just flush at the end of the frame or when vertex buffer is full
}

export let glColor4f = function(r, g, b, a)
{
    _currentColor[0] = r
    _currentColor[1] = g
    _currentColor[2] = b
    _currentColor[3] = a
}

export let glTexCoord2f = function(u, v)
{
    Resources._vertexBuffer.texCoordV[_vertexCount * 2] = u;
    Resources._vertexBuffer.texCoordV[_vertexCount * 2 + 1] = v;
}

export let glVertex2f = function(x, y)
{
    Resources._vertexBuffer.positionV[_vertexCount * 2] = x;
    Resources._vertexBuffer.positionV[_vertexCount * 2 + 1] = y;
    Resources._vertexBuffer.colorV[_vertexCount * 4] = _currentColor[0];
    Resources._vertexBuffer.colorV[_vertexCount * 4 + 1] = _currentColor[1];
    Resources._vertexBuffer.colorV[_vertexCount * 4 + 2] = _currentColor[2];
    Resources._vertexBuffer.colorV[_vertexCount * 4 + 3] = _currentColor[3];

    _vertexCount++
    _quadVertexCount++
    let index = _quadVertexCount % 4
    if (index === 3)
    {
        Resources._vertexBuffer.texCoordV[_vertexCount * 2] = Resources._vertexBuffer.texCoordV[(_vertexCount - 3) * 2];
        Resources._vertexBuffer.texCoordV[_vertexCount * 2 + 1] = Resources._vertexBuffer.texCoordV[(_vertexCount - 3) * 2 + 1];
        Resources._vertexBuffer.positionV[_vertexCount * 2] = Resources._vertexBuffer.positionV[(_vertexCount - 3) * 2];
        Resources._vertexBuffer.positionV[_vertexCount * 2 + 1] = Resources._vertexBuffer.positionV[(_vertexCount - 3) * 2 + 1];
        Resources._vertexBuffer.colorV[_vertexCount * 4] = Resources._vertexBuffer.colorV[(_vertexCount - 3) * 4];
        Resources._vertexBuffer.colorV[_vertexCount * 4 + 1] = Resources._vertexBuffer.colorV[(_vertexCount - 3) * 4 + 1];
        Resources._vertexBuffer.colorV[_vertexCount * 4 + 2] = Resources._vertexBuffer.colorV[(_vertexCount - 3) * 4 + 2];
        Resources._vertexBuffer.colorV[_vertexCount * 4 + 3] = Resources._vertexBuffer.colorV[(_vertexCount - 3) * 4 + 3];
        _vertexCount++

        Resources._vertexBuffer.texCoordV[_vertexCount * 2] = Resources._vertexBuffer.texCoordV[(_vertexCount - 2) * 2];
        Resources._vertexBuffer.texCoordV[_vertexCount * 2 + 1] = Resources._vertexBuffer.texCoordV[(_vertexCount - 2) * 2 + 1];
        Resources._vertexBuffer.positionV[_vertexCount * 2] = Resources._vertexBuffer.positionV[(_vertexCount - 2) * 2];
        Resources._vertexBuffer.positionV[_vertexCount * 2 + 1] = Resources._vertexBuffer.positionV[(_vertexCount - 2) * 2 + 1];
        Resources._vertexBuffer.colorV[_vertexCount * 4] = Resources._vertexBuffer.colorV[(_vertexCount - 2) * 4];
        Resources._vertexBuffer.colorV[_vertexCount * 4 + 1] = Resources._vertexBuffer.colorV[(_vertexCount - 2) * 4 + 1];
        Resources._vertexBuffer.colorV[_vertexCount * 4 + 2] = Resources._vertexBuffer.colorV[(_vertexCount - 2) * 4 + 2];
        Resources._vertexBuffer.colorV[_vertexCount * 4 + 3] = Resources._vertexBuffer.colorV[(_vertexCount - 2) * 4 + 3];
        _vertexCount++
    }
    else if (index === 0)
    {
        _spriteCount++
        if (_spriteCount >= MAX_SPRITE_COUNT)
        {
            flush()
        }
    }
}

export let update = function(dt)
{

}

export let flush = function()
{
    if (_spriteCount > 0)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, Resources._vertexBuffer.position);
        gl.bufferData(gl.ARRAY_BUFFER, Resources._vertexBuffer.positionV, gl.DYNAMIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, Resources._vertexBuffer.color);
        gl.bufferData(gl.ARRAY_BUFFER, Resources._vertexBuffer.colorV, gl.DYNAMIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, Resources._vertexBuffer.texCoord);
        gl.bufferData(gl.ARRAY_BUFFER, Resources._vertexBuffer.texCoordV, gl.DYNAMIC_DRAW);

        gl.drawArrays(gl.TRIANGLES, 0, _vertexCount)
    }
    _spriteCount = 0
    _vertexCount = 0
    _quadVertexCount = 0
}

export let renderView = function()
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

    flush();
}
