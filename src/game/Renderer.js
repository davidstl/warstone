let Constants = require('./Constants')
let mat4 = require('gl-matrix/src/gl-matrix/mat4')

let MAX_SPRITE_COUNT = 300

let gl = null

// Res
let _programInfo = null
let _vertexBuffer = null
let _spriteSheet = null

// State
let _spriteCount = 0
let _vertexCount = 0
let _quadVertexCount = 0
let _currentColor = [1, 1, 1, 1]

exports.initialize = function(canvas)
{
    // Initialize webgl
    gl = canvas.getContext("webgl")
    
    if (!gl)
    {
        alert("Cannot initialize WebGL. Your browser or computer doesn't support it.")
        return
    }

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

    // Create a texture.
    _spriteSheet = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, _spriteSheet)
    
    // Fill the texture with a 1x1 invisible pixel so we don't see the texture until its loaded.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]))
    
    // Asynchronously load an image
    let image = new Image()
    image.src = "spritesheet.png"
    image.addEventListener('load', () =>
    {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, _spriteSheet)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    })
}

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

    let positionV = new Float32Array(MAX_SPRITE_COUNT * 6 * 2);
    let colorV = new Float32Array(MAX_SPRITE_COUNT * 6 * 4);
    let texCoordV = new Float32Array(MAX_SPRITE_COUNT * 6 * 2);

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

exports.beginFrame = function()
{
    // Render states
    gl.disable(gl.DEPTH_TEST); // No 3D, no depth required
    gl.disable(gl.CULL_FACE); // No cull face, it's 2D we always see
    gl.enable(gl.BLEND); // Blend on
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Alpha blend
    gl.viewport(0, 0, Constants.WIDTH * Constants.SCALE, Constants.HEIGHT * Constants.SCALE); // Viewport cover all window

    // Bind our only texture used, the sprite sheet
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, _spriteSheet);
    gl.uniform1i(_programInfo.uniformLocations.uSampler, 0);

    // Clear screen
    // gl.clearColor(Constants.BACKGROUND_COLOR[0], Constants.BACKGROUND_COLOR[1], Constants.BACKGROUND_COLOR[2], Constants.BACKGROUND_COLOR[3]);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set orthographic 2D view
    let projectionMatrix = mat4.create();
    mat4.ortho(projectionMatrix, 0, Constants.WIDTH, Constants.HEIGHT, 0, -999, 999)

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
        gl.bindBuffer(gl.ARRAY_BUFFER, _vertexBuffer.position);
        gl.vertexAttribPointer(
            _programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            _programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, _vertexBuffer.color);
        gl.vertexAttribPointer(
            _programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            _programInfo.attribLocations.vertexColor);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, _vertexBuffer.texCoord);
        gl.vertexAttribPointer(
            _programInfo.attribLocations.vertexTexCoord,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            _programInfo.attribLocations.vertexTexCoord);
    }

    // Tell WebGL to use our program when drawing
    gl.useProgram(_programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
        _programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        _programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    _spriteCount = 0
    _vertexCount = 0
    _quadVertexCount = 0
}

exports.glBegin = function()
{
    // Do nothing, irrelevant
}

exports.glEnd = function()
{
    // Do nothing. We just flush at the end of the frame or when vertex buffer is full
}

exports.glColor4f = function(r, g, b, a)
{
    _currentColor[0] = r
    _currentColor[1] = g
    _currentColor[2] = b
    _currentColor[3] = a
}

exports.glTexCoord2f = function(u, v)
{
    _vertexBuffer.texCoordV[_vertexCount * 2] = u;
    _vertexBuffer.texCoordV[_vertexCount * 2 + 1] = v;
}

