// frontend/src/components/music/MusicCard.js (v5.2 - Nomes sempre visíveis)
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CardStyles = () => (
  <style>{`
    .music-card-minimal {
      position: relative;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      background-color: #1a1a1a;
      display: flex;
      flex-direction: column;
    }

    .music-card-minimal:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
    }

    .music-card-image-wrapper {
      position: relative;
      width: 100%;
      padding-bottom: 100%;
      overflow: hidden;
    }

    .music-card-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .music-card-minimal:hover .music-card-image {
      transform: scale(1.08);
    }

    .music-card-skeleton {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        #1a1a1a 25%,
        #2a2a2a 50%,
        #1a1a1a 75%
      );
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
    }

    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .music-card-info {
      padding: 1rem;
      background-color: #1a1a1a;
    }

    .music-card-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: #f5f5f5;
      margin: 0 0 0.3rem 0;
      letter-spacing: 0.2px;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      min-height: 2.4em;
    }

    .music-card-artist {
      font-size: 0.8rem;
      font-weight: 400;
      color: #a0a0a0;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .music-card-genre {
      position: absolute;
      top: 8px;
      left: 8px;
      background-color: rgba(10, 10, 10, 0.8);
      backdrop-filter: blur(4px);
      color: #a0a0a0;
      padding: 0.3rem 0.6rem;
      border-radius: 50px;
      font-size: 0.7rem;
      font-weight: 500;
      border: 1px solid rgba(255, 255, 255, 0.1);
      text-transform: lowercase;
      z-index: 5;
    }

    .music-card-score {
      position: absolute;
      top: 8px;
      right: 8px;
      background: linear-gradient(135deg, rgba(13, 122, 63, 0.95), rgba(10, 92, 48, 0.95));
      color: #ffffff;
      padding: 0.3rem 0.6rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.3px;
      z-index: 5;
    }

    .music-card-selected {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 3px solid #0d7a3f;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(13, 122, 63, 0.6), inset 0 0 20px rgba(13, 122, 63, 0.2);
      pointer-events: none;
      z-index: 6;
    }

    .music-card-checkmark {
      position: absolute;
      top: 8px;
      left: 8px;
      background-color: #0d7a3f;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(13, 122, 63, 0.5);
      z-index: 10;
    }

    .music-card-checkmark svg {
      width: 16px;
      height: 16px;
      fill: #ffffff;
    }

    .music-card-play-button {
      position: absolute;
      bottom: 8px;
      right: 8px;
      width: 48px;
      height: 48px;
      background-color: #0d7a3f;
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transform: translateY(8px);
      transition: all 0.3s ease;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      z-index: 10;
    }

    .music-card-minimal:hover .music-card-play-button {
      opacity: 1;
      transform: translateY(0);
    }

    .music-card-play-button:hover {
      transform: scale(1.06);
      background-color: #0a8f47;
    }

    .music-card-play-button svg {
      width: 20px;
      height: 20px;
      fill: #ffffff;
      margin-left: 2px;
    }

    .music-card-play-button.playing svg.play-icon {
      display: none;
    }

    .music-card-play-button.playing svg.pause-icon {
      display: block;
      margin-left: 0;
    }

    .music-card-play-button svg.pause-icon {
      display: none;
    }
  `}</style>
);

function MusicCard({ track, onClick, isSelected }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const score = track.similarity_score;

  const handlePlayClick = (e) => {
    e.stopPropagation();

    if (!track.preview_url) {
      alert('Prévia não disponível para esta música.');
      return;
    }

    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const allAudios = document.querySelectorAll('audio');
      allAudios.forEach(a => a.pause());

      const newAudio = new Audio(track.preview_url);
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);

      newAudio.onended = () => setIsPlaying(false);
      newAudio.onpause = () => setIsPlaying(false);
    }
  };

  return (
    <>
      <CardStyles />
      <motion.div
        className="music-card-minimal"
        onClick={onClick}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="music-card-image-wrapper">
          {!imageLoaded && track.image_url && (
            <div className="music-card-skeleton" />
          )}

          {track.image_url && (
            <img
              src={track.image_url}
              alt={track.name}
              className="music-card-image"
              onLoad={() => setImageLoaded(true)}
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
          )}

          {track.genres && !isSelected && (
            <div className="music-card-genre">{track.genres}</div>
          )}

          {score && (
            <div className="music-card-score">{score}%</div>
          )}

          {isSelected && (
            <>
              <motion.div
                className="music-card-selected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="music-card-checkmark"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </motion.div>
            </>
          )}

          <button
            className={`music-card-play-button ${isPlaying ? 'playing' : ''}`}
            onClick={handlePlayClick}
          >
            <svg className="play-icon" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <svg className="pause-icon" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>
        </div>

        <div className="music-card-info">
          <h3 className="music-card-title">{track.name}</h3>
          <p className="music-card-artist">{track.artists}</p>
        </div>
      </motion.div>
    </>
  );
}

export default MusicCard;
