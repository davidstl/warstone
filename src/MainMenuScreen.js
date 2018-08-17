import React, { Component } from 'react'
import './MainMenuScreen.css'
import GameIcon from './GameIcon';

// Props:
//  user
//  onPlay
class MainMenuScreen extends Component
{
    onPlay()
    {
        this.props.onPlay()
    }

    render()
    {
        return (
            <div className="MainMenuScreen">
                <p>Player: {this.props.user.name}</p>
                <button type="button" onClick={this.onPlay.bind(this)}>Play</button>
                <div style={{backgroundColor:"#ead4aa"}}>
                    <div id="MainMenuScreen-Help" style={{textAlign:"left", maxWidth:"600px", margin:"auto", color:"#181425"}}>
                        <h2>Goal of the game:</h2>
                        <p>Reduce opponent's HP (Hitpoints) to zero. Your Hitpoints are displayed on the right, near your player name. 
                        Players take turns playing cards from their hand to the table, and using cards on the table to attack the opponent's cards or the opponent's HP.</p>

                        <h2>Gameplay:</h2>
                        <p>At the start of each turn, the player gets to draw one card for free and the player gets a limited amount of POWER <GameIcon name="POWER"/> to take actions. 
                        Your POWER <GameIcon name="POWER"/> is shown on the right, near your player name. More powerful cards cost more POWER <GameIcon name="POWER"/> to play. The power you get to use increases each turn. PROTIP: Players can also choose to spend POWER <GameIcon name="POWER"/> to draw additional cards, which may give a strategic advantage in later turns.</p>

                        <p>Players get a limited amount of time to play or draw cards and then conclude their turn by pressing the green END TURN button. Time remaining is shown by a red wick in the center of the screen which gradually gets shorter.
                        Cards played can't attack until the next turn, unless they have the LIGHTNING <GameIcon name="LIGHTNING"/> ability symbol.</p>

                        <p>When your cards are ready to act, select one of your cards by clicking it, and then choose what to attack. You may attack the opponent's cards, or the opponent's HP directly. PROTIP: Cards posessing the TAUNT ability <GameIcon name="SHIELD"/> force the opponent to deal with that card before all others.</p>

                        <p>When attacking, each card deals damage to the other according to their ATTACK power <GameIcon name="SWORD"/>. Cards have suits: ROCK, PAPER, SCISSORS
                        <ul>
                            <li>ROCK deals double damage to SCISSORS</li>
                            <li>SCISSORS deals double damage to PAPER</li>
                            <li>PAPER deals double damage to SCISSORS</li>
                        </ul></p>

                        <p>If a card runs out of HP <GameIcon name="HEART"/>, it is discarded from the table. 
                        When you have taken all the actions you want, press the END TURN button to finish your turn.</p>

                        <p>The game ends when one player's HP reaches zero.</p><br/><br/>
                    </div>
                </div>
            </div>
        )
    }
}

export default MainMenuScreen;
