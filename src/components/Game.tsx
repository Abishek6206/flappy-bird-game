import React, { useState, useEffect, useRef } from "react";
import "./Game.css"; // Import the CSS file for styling
import bgImage from './bg.png'; // Background image
import birdImage from './Bird.png';
import pipeTopImage from './PipeU.png'; // Upper pipe image
import pipeBottomImage from './PipeD.png'; // Bottom pipe image
import gameOverIcon from './gameOverIcon.png'; // Game over icon
import replayButton from './restartIcon.png'; // Replay button icon
import leaderboardButton from './leaderboardIcon.png'; // Leaderboard button icon

interface Pipe {
  x: number;
  gap: number;
  height: number;
  passed: boolean;
}

const Game: React.FC = () => {
  const [birdPosition, setBirdPosition] = useState(200);
  const [gameStarted, setGameStarted] = useState(false);
  const [pipes, setPipes] = useState<Pipe[]>([{ x: 300, gap: 250, height: 100, passed: false }]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bgPosition, setBgPosition] = useState(0);

  const gravity = 5;
  const baseJumpHeight = 60;
  const [jumpHeight, setJumpHeight] = useState(baseJumpHeight);

  const gravityRef = useRef(gravity);
  const pipesRef = useRef(pipes);
  const jumpRef = useRef(false);
  const lastClickTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && birdPosition < window.innerHeight && !gameOver) {
      timer = setInterval(() => {
        setBirdPosition((prev) => prev + gravity);
      }, 30);
    }
    return () => clearInterval(timer);
  }, [gameStarted, birdPosition, gameOver]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameOver) {
      timer = setInterval(() => {
        setPipes((prev) => {
          const newPipes = prev
            .map((pipe) => ({ ...pipe, x: pipe.x - 5 }))
            .filter((pipe) => pipe.x > -50);

          if (newPipes.length === 0 || newPipes[newPipes.length - 1].x <= 200) {
            const randomHeight = Math.random() * 300 + 50;
            const randomGap = Math.max(150, 350 - Math.abs(randomHeight - birdPosition));
            const distance = Math.max(300, 400 + Math.abs(randomHeight - birdPosition));
            const newPipeX = newPipes.length > 0 ? newPipes[newPipes.length - 1].x + distance : 300;

            newPipes.push({ x: newPipeX, gap: randomGap, height: randomHeight, passed: false });
          }

          return newPipes;
        });
        setBgPosition((prev) => prev - 2); // Parallax effect
      }, 30);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const birdRect = { top: birdPosition, bottom: birdPosition + 60, left: 20, right: 20 + 60 };

    pipes.forEach((pipe) => {
      const pipeTopRect = { top: 0, bottom: pipe.height, left: pipe.x, right: pipe.x + 50 };
      const pipeBottomRect = { top: pipe.height + pipe.gap, bottom: window.innerHeight, left: pipe.x, right: pipe.x + 50 };

      if (birdRect.right > pipeTopRect.left && birdRect.left < pipeTopRect.right &&
          birdRect.bottom > pipeTopRect.top && birdRect.top < pipeTopRect.bottom) {
        setGameOver(true);
      }

      if (birdRect.right > pipeBottomRect.left && birdRect.left < pipeBottomRect.right &&
          birdRect.bottom > pipeBottomRect.top && birdRect.top < pipeBottomRect.bottom) {
        setGameOver(true);
      }
    });

    if (birdPosition <= 0 || birdPosition >= window.innerHeight) {
      setGameOver(true);
    }
  }, [birdPosition, pipes, gameOver]);

  const handleFlap = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === "touchstart") {
      e.preventDefault();
    }

    if (!gameStarted) setGameStarted(true);
    if (!gameOver && !jumpRef.current) {
      const currentTime = Date.now();
      const timeDifference = currentTime - lastClickTimeRef.current;
      lastClickTimeRef.current = currentTime;

      if (timeDifference < 100) {
        setJumpHeight((prev) => Math.min(prev + 300, baseJumpHeight + 50));
      } else if (timeDifference < 200) {
        setJumpHeight((prev) => Math.min(prev + 200, baseJumpHeight + 50));
      } else if (timeDifference < 500) {
        setJumpHeight((prev) => Math.min(prev + 10, baseJumpHeight + 50));
      } else {
        setJumpHeight(baseJumpHeight);
      }

      jumpRef.current = true;
      setBirdPosition((prev) => Math.max(prev - jumpHeight, 0));
      setTimeout(() => {
        jumpRef.current = false;
      }, 300);
    }
  };

  const handleRestart = () => {
    setBirdPosition(200);
    setPipes([{ x: 300, gap: 250, height: 100, passed: false }]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setJumpHeight(baseJumpHeight);
    setBgPosition(0);
  };

  useEffect(() => {
    pipes.forEach((pipe) => {
      if (pipe.x < 20 && !pipe.passed) {
        setScore((prevScore) => prevScore + 1);
        pipe.passed = true;
      }
    });
  }, [pipes]);

  return (
    <div
      onClick={handleFlap}
      onTouchStart={handleFlap}
      className="game-container"
      style={{ position: 'relative', height: '100vh', width: '100vw' }}
    >
      <div
        className="background"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: `${bgPosition}px 0`,
          width: '200%',
          height: '100%',
          position: 'absolute',
          zIndex: -1,
          transition: 'background-position 0.1s linear',
        }}
      />
      
      <h1 className="score" style={{ position: 'absolute', zIndex: 1, color: 'white' }}>
        Score: {score}
      </h1>

      <img
        src={birdImage}
        alt="Bird"
        className="bird"
        style={{
          position: 'absolute',
          top: birdPosition,
          left: '20px',
          width: '120px',
          zIndex: 1,
        }}
      />

      {pipes.map((pipe, index) => (
        <div key={index}>
          <img
            src={pipeTopImage}
            alt="Pipe Top"
            className="pipe"
            style={{
              width: '60px',
              height: pipe.height,
              position: 'absolute',
              bottom: window.innerHeight - pipe.height - pipe.gap,
              left: pipe.x,
              zIndex: 0,
            }}
          />
          <img
            src={pipeBottomImage}
            alt="Pipe Bottom"
            className="pipe-bottom"
            style={{
              width: '60px',
              height: window.innerHeight - (pipe.height + pipe.gap),
              position: 'absolute',
              top: pipe.height + pipe.gap,
              left: pipe.x,
              zIndex: 0,
            }}
          />
        </div>
      ))}

      {gameOver && (
        <div
          className="game-over-screen"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#330072',
            padding: '20px',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img src={gameOverIcon} alt="Game Over"/>
          <div>
            <button
              className="replay-button"
              onClick={handleRestart}
              style={{
                backgroundImage: `url(${replayButton})`,
                backgroundSize: 'cover',
                border: 'none',
                // width: '120px',
                // height: '40px',
                margin: '10px',
              }}
            />
            <button
              className="leaderboard-button"
              onClick={() => alert('Leaderboard feature coming soon!')}
              style={{
                backgroundImage: `url(${leaderboardButton})`,
                backgroundSize: 'cover',
                border: 'none',
                // width: '120px',
                // height: '40px',
                margin: '10px',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
