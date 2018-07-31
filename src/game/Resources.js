let Constants = require('./Constants')
let Sprite = require('./Sprite')

exports._spriteSheet = null

// Define sprites
exports._sprite_ribbon = Sprite.makeSprite(95, 184, 8, 5);
exports._sprite_dialog = Sprite.makeSprite(1, 190, 16, 17);
exports._sprite_decoBg = Sprite.makeSprite(62, 190, 14, 14);
exports._sprite_attackArrow = Sprite.makeSprite(77, 190, 17, 24);

// buffs
exports._sprite_taunt = Sprite.makeSprite(1, 219, 10, 11);
exports._sprite_nosleep = Sprite.makeSprite(12, 219, 8, 11);

// Numbers and fonts
exports._sprite_numbers = [
    Sprite.makeSprite(1, 240, 3, 5), // 0
    Sprite.makeSprite(5, 240, 1, 5), // 1
    Sprite.makeSprite(7, 240, 3, 5), // 2
    Sprite.makeSprite(11, 240, 3, 5), // 3
    Sprite.makeSprite(15, 240, 3, 5), // 4
    Sprite.makeSprite(19, 240, 3, 5), // 5
    Sprite.makeSprite(23, 240, 3, 5), // 6
    Sprite.makeSprite(27, 240, 3, 5), // 7
    Sprite.makeSprite(31, 240, 3, 5), // 8
    Sprite.makeSprite(35, 240, 3, 5)  // 9
];
exports._sprite_font = [];
exports._sprite_HP = Sprite.makeSprite(1, 246, 7, 5);

// Cards
exports._sprite_blueCardBack = Sprite.makeSprite(1, 1, Constants.CARD_DIM.width, Constants.CARD_DIM.height);
exports._sprite_redCardBack = Sprite.makeSprite(48, 1, Constants.CARD_DIM.width, Constants.CARD_DIM.height);

// Suit
exports._sprite_rockCard = Sprite.makeSprite(95, 1, Constants.CARD_DIM.width, Constants.CARD_DIM.height);
exports._sprite_paperCard = Sprite.makeSprite(142, 1, Constants.CARD_DIM.width, Constants.CARD_DIM.height);
exports._sprite_scissorsCard = Sprite.makeSprite(189, 1, Constants.CARD_DIM.width, Constants.CARD_DIM.height);

//Â Card hover states
exports._sprite_hoverCard = Sprite.makeSprite(48, 64, Constants.CARD_DIM.width, Constants.CARD_DIM.height);
exports._sprite_rockHoverCard = Sprite.makeSprite(95, 64, Constants.CARD_DIM.width, Constants.CARD_DIM.height);
exports._sprite_paperHoverCard = Sprite.makeSprite(142, 64, Constants.CARD_DIM.width, Constants.CARD_DIM.height);
exports._sprite_scissorsHoverCard = Sprite.makeSprite(189, 64, Constants.CARD_DIM.width, Constants.CARD_DIM.height);

// Buttons
exports._sprite_btnAdvanceUp = Sprite.makeSprite(95, 127, 39, 18);
exports._sprite_btnAdvanceHover = Sprite.makeSprite(95, 146, 39, 18);
exports._sprite_btnAdvanceDown = Sprite.makeSprite(95, 165, 39, 18);
exports._sprite_btnOkUp = Sprite.makeSprite(135, 127, 19, 18);
exports._sprite_btnOkHover = Sprite.makeSprite(135, 146, 19, 18);
exports._sprite_btnOkDown = Sprite.makeSprite(135, 165, 19, 18);
exports._sprite_playerUp = Sprite.makeSprite(1, 257, 51, 37);
exports._sprite_playerHover = Sprite.makeSprite(1, 295, 51, 37);
exports._sprite_playerDown = Sprite.makeSprite(1, 333, 51, 37);

// Energy bar
exports._sprite_energyBg = Sprite.makeSprite(18, 190, 43, 13);
exports._sprite_energy = Sprite.makeSprite(28, 204, 31, 5);
exports._sprite_energySlash = Sprite.makeSprite(9, 246, 3, 5);

// Icons
exports._sprite_energyIcon = Sprite.makeSprite(1, 232, 7, 7);
exports._sprite_energyIconAnim = [
    exports._sprite_energyIcon,
    Sprite.makeSprite(9, 232, 7, 7),
    Sprite.makeSprite(17, 232, 7, 7),
    Sprite.makeSprite(25, 232, 7, 7),
    Sprite.makeSprite(33, 232, 7, 7),
    Sprite.makeSprite(41, 232, 7, 7)
];
exports._sprite_healthIcon = Sprite.makeSprite(49, 233, 7, 6);
exports._sprite_attackIcon = Sprite.makeSprite(57, 232, 7, 7);
exports._sprite_x = Sprite.makeSprite(1, 208, 10, 10);

exports._sprite_cardArtMap = {};

exports.initialize = function()
{
    generateFont()
    loadCardArt()
}

function generateFont()
{
    for (let i = 0; i <= 'Z'.charCodeAt(0) - '!'.charCodeAt(0); ++i)
    {
        exports._sprite_font.push(Sprite.makeSprite(1 + i * 4, 252, 3, 5));
    }
}

function loadCardArt()
{
    exports._sprite_cardArtMap.Pebble = Sprite.makeSprite(389, 1, 40, 32); // Pebble
    exports._sprite_cardArtMap.Stone = Sprite.makeSprite(389, 34, 40, 32); // Stone
    exports._sprite_cardArtMap.Brick = Sprite.makeSprite(389, 67, 40, 32); // Brick
    exports._sprite_cardArtMap.Boulder = Sprite.makeSprite(389, 100, 40, 32); // Boulder
    exports._sprite_cardArtMap.Mountain = Sprite.makeSprite(389, 133, 40, 32); // Mountain
    exports._sprite_cardArtMap.Planet = Sprite.makeSprite(389, 166, 40, 32); // Planet

    exports._sprite_cardArtMap.Note = Sprite.makeSprite(430, 1, 40, 32); // Note
    exports._sprite_cardArtMap.Card = Sprite.makeSprite(430, 34, 40, 32); // Card
    exports._sprite_cardArtMap.Letter = Sprite.makeSprite(430, 67, 40, 32); // Letter
    exports._sprite_cardArtMap.Tome = Sprite.makeSprite(430, 100, 40, 32); // Tome
    exports._sprite_cardArtMap.Bookshelf = Sprite.makeSprite(430, 133, 40, 32); // Bookshelf
    exports._sprite_cardArtMap.Library = Sprite.makeSprite(430, 166, 40, 32); // Library

    exports._sprite_cardArtMap.Pin = Sprite.makeSprite(471, 1, 40, 32); // Pin
    exports._sprite_cardArtMap.Scissors = Sprite.makeSprite(471, 34, 40, 32); // Scissors
    exports._sprite_cardArtMap.Razor = Sprite.makeSprite(471, 67, 40, 32); // Razor
    exports._sprite_cardArtMap.Machete = Sprite.makeSprite(471, 100, 40, 32); // Machete
    exports._sprite_cardArtMap.Zweihander = Sprite.makeSprite(471, 133, 40, 32); // Zweihander
    exports._sprite_cardArtMap.Guillotine = Sprite.makeSprite(471, 166, 40, 32); // Guillotine
}
