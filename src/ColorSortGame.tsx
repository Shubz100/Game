import React, { useState } from "react";
import "./ColorSortGame.css";

interface Tube {
  colors: string[];
}

// Function to generate tubes and shuffled colors for a given level
const generateLevelTubes = (level: number): Tube[] => {
  const totalTubes = level + 2; // Start at 3 tubes for level 1
  const totalColors = level + 2; // Start at 3 colors for level 1

  const colors: string[] = [];
  const colorOptions = ["red", "blue", "green", "yellow", "orange", "purple", "cyan", "pink"];

  // Generate colors
  for (let i = 0; i < totalColors; i++) {
    for (let j = 0; j < totalTubes - 1; j++) {
      colors.push(colorOptions[i % colorOptions.length]);
    }
  }

  // Shuffle colors
  const shuffledColors = colors.sort(() => Math.random() - 0.5);

  // Fill tubes with shuffled colors, leaving one tube empty
  const tubes: Tube[] = [];
  let index = 0;
  for (let i = 0; i < totalTubes - 1; i++) {
    tubes.push({ colors: shuffledColors.slice(index, index + totalColors) });
    index += totalColors;
  }
  tubes.push({ colors: [] }); // Add an empty tube

  return tubes;
};

const ColorSortGame: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [tubes, setTubes] = useState<Tube[]>(generateLevelTubes(level));
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [isWin, setIsWin] = useState(false);

  const handleTubeClick = (index: number) => {
    if (selectedTube === null) {
      setSelectedTube(index);
    } else {
      pourColor(selectedTube, index);
      setSelectedTube(null);
    }
  };

  const pourColor = (from: number, to: number) => {
    if (from === to) return;

    const tubesCopy = [...tubes];
    const fromColors = tubesCopy[from].colors;
    const toColors = tubesCopy[to].colors;

    if (fromColors.length === 0) return;

    const colorToPour = fromColors[fromColors.length - 1];
    const targetTopColor = toColors[toColors.length - 1];

    if (toColors.length === 0 || targetTopColor === colorToPour) {
      fromColors.pop();
      toColors.push(colorToPour);
      setTubes(tubesCopy);
      checkWinCondition(tubesCopy);
    }
  };

  const checkWinCondition = (currentTubes: Tube[]) => {
    const isAllSorted = currentTubes.every(
      (tube) =>
        tube.colors.length === 0 ||
        tube.colors.every((color) => color === tube.colors[0])
    );
    setIsWin(isAllSorted);
  };

  const restartGame = () => {
    setTubes(generateLevelTubes(level));
    setIsWin(false);
    setSelectedTube(null);
  };

  const nextLevel = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    setTubes(generateLevelTubes(newLevel));
    setIsWin(false);
    setSelectedTube(null);
  };

  return (
    <div className="game-container">
      <h1>Color Sorting Game</h1>
      <h2>Level {level}</h2>
      {isWin && <div className="win-message">You Win Level {level}!</div>}
      <div className="tubes-container">
        {tubes.map((tube, index) => (
          <div
            key={index}
            className={`tube ${selectedTube === index ? "selected" : ""}`}
            onClick={() => handleTubeClick(index)}
          >
            {tube.colors.map((color, idx) => (
              <div
                key={idx}
                className="color-block"
                style={{ backgroundColor: color }}
              ></div>
            ))}
          </div>
        ))}
      </div>
      <div className="buttons-container">
        <button onClick={restartGame}>Restart</button>
        {isWin && level < 10 && (
          <button onClick={nextLevel}>Next Level</button>
        )}
        {isWin && level === 10 && <div>Congratulations! You've completed all levels!</div>}
      </div>
    </div>
  );
};

export default ColorSortGame;
