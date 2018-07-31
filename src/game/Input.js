exports.mousePos = {x:0, y:0}
exports.lastMouseDown = false
exports.mouseDown = false

exports.isMouseJustDown = function()
{
    return !exports.lastMouseDown && exports.mouseDown
}

exports.isMouseJustReleased = function()
{
    return exports.lastMouseDown && !exports.mouseDown
}
