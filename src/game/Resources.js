exports.SPRITE_SHEET_DIMENSION = {x:512.0, y:512.0}
exports.MAX_SPRITE_COUNT = 300

exports._spriteSheet = null

// Define sprites
exports._sprite_ribbon = makeSprite(95, 184, 8, 5);
exports._sprite_dialog = makeSprite(1, 190, 16, 17);
exports._sprite_decoBg = makeSprite(62, 190, 14, 14);
exports._sprite_attackArrow = makeSprite(77, 190, 17, 24);

// buffs
exports._sprite_taunt = makeSprite(1, 219, 10, 11);
exports._sprite_nosleep = makeSprite(12, 219, 8, 11);

// Numbers and fonts
exports._sprite_numbers = [
    makeSprite(1, 240, 3, 5), // 0
    makeSprite(5, 240, 1, 5), // 1
    makeSprite(7, 240, 3, 5), // 2
    makeSprite(11, 240, 3, 5), // 3
    makeSprite(15, 240, 3, 5), // 4
    makeSprite(19, 240, 3, 5), // 5
    makeSprite(23, 240, 3, 5), // 6
    makeSprite(27, 240, 3, 5), // 7
    makeSprite(31, 240, 3, 5), // 8
    makeSprite(35, 240, 3, 5)  // 9
];
exports._sprite_font = [];
exports._sprite_HP = makeSprite(1, 246, 7, 5);

// Cards
exports._sprite_blueCardBack = makeSprite(1, 1, 46, 62);
exports._sprite_redCardBack = makeSprite(48, 1, 46, 62);

// Suit
exports._sprite_rockCard = makeSprite(95, 1, 46, 62);
exports._sprite_paperCard = makeSprite(142, 1, 46, 62);
exports._sprite_scissorsCard = makeSprite(189, 1, 46, 62);

//Â Card hover states
exports._sprite_hoverCard = makeSprite(48, 64, 46, 62);
exports._sprite_rockHoverCard = makeSprite(95, 64, 46, 62);
exports._sprite_paperHoverCard = makeSprite(142, 64, 46, 62);
exports._sprite_scissorsHoverCard = makeSprite(189, 64, 46, 62);

// Buttons
exports._sprite_btnAdvanceUp = makeSprite(95, 127, 39, 18);
exports._sprite_btnAdvanceHover = makeSprite(95, 146, 39, 18);
exports._sprite_btnAdvanceDown = makeSprite(95, 165, 39, 18);
exports._sprite_btnOkUp = makeSprite(135, 127, 19, 18);
exports._sprite_btnOkHover = makeSprite(135, 146, 19, 18);
exports._sprite_btnOkDown = makeSprite(135, 165, 19, 18);
exports._sprite_playerUp = makeSprite(1, 257, 51, 37);
exports._sprite_playerHover = makeSprite(1, 295, 51, 37);
exports._sprite_playerDown = makeSprite(1, 333, 51, 37);

// Energy bar
exports._sprite_energyBg = makeSprite(18, 190, 43, 13);
exports._sprite_energy = makeSprite(28, 204, 31, 5);
exports._sprite_energySlash = makeSprite(9, 246, 3, 5);

// Icons
exports._sprite_energyIcon = makeSprite(1, 232, 7, 7);
exports._sprite_energyIconAnim = [
    exports._sprite_energyIcon,
    makeSprite(9, 232, 7, 7),
    makeSprite(17, 232, 7, 7),
    makeSprite(25, 232, 7, 7),
    makeSprite(33, 232, 7, 7),
    makeSprite(41, 232, 7, 7)
];
exports._sprite_healthIcon = makeSprite(49, 233, 7, 6);
exports._sprite_attackIcon = makeSprite(57, 232, 7, 7);
exports._sprite_x = makeSprite(1, 208, 10, 10);

exports._sprite_cardArtMap = {};

exports._programInfo = null
exports._vertexBuffer = null

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
        gl_FragColor = vColor * texture2D(uSampler, vTexCoord);
    }
