module.exports = class Config
{
    constructor(json)
    {
        this.EnergyIncreasePerTurn = json.EnergyIncreasePerTurn
        this.PlayerHPCap = json.PlayerHPCap
        this.DrawCountOnTurn = json.DrawCountOnTurn
        this.HandSizeStart = json.HandSizeStart
        this.EnergyStart = json.EnergyStart
        this.DrawCost = json.DrawCost
        this.PlayerHPStart = json.PlayerHPStart
        this.EnergyCap = json.EnergyCap
        this.MaxOnBoard = json.MaxOnBoard

        this.cardById = {}
        for (let key in json.cards)
        {
            let card = json.cards[key]
            card.id = key
            this.cardById[key] = card
        }

        this.deck = []
        for (let i = 0; i < json.deckArr.length; ++i)
        {
            let deckJson = json.deckArr[i]
            let count = deckJson.count
            let card = this.cardById[deckJson.id]
            for (let j = 0; j < count; ++j)
            {
                this.deck.push(card)
            }
        }

        // Load combat matrix
        this.suits = json.suits
    }
}
