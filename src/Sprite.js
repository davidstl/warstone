let Resources = require("./Resources")

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
        // glBegin(GL_QUADS);
        //     glTexCoord2f(u1, v1);
        //     glVertex2f(x, y);
        //     glTexCoord2f(u1, (v1 + dimension.y / Resources.SPRITE_SHEET_DIMENSION.y));
        //     glVertex2f(x, y + dimension.y);
        //     glTexCoord2f((u1 + dimension.x / Resources.SPRITE_SHEET_DIMENSION.x), (v1 + dimension.y / Resources.SPRITE_SHEET_DIMENSION.y));
        //     glVertex2f(x + dimension.x, y + dimension.y);
        //     glTexCoord2f((u1 + dimension.x / Resources.SPRITE_SHEET_DIMENSION.x), v1);
        //     glVertex2f(x + dimension.x, y);
        // glEnd();
    }

    renderPosDimColor(pos, dimension, color)
    {
        // glColor4f(color[0], color[1], color[2], color[3]);
        // render(pos, dimension);
        // glColor4f(1, 1, 1, 1);
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

        // glBegin(GL_QUADS);
        //     glTexCoord2f(u1, v1);
        //     glVertex2f(x, y);
        //     glTexCoord2f(u1, v_top);
        //     glVertex2f(x, y + top);
        //     glTexCoord2f(u_left, v_top);
        //     glVertex2f(x + left, y + top);
        //     glTexCoord2f(u_left, v1);
        //     glVertex2f(x + left, y);

        //     glTexCoord2f(u_left, v1);
        //     glVertex2f(x + left, y);
        //     glTexCoord2f(u_left, v_top);
        //     glVertex2f(x + left, y + top);
        //     glTexCoord2f(u_right, v_top);
        //     glVertex2f(x + w - right, y + top);
        //     glTexCoord2f(u_right, v1);
        //     glVertex2f(x + w - right, y);
            
        //     glTexCoord2f(u_right, v1);
        //     glVertex2f(x + w - right, y);
        //     glTexCoord2f(u_right, v_top);
        //     glVertex2f(x + w - right, y + top);
        //     glTexCoord2f(u2, v_top);
        //     glVertex2f(x + w, y + top);
        //     glTexCoord2f(u2, v1);
        //     glVertex2f(x + w, y);
            
        //     glTexCoord2f(u1, v_top);
        //     glVertex2f(x, y + top);
        //     glTexCoord2f(u1, v_bottom);
        //     glVertex2f(x, y + h - bottom);
        //     glTexCoord2f(u_left, v_bottom);
        //     glVertex2f(x + left, y + h - bottom);
        //     glTexCoord2f(u_left, v_top);
        //     glVertex2f(x + left, y + top);

        //     glTexCoord2f(u_left, v_top);
        //     glVertex2f(x + left, y + top);
        //     glTexCoord2f(u_left, v_bottom);
        //     glVertex2f(x + left, y + h - bottom);
        //     glTexCoord2f(u_right, v_bottom);
        //     glVertex2f(x + w - right, y + h - bottom);
        //     glTexCoord2f(u_right, v_top);
        //     glVertex2f(x + w - right, y + top);
            
        //     glTexCoord2f(u_right, v_top);
        //     glVertex2f(x + w - right, y + top);
        //     glTexCoord2f(u_right, v_bottom);
        //     glVertex2f(x + w - right, y + h - bottom);
        //     glTexCoord2f(u2, v_bottom);
        //     glVertex2f(x + w, y + h - bottom);
        //     glTexCoord2f(u2, v_top);
        //     glVertex2f(x + w, y + top);
            
        //     glTexCoord2f(u1, v_bottom);
        //     glVertex2f(x, y + h - bottom);
        //     glTexCoord2f(u1, v2);
        //     glVertex2f(x, y + h);
        //     glTexCoord2f(u_left, v2);
        //     glVertex2f(x + left, y + h);
        //     glTexCoord2f(u_left, v_bottom);
        //     glVertex2f(x + left, y + h - bottom);

        //     glTexCoord2f(u_left, v_bottom);
        //     glVertex2f(x + left, y + h - bottom);
        //     glTexCoord2f(u_left, v2);
        //     glVertex2f(x + left, y + h);
        //     glTexCoord2f(u_right, v2);
        //     glVertex2f(x + w - right, y + h);
        //     glTexCoord2f(u_right, v_bottom);
        //     glVertex2f(x + w - right, y + h - bottom);
            
        //     glTexCoord2f(u_right, v_bottom);
        //     glVertex2f(x + w - right, y + h - bottom);
        //     glTexCoord2f(u_right, v2);
        //     glVertex2f(x + w - right, y + h);
        //     glTexCoord2f(u2, v2);
        //     glVertex2f(x + w, y + h);
        //     glTexCoord2f(u2, v_bottom);
        //     glVertex2f(x + w, y + h - bottom);
        // glEnd();
    }
}

export default Sprite
