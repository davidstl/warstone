let Constants = require("./Constants")
let Renderer = require("./Renderer")
let Resources = require("./Resources")

let INV_SPRITESHEET_WIDTH = 1 / Constants.SPRITE_SHEET_DIMENSION.width
let INV_SPRITESHEET_HEIGHT = 1 / Constants.SPRITE_SHEET_DIMENSION.height

exports.makeSprite = function(x, y, w, h)
{
    return {
        width: w,
        height: h,
        u1: (x) * INV_SPRITESHEET_WIDTH,
        v1: (y) * INV_SPRITESHEET_HEIGHT,
        u2: (x + w) * INV_SPRITESHEET_WIDTH,
        v2: (y + h) * INV_SPRITESHEET_HEIGHT
    }
}

exports.renderPos = function(sprite, pos)
{
    exports.renderPosDim(sprite, pos, {x:sprite.width, y:sprite.height});
}

exports.renderPosColor = function(sprite, pos, color)
{
    exports.renderPosDimColor(sprite, pos, {x:sprite.width, y:sprite.height}, color);
}

exports.renderGlow = function(spriteNode)
{
    let pos = {...spriteNode.getPosition()}
    let dim = {...spriteNode.getDimension()}
    pos.x -= 10
    pos.y -= 10
    dim.x += 20
    dim.y += 20
    exports.render9Slice(Resources._sprite_greenGlow, pos, dim, {x:16, y:16, z:16, w:16})
}

exports.renderPosDim = function(sprite, pos, dimension)
{
    let x = Math.floor(pos.x);
    let y = Math.floor(pos.y);
    let u1 = sprite.u1;
    let v1 = sprite.v1;
    Renderer.glBegin();
        Renderer.glTexCoord2f(u1, v1);
        Renderer.glVertex2f(x, y);
        Renderer.glTexCoord2f(u1, (v1 + dimension.y * INV_SPRITESHEET_HEIGHT));
        Renderer.glVertex2f(x, y + dimension.y);
        Renderer.glTexCoord2f((u1 + dimension.x * INV_SPRITESHEET_WIDTH), (v1 + dimension.y * INV_SPRITESHEET_HEIGHT));
        Renderer.glVertex2f(x + dimension.x, y + dimension.y);
        Renderer.glTexCoord2f((u1 + dimension.x * INV_SPRITESHEET_WIDTH), v1);
        Renderer.glVertex2f(x + dimension.x, y);
    Renderer.glEnd();
}

exports.renderPosDimColor = function(sprite, pos, dimension, color)
{
    Renderer.glColor4f(color[0], color[1], color[2], color[3]);
    exports.renderPosDim(sprite, pos, dimension);
    Renderer.glColor4f(1, 1, 1, 1);
}

