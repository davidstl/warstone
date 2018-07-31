import Sprite from "./Sprite"
let GameView = require("./GameView")

export let _spriteSheet = null;

export let SPRITE_SHEET_DIMENSION = {x:512.0, y:512.0}

// Define sprites
export let _sprite_ribbon = new Sprite(95, 184, 8, 5);
export let _sprite_dialog = new Sprite(1, 190, 16, 17);
export let _sprite_decoBg = new Sprite(62, 190, 14, 14);
export let _sprite_attackArrow = new Sprite(77, 190, 17, 24);

// buffs
export let _sprite_taunt = new Sprite(1, 219, 10, 11);
export let _sprite_nosleep = new Sprite(12, 219, 8, 11);

// Numbers and fonts
export let _sprite_numbers = [
    new Sprite(1, 240, 3, 5), // 0
    new Sprite(5, 240, 1, 5), // 1
    new Sprite(7, 240, 3, 5), // 2
    new Sprite(11, 240, 3, 5), // 3
    new Sprite(15, 240, 3, 5), // 4
    new Sprite(19, 240, 3, 5), // 5
    new Sprite(23, 240, 3, 5), // 6
    new Sprite(27, 240, 3, 5), // 7
    new Sprite(31, 240, 3, 5), // 8
    new Sprite(35, 240, 3, 5)  // 9
];
export let _sprite_font = [];
export let _sprite_HP = new Sprite(1, 246, 7, 5);

// Cards
export let _sprite_blueCardBack = new Sprite(1, 1, 46, 62);
export let _sprite_redCardBack = new Sprite(48, 1, 46, 62);

// Suit
export let _sprite_rockCard = new Sprite(95, 1, 46, 62);
export let _sprite_paperCard = new Sprite(142, 1, 46, 62);
export let _sprite_scissorsCard = new Sprite(189, 1, 46, 62);

//Â Card hover states
export let _sprite_hoverCard = new Sprite(48, 64, 46, 62);
export let _sprite_rockHoverCard = new Sprite(95, 64, 46, 62);
export let _sprite_paperHoverCard = new Sprite(142, 64, 46, 62);
export let _sprite_scissorsHoverCard = new Sprite(189, 64, 46, 62);

// Buttons
export let _sprite_btnAdvanceUp = new Sprite(95, 127, 39, 18);
export let _sprite_btnAdvanceHover = new Sprite(95, 146, 39, 18);
export let _sprite_btnAdvanceDown = new Sprite(95, 165, 39, 18);
export let _sprite_btnOkUp = new Sprite(135, 127, 19, 18);
export let _sprite_btnOkHover = new Sprite(135, 146, 19, 18);
export let _sprite_btnOkDown = new Sprite(135, 165, 19, 18);
export let _sprite_playerUp = new Sprite(1, 257, 51, 37);
export let _sprite_playerHover = new Sprite(1, 295, 51, 37);
export let _sprite_playerDown = new Sprite(1, 333, 51, 37);

// Energy bar
export let _sprite_energyBg = new Sprite(18, 190, 43, 13);
export let _sprite_energy = new Sprite(28, 204, 31, 5);
export let _sprite_energySlash = new Sprite(9, 246, 3, 5);

// Icons
export let _sprite_energyIcon = new Sprite(1, 232, 7, 7);
export let _sprite_energyIconAnim = [
    _sprite_energyIcon,
    new Sprite(9, 232, 7, 7),
    new Sprite(17, 232, 7, 7),
    new Sprite(25, 232, 7, 7),
    new Sprite(33, 232, 7, 7),
    new Sprite(41, 232, 7, 7)
];
export let _sprite_healthIcon = new Sprite(49, 233, 7, 6);
export let _sprite_attackIcon = new Sprite(57, 232, 7, 7);
export let _sprite_x = new Sprite(1, 208, 10, 10);

export let _sprite_cardArtMap = {};

export let _programInfo = null
export let _vertexBuffer = null

const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute vec2 aVertexTexCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;
    varying highp vec2 vTexCoord;

    void main()
    {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
        vTexCoord = aVertexTexCoord;
    }
