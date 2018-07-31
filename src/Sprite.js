let Resources = require("./Resources")
let GameView = require("./GameView")

class Sprite
{
    constructor(x, y, w, h)
    {
        this.width = w
        this.height = h
        this.u1 = (x) / Resources.SPRITE_SHEET_DIMENSION.x
        this.v1 = (y) / Resources.SPRITE_SHEET_DIMENSION.y
        this.u2 = (x + w) / Resources.SPRITE_SHEET_DIMENSION.x
        this.v2 = (y + h) / Resources.SPRITE_SHEET_DIMENSION.y
    }

    getUVs()
    {
        return {x:this.u1, y:this.v1, z:this.u2, w:this.v2}
    }

    renderPos(pos)
    {
        this.renderPosDim(pos, {x:this.width, y:this.height});
    }

    renderPosColor(pos, color)
    {
        this.renderPosDimColor(pos, {x:this.width, y:this.height}, color);
    }

    renderPosDim(pos, dimension)
    {
        let x = Math.floor(pos.x);
        let y = Math.floor(pos.y);
        let u1 = this.u1;
        let v1 = this.v1;
        GameView.glBegin();
            GameView.glTexCoord2f(u1, v1);
            GameView.glVertex2f(x, y);
            GameView.glTexCoord2f(u1, (v1 + dimension.y / Resources.SPRITE_SHEET_DIMENSION.y));
            GameView.glVertex2f(x, y + dimension.y);
            GameView.glTexCoord2f((u1 + dimension.x / Resources.SPRITE_SHEET_DIMENSION.x), (v1 + dimension.y / Resources.SPRITE_SHEET_DIMENSION.y));
            GameView.glVertex2f(x + dimension.x, y + dimension.y);
            GameView.glTexCoord2f((u1 + dimension.x / Resources.SPRITE_SHEET_DIMENSION.x), v1);
            GameView.glVertex2f(x + dimension.x, y);
        GameView.glEnd();
    }

    renderPosDimColor(pos, dimension, color)
    {
        GameView.glColor4f(color[0], color[1], color[2], color[3]);
        this.renderPosDim(pos, dimension);
        GameView.glColor4f(1, 1, 1, 1);
    }

    render9Slice(pos, dimension, padding)
    {
        let x = Math.floor(pos.x);
        let y = Math.floor(pos.y);

        let w = dimension.x;
        let h = dimension.y;

        let left = padding.x;
        let top = padding.y;
        let right = padding.z;
        let bottom = padding.w;

        let u_left = this.u1 + left / Resources.SPRITE_SHEET_DIMENSION.x;
        let v_top = this.v1 + top / Resources.SPRITE_SHEET_DIMENSION.y;
        let u_right = this.u2 - right / Resources.SPRITE_SHEET_DIMENSION.x;
        let v_bottom = this.v2 - bottom / Resources.SPRITE_SHEET_DIMENSION.y;

        let u1 = this.u1;
        let v1 = this.v1;
        let u2 = this.u2;
        let v2 = this.v2;

        GameView.glBegin();
            GameView.glTexCoord2f(u1, v1);
            GameView.glVertex2f(x, y);
            GameView.glTexCoord2f(u1, v_top);
            GameView.glVertex2f(x, y + top);
            GameView.glTexCoord2f(u_left, v_top);
            GameView.glVertex2f(x + left, y + top);
            GameView.glTexCoord2f(u_left, v1);
            GameView.glVertex2f(x + left, y);

            GameView.glTexCoord2f(u_left, v1);
            GameView.glVertex2f(x + left, y);
            GameView.glTexCoord2f(u_left, v_top);
            GameView.glVertex2f(x + left, y + top);
            GameView.glTexCoord2f(u_right, v_top);
            GameView.glVertex2f(x + w - right, y + top);
            GameView.glTexCoord2f(u_right, v1);
            GameView.glVertex2f(x + w - right, y);
            
            GameView.glTexCoord2f(u_right, v1);
            GameView.glVertex2f(x + w - right, y);
            GameView.glTexCoord2f(u_right, v_top);
            GameView.glVertex2f(x + w - right, y + top);
            GameView.glTexCoord2f(u2, v_top);
            GameView.glVertex2f(x + w, y + top);
            GameView.glTexCoord2f(u2, v1);
            GameView.glVertex2f(x + w, y);
            
            GameView.glTexCoord2f(u1, v_top);
            GameView.glVertex2f(x, y + top);
            GameView.glTexCoord2f(u1, v_bottom);
            GameView.glVertex2f(x, y + h - bottom);
            GameView.glTexCoord2f(u_left, v_bottom);
            GameView.glVertex2f(x + left, y + h - bottom);
            GameView.glTexCoord2f(u_left, v_top);
            GameView.glVertex2f(x + left, y + top);

            GameView.glTexCoord2f(u_left, v_top);
            GameView.glVertex2f(x + left, y + top);
            GameView.glTexCoord2f(u_left, v_bottom);
            GameView.glVertex2f(x + left, y + h - bottom);
            GameView.glTexCoord2f(u_right, v_bottom);
            GameView.glVertex2f(x + w - right, y + h - bottom);
            GameView.glTexCoord2f(u_right, v_top);
            GameView.glVertex2f(x + w - right, y + top);
            
            GameView.glTexCoord2f(u_right, v_top);
            GameView.glVertex2f(x + w - right, y + top);
            GameView.glTexCoord2f(u_right, v_bottom);
            GameView.glVertex2f(x + w - right, y + h - bottom);
            GameView.glTexCoord2f(u2, v_bottom);
            GameView.glVertex2f(x + w, y + h - bottom);
            GameView.glTexCoord2f(u2, v_top);
            GameView.glVertex2f(x + w, y + top);
            
            GameView.glTexCoord2f(u1, v_bottom);
            GameView.glVertex2f(x, y + h - bottom);
            GameView.glTexCoord2f(u1, v2);
            GameView.glVertex2f(x, y + h);
            GameView.glTexCoord2f(u_left, v2);
            GameView.glVertex2f(x + left, y + h);
            GameView.glTexCoord2f(u_left, v_bottom);
            GameView.glVertex2f(x + left, y + h - bottom);

            GameView.glTexCoord2f(u_left, v_bottom);
            GameView.glVertex2f(x + left, y + h - bottom);
            GameView.glTexCoord2f(u_left, v2);
            GameView.glVertex2f(x + left, y + h);
            GameView.glTexCoord2f(u_right, v2);
            GameView.glVertex2f(x + w - right, y + h);
            GameView.glTexCoord2f(u_right, v_bottom);
            GameView.glVertex2f(x + w - right, y + h - bottom);
            
            GameView.glTexCoord2f(u_right, v_bottom);
            GameView.glVertex2f(x + w - right, y + h - bottom);
            GameView.glTexCoord2f(u_right, v2);
            GameView.glVertex2f(x + w - right, y + h);
            GameView.glTexCoord2f(u2, v2);
            GameView.glVertex2f(x + w, y + h);
            GameView.glTexCoord2f(u2, v_bottom);
            GameView.glVertex2f(x + w, y + h - bottom);
        GameView.glEnd();
    }
}

export default Sprite