exports.render9Slice = function(sprite, pos, dimension, padding)
{
    let x = Math.floor(pos.x);
    let y = Math.floor(pos.y);

    let w = dimension.x;
    let h = dimension.y;

    let left = padding.x;
    let top = padding.y;
    let right = padding.z;
    let bottom = padding.w;

    let u1 = sprite.u1;
    let v1 = sprite.v1;
    let u2 = sprite.u2;
    let v2 = sprite.v2;

    let u_left = u1 + left * INV_SPRITESHEET_WIDTH;
    let v_top = v1 + top * INV_SPRITESHEET_HEIGHT;
    let u_right = u2 - right * INV_SPRITESHEET_WIDTH;
    let v_bottom = v2 - bottom * INV_SPRITESHEET_HEIGHT;

    Renderer.glBegin();
        Renderer.glTexCoord2f(u1, v1);
        Renderer.glVertex2f(x, y);
        Renderer.glTexCoord2f(u1, v_top);
        Renderer.glVertex2f(x, y + top);
        Renderer.glTexCoord2f(u_left, v_top);
        Renderer.glVertex2f(x + left, y + top);
        Renderer.glTexCoord2f(u_left, v1);
        Renderer.glVertex2f(x + left, y);

        Renderer.glTexCoord2f(u_left, v1);
        Renderer.glVertex2f(x + left, y);
        Renderer.glTexCoord2f(u_left, v_top);
        Renderer.glVertex2f(x + left, y + top);
        Renderer.glTexCoord2f(u_right, v_top);
        Renderer.glVertex2f(x + w - right, y + top);
        Renderer.glTexCoord2f(u_right, v1);
        Renderer.glVertex2f(x + w - right, y);
            
        Renderer.glTexCoord2f(u_right, v1);
        Renderer.glVertex2f(x + w - right, y);
        Renderer.glTexCoord2f(u_right, v_top);
        Renderer.glVertex2f(x + w - right, y + top);
        Renderer.glTexCoord2f(u2, v_top);
        Renderer.glVertex2f(x + w, y + top);
        Renderer.glTexCoord2f(u2, v1);
        Renderer.glVertex2f(x + w, y);
            
        Renderer.glTexCoord2f(u1, v_top);
        Renderer.glVertex2f(x, y + top);
        Renderer.glTexCoord2f(u1, v_bottom);
        Renderer.glVertex2f(x, y + h - bottom);
        Renderer.glTexCoord2f(u_left, v_bottom);
        Renderer.glVertex2f(x + left, y + h - bottom);
        Renderer.glTexCoord2f(u_left, v_top);
        Renderer.glVertex2f(x + left, y + top);

        Renderer.glTexCoord2f(u_left, v_top);
        Renderer.glVertex2f(x + left, y + top);
        Renderer.glTexCoord2f(u_left, v_bottom);
        Renderer.glVertex2f(x + left, y + h - bottom);
        Renderer.glTexCoord2f(u_right, v_bottom);
        Renderer.glVertex2f(x + w - right, y + h - bottom);
        Renderer.glTexCoord2f(u_right, v_top);
        Renderer.glVertex2f(x + w - right, y + top);
            
        Renderer.glTexCoord2f(u_right, v_top);
        Renderer.glVertex2f(x + w - right, y + top);
        Renderer.glTexCoord2f(u_right, v_bottom);
        Renderer.glVertex2f(x + w - right, y + h - bottom);
        Renderer.glTexCoord2f(u2, v_bottom);
        Renderer.glVertex2f(x + w, y + h - bottom);
        Renderer.glTexCoord2f(u2, v_top);
        Renderer.glVertex2f(x + w, y + top);
            
        Renderer.glTexCoord2f(u1, v_bottom);
        Renderer.glVertex2f(x, y + h - bottom);
        Renderer.glTexCoord2f(u1, v2);
        Renderer.glVertex2f(x, y + h);
        Renderer.glTexCoord2f(u_left, v2);
        Renderer.glVertex2f(x + left, y + h);
        Renderer.glTexCoord2f(u_left, v_bottom);
        Renderer.glVertex2f(x + left, y + h - bottom);

        Renderer.glTexCoord2f(u_left, v_bottom);
        Renderer.glVertex2f(x + left, y + h - bottom);
        Renderer.glTexCoord2f(u_left, v2);
        Renderer.glVertex2f(x + left, y + h);
        Renderer.glTexCoord2f(u_right, v2);
        Renderer.glVertex2f(x + w - right, y + h);
        Renderer.glTexCoord2f(u_right, v_bottom);
        Renderer.glVertex2f(x + w - right, y + h - bottom);
            
        Renderer.glTexCoord2f(u_right, v_bottom);
        Renderer.glVertex2f(x + w - right, y + h - bottom);
        Renderer.glTexCoord2f(u_right, v2);
        Renderer.glVertex2f(x + w - right, y + h);
        Renderer.glTexCoord2f(u2, v2);
        Renderer.glVertex2f(x + w, y + h);
        Renderer.glTexCoord2f(u2, v_bottom);
        Renderer.glVertex2f(x + w, y + h - bottom);
    Renderer.glEnd();
}