exports.glVertex2f = function(x, y)
{
    _vertexBuffer.positionV[_vertexCount * 2] = x;
    _vertexBuffer.positionV[_vertexCount * 2 + 1] = y;
    _vertexBuffer.colorV[_vertexCount * 4] = _currentColor[0];
    _vertexBuffer.colorV[_vertexCount * 4 + 1] = _currentColor[1];
    _vertexBuffer.colorV[_vertexCount * 4 + 2] = _currentColor[2];
    _vertexBuffer.colorV[_vertexCount * 4 + 3] = _currentColor[3];

    _vertexCount++
    _quadVertexCount++
    let index = _quadVertexCount % 4
    if (index === 3)
    {
        _vertexBuffer.texCoordV[_vertexCount * 2] = _vertexBuffer.texCoordV[(_vertexCount - 3) * 2];
        _vertexBuffer.texCoordV[_vertexCount * 2 + 1] = _vertexBuffer.texCoordV[(_vertexCount - 3) * 2 + 1];
        _vertexBuffer.positionV[_vertexCount * 2] = _vertexBuffer.positionV[(_vertexCount - 3) * 2];
        _vertexBuffer.positionV[_vertexCount * 2 + 1] = _vertexBuffer.positionV[(_vertexCount - 3) * 2 + 1];
        _vertexBuffer.colorV[_vertexCount * 4] = _vertexBuffer.colorV[(_vertexCount - 3) * 4];
        _vertexBuffer.colorV[_vertexCount * 4 + 1] = _vertexBuffer.colorV[(_vertexCount - 3) * 4 + 1];
        _vertexBuffer.colorV[_vertexCount * 4 + 2] = _vertexBuffer.colorV[(_vertexCount - 3) * 4 + 2];
        _vertexBuffer.colorV[_vertexCount * 4 + 3] = _vertexBuffer.colorV[(_vertexCount - 3) * 4 + 3];
        _vertexCount++

        _vertexBuffer.texCoordV[_vertexCount * 2] = _vertexBuffer.texCoordV[(_vertexCount - 2) * 2];
        _vertexBuffer.texCoordV[_vertexCount * 2 + 1] = _vertexBuffer.texCoordV[(_vertexCount - 2) * 2 + 1];
        _vertexBuffer.positionV[_vertexCount * 2] = _vertexBuffer.positionV[(_vertexCount - 2) * 2];
        _vertexBuffer.positionV[_vertexCount * 2 + 1] = _vertexBuffer.positionV[(_vertexCount - 2) * 2 + 1];
        _vertexBuffer.colorV[_vertexCount * 4] = _vertexBuffer.colorV[(_vertexCount - 2) * 4];
        _vertexBuffer.colorV[_vertexCount * 4 + 1] = _vertexBuffer.colorV[(_vertexCount - 2) * 4 + 1];
        _vertexBuffer.colorV[_vertexCount * 4 + 2] = _vertexBuffer.colorV[(_vertexCount - 2) * 4 + 2];
        _vertexBuffer.colorV[_vertexCount * 4 + 3] = _vertexBuffer.colorV[(_vertexCount - 2) * 4 + 3];
        _vertexCount++
    }
    else if (index === 0)
    {
        _spriteCount++
        if (_spriteCount >= MAX_SPRITE_COUNT)
        {
            exports.flush()
        }
    }
}

exports.flush = function()
{
    if (_spriteCount > 0)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, _vertexBuffer.position);
        gl.bufferData(gl.ARRAY_BUFFER, _vertexBuffer.positionV, gl.DYNAMIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, _vertexBuffer.color);
        gl.bufferData(gl.ARRAY_BUFFER, _vertexBuffer.colorV, gl.DYNAMIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, _vertexBuffer.texCoord);
        gl.bufferData(gl.ARRAY_BUFFER, _vertexBuffer.texCoordV, gl.DYNAMIC_DRAW);

        gl.drawArrays(gl.TRIANGLES, 0, _vertexCount)
    }
    _spriteCount = 0
    _vertexCount = 0
    _quadVertexCount = 0
}

exports.endFrame = function()
{
    exports.flush()
}