`

const fsSource = `
    varying lowp vec4 vColor;
    varying highp vec2 vTexCoord;

    uniform sampler2D uSampler;

    void main()
    {
        gl_FragColor = texture2D(uSampler, vTexCoord);
    }
`

function loadShader(gl, type, source)
{
    const shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initShaderProgram(gl, vsSource, fsSource)
{
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
    {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function initBuffers(gl)
{
    const positionBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    const texCoordBuffer = gl.createBuffer();
  
    const positions = [
        0,  0,
        0,  100,
        100, 100,
        0,  0,
        100, 100,
        100, 0,
    ]
    const colors = [
        1, 0, 0, 1,
        0, 1, 0, 1,
        0, 0, 1, 1,
        1, 0, 0, 1,
        0, 0, 1, 1,
        1, 1, 0, 1
    ]
    const texCoords = [
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0
    ]

    // Create buffers for dynamic draw
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
  
    return {
        position: positionBuffer,
        color: colorBuffer,
        texCoord: texCoordBuffer
    };
}

export function initialize()
{
    let gl = GameView.gl

    // Create a texture.
    _spriteSheet = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, _spriteSheet)
    
    // Fill the texture with a 1x1 purple pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 255, 255]))
    
    // Asynchronously load an image
    let image = new Image()
    image.src = "spritesheet.png"
    image.addEventListener('load', () =>
    {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, _spriteSheet)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    })

    let shaderProgram = initShaderProgram(gl, vsSource, fsSource)

    _programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
            vertexTexCoord: gl.getAttribLocation(shaderProgram, 'aVertexTexCoord')
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            uSampler: gl.getUniformLocation(shaderProgram, 'uSampler')
        },
    };

    _vertexBuffer = initBuffers(gl)

    generateFont()
    loadCardArt()
}

export function destroy()
{
    _spriteSheet = null;
}

function generateFont()
{
    for (let i = 0; i <= 'Z'.charCodeAt(0) - '!'.charCodeAt(0); ++i)
    {
        _sprite_font.push(new Sprite(1 + i * 4, 252, 3, 5));
    }
}

function loadCardArt()
{
    _sprite_cardArtMap.Pebble = new Sprite(389, 1, 40, 32); // Pebble
    _sprite_cardArtMap.Stone = new Sprite(389, 34, 40, 32); // Stone
    _sprite_cardArtMap.Brick = new Sprite(389, 67, 40, 32); // Brick
    _sprite_cardArtMap.Boulder = new Sprite(389, 100, 40, 32); // Boulder
    _sprite_cardArtMap.Mountain = new Sprite(389, 133, 40, 32); // Mountain
    _sprite_cardArtMap.Planet = new Sprite(389, 166, 40, 32); // Planet

    _sprite_cardArtMap.Note = new Sprite(430, 1, 40, 32); // Note
    _sprite_cardArtMap.Card = new Sprite(430, 34, 40, 32); // Card
    _sprite_cardArtMap.Letter = new Sprite(430, 67, 40, 32); // Letter
    _sprite_cardArtMap.Tome = new Sprite(430, 100, 40, 32); // Tome
    _sprite_cardArtMap.Bookshelf = new Sprite(430, 133, 40, 32); // Bookshelf
    _sprite_cardArtMap.Library = new Sprite(430, 166, 40, 32); // Library

    _sprite_cardArtMap.Pin = new Sprite(471, 1, 40, 32); // Pin
    _sprite_cardArtMap.Scissors = new Sprite(471, 34, 40, 32); // Scissors
    _sprite_cardArtMap.Razor = new Sprite(471, 67, 40, 32); // Razor
    _sprite_cardArtMap.Machete = new Sprite(471, 100, 40, 32); // Machete
    _sprite_cardArtMap.Zweihander = new Sprite(471, 133, 40, 32); // Zweihander
    _sprite_cardArtMap.Guillotine = new Sprite(471, 166, 40, 32); // Guillotine
}