`

function makeSprite(x, y, w, h)
{
    return {
        width: w,
        height: h,
        u1: (x) / exports.SPRITE_SHEET_DIMENSION.x,
        v1: (y) / exports.SPRITE_SHEET_DIMENSION.y,
        u2: (x + w) / exports.SPRITE_SHEET_DIMENSION.x,
        v2: (y + h) / exports.SPRITE_SHEET_DIMENSION.y
    }
}

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

    let positionV = new Float32Array(exports.MAX_SPRITE_COUNT * 6 * 2);
    let colorV = new Float32Array(exports.MAX_SPRITE_COUNT * 6 * 4);
    let texCoordV = new Float32Array(exports.MAX_SPRITE_COUNT * 6 * 2);

    // Create buffers for dynamic draw
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionV, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colorV, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoordV, gl.DYNAMIC_DRAW);
  
    return {
        position: positionBuffer,
        color: colorBuffer,
        texCoord: texCoordBuffer,

        positionV: positionV,
        colorV: colorV,
        texCoordV: texCoordV
    };
}

exports.initialize = function(gl)
{
    // Create a texture.
    exports._spriteSheet = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, exports._spriteSheet)
    
    // Fill the texture with a 1x1 invisible pixel so we don't see the texture until its loaded.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]))
    
    // Asynchronously load an image
    let image = new Image()
    image.src = "spritesheet.png"
    image.addEventListener('load', () =>
    {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, exports._spriteSheet)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    })

    let shaderProgram = initShaderProgram(gl, vsSource, fsSource)

    exports._programInfo = {
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

    exports._vertexBuffer = initBuffers(gl)

    generateFont()
    loadCardArt()
}

exports.destroy = function()
{
    exports._spriteSheet = null;
}

function generateFont()
{
    for (let i = 0; i <= 'Z'.charCodeAt(0) - '!'.charCodeAt(0); ++i)
    {
        exports._sprite_font.push(makeSprite(1 + i * 4, 252, 3, 5));
    }
}

function loadCardArt()
{
    exports._sprite_cardArtMap.Pebble = makeSprite(389, 1, 40, 32); // Pebble
    exports._sprite_cardArtMap.Stone = makeSprite(389, 34, 40, 32); // Stone
    exports._sprite_cardArtMap.Brick = makeSprite(389, 67, 40, 32); // Brick
    exports._sprite_cardArtMap.Boulder = makeSprite(389, 100, 40, 32); // Boulder
    exports._sprite_cardArtMap.Mountain = makeSprite(389, 133, 40, 32); // Mountain
    exports._sprite_cardArtMap.Planet = makeSprite(389, 166, 40, 32); // Planet

    exports._sprite_cardArtMap.Note = makeSprite(430, 1, 40, 32); // Note
    exports._sprite_cardArtMap.Card = makeSprite(430, 34, 40, 32); // Card
    exports._sprite_cardArtMap.Letter = makeSprite(430, 67, 40, 32); // Letter
    exports._sprite_cardArtMap.Tome = makeSprite(430, 100, 40, 32); // Tome
    exports._sprite_cardArtMap.Bookshelf = makeSprite(430, 133, 40, 32); // Bookshelf
    exports._sprite_cardArtMap.Library = makeSprite(430, 166, 40, 32); // Library

    exports._sprite_cardArtMap.Pin = makeSprite(471, 1, 40, 32); // Pin
    exports._sprite_cardArtMap.Scissors = makeSprite(471, 34, 40, 32); // Scissors
    exports._sprite_cardArtMap.Razor = makeSprite(471, 67, 40, 32); // Razor
    exports._sprite_cardArtMap.Machete = makeSprite(471, 100, 40, 32); // Machete
    exports._sprite_cardArtMap.Zweihander = makeSprite(471, 133, 40, 32); // Zweihander
    exports._sprite_cardArtMap.Guillotine = makeSprite(471, 166, 40, 32); // Guillotine
}
