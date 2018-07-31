// Screen resolution
exports.WIDTH = 320
exports.HEIGHT = 240
exports.SCALE = 3

// Draw order
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

// Colors
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

// Positionning and dimensions
exports.SPRITE_SHEET_DIMENSION = {width:512.0, height:512.0}
exports.CARD_DIM = {width:46, height:62}
exports.TOP_DECK_POS = {x:37 - exports.CARD_DIM.width, y:106 - exports.CARD_DIM.height}
exports.TOP_HAND_POS = {x:exports.WIDTH / 2, y:-exports.CARD_DIM.height + 40}
exports.TOP_BOARD_POS = {x:exports.WIDTH / 2 - 1, y:exports.HEIGHT / 2 - exports.CARD_DIM.height - 6}
exports.TOP_PLACE_POS = {x:272, y:47}
exports.TOP_DISCARDED_POS = {x:exports.WIDTH + 50, y:exports.HEIGHT / 2 - exports.CARD_DIM.height - 10}
exports.BOTTOM_DECK_POS = {x:37 - exports.CARD_DIM.width, y:196 - exports.CARD_DIM.height}
exports.BOTTOM_HAND_POS = {x:exports.WIDTH / 2, y:exports.HEIGHT - 40}
exports.BOTTOM_BOARD_POS = {x:exports.WIDTH / 2 - 1, y:exports.HEIGHT / 2 + 7}
exports.BOTTOM_PLACE_POS = {x:272, y:131}
exports.BOTTOM_DISCARDED_POS = {x:exports.WIDTH + 50, y:exports.HEIGHT / 2 + 10}
exports.ADVANCE_BUTTON_POS = {x:280, y:111}
exports.HAND_SPACING = exports.CARD_DIM.width - 10
exports.BOARD_SPACING = exports.CARD_DIM.width + 1
