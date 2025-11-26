// frontend/src/components/info/AboutSimilarity.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AboutSimilarity = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose}>✕</button>
          
          <h1 className="modal-title">Como Funciona a Recomendação?</h1>
          <p className="modal-intro">Utilizamos <strong>similaridade do cosseno</strong> adaptada para cada tipo de mídia.</p>

          {/* JOGOS */}
          <section className="modal-section">
            <div className="section-header">
              <span className="section-icon"></span>
              <h2 className="section-title">Jogos</h2>
            </div>
            <p className="section-description">
              O sistema combina múltiplas características com pesos específicos:
            </p>
            <div className="formula-box">
              <div className="formula-line">
                <span className="formula-var">feature_matrix</span> = 
              </div>
              <div className="formula-content">
                <div className="formula-term">
                  <span className="term-label">gêneros</span> × <span className="term-weight">4.0</span>
                </div>
                <div className="formula-operator">+</div>
                <div className="formula-term">
                  <span className="term-label">categorias</span> × <span className="term-weight">3.0</span>
                </div>
                <div className="formula-operator">+</div>
                <div className="formula-term">
                  <span className="term-label">descrição</span> × <span className="term-weight">1.0</span>
                </div>
                <div className="formula-operator">+</div>
                <div className="formula-term">
                  <span className="term-label">desenvolvedores</span> × <span className="term-weight">1.0</span>
                </div>
              </div>
            </div>
            <div className="formula-box">
              <div className="formula-line">
                <span className="formula-var">hybrid_score</span> = similarity² × (quality × 0.5 + 0.5)
              </div>
            </div>
            <p className="section-note">
              💡 <strong>Penalidade de desenvolvedor:</strong> 0.85ⁿ para diversificar recomendações
            </p>
          </section>

          {/* MÚSICAS */}
          <section className="modal-section">
            <div className="section-header">
              <span className="section-icon"></span>
              <h2 className="section-title">Músicas</h2>
            </div>
            <p className="section-description">
              Calcula um perfil médio das músicas selecionadas e busca similares:
            </p>
            <div className="formula-box">
              <div className="formula-line">
                <span className="formula-var">profile_vector</span> = média(features das músicas selecionadas)
              </div>
            </div>
            <div className="formula-box">
              <div className="formula-line">
                <span className="formula-var">similarity</span> = cosine_similarity(profile_vector, todas_músicas)
              </div>
            </div>
            <div className="formula-box">
              <div className="formula-line">
                <span className="formula-var">final_score</span> = similarity × penalidade_artista
              </div>
            </div>
            <p className="section-note">
              💡 <strong>Penalidade de artista:</strong> 0.85ⁿ (evita repetição) + 0.5× para artistas já selecionados
            </p>
          </section>

          {/* FILMES */}
          <section className="modal-section">
            <div className="section-header">
              <span className="section-icon"></span>
              <h2 className="section-title">Filmes</h2>
            </div>
            <p className="section-description">
              Usa TF-IDF de gêneros, tags e descrições combinado com qualidade:
            </p>
            <div className="formula-box">
              <div className="formula-line">
                <span className="formula-var">user_profile</span> = média(tfidf_matrix dos filmes selecionados)
              </div>
            </div>
            <div className="formula-box">
              <div className="formula-line">
                <span className="formula-var">similarity</span> = cosine_similarity(user_profile, todos_filmes)
              </div>
            </div>
            <div className="formula-box">
              <div className="formula-content">
                <div className="formula-line">
                  <span className="formula-var">sim_score</span> = (similarity / 0.35 × 95) limitado a 99%
                </div>
                <div className="formula-line">
                  <span className="formula-var">quality_score</span> = vote_average × 10
                </div>
                <div className="formula-line">
                  <span className="formula-var">hybrid_score</span> = sim_score × <span className="term-weight">0.70</span> + quality_score × <span className="term-weight">0.30</span>
                </div>
              </div>
            </div>
            <p className="section-note">
              💡 <strong>Filtro de redundância:</strong> Remove títulos muito similares (90% match)
            </p>
          </section>

          {/* EXPLICAÇÃO VISUAL */}
          <section className="modal-section">
            <h3 className="section-subtitle">O que é Similaridade do Cosseno?</h3>
            <p className="section-description">
              Mede o ângulo entre dois vetores no espaço multidimensional. Quanto menor o ângulo, mais similares são os itens.
            </p>
            <div className="cosine-diagram">
              <div className="vector-space">
                <div className="vector vector-a">Vetor A</div>
                <div className="vector vector-b">Vetor B</div>
                <div className="angle-arc">θ</div>
              </div>
              <div className="cosine-formula">
                similarity = cos(θ) = (A · B) / (||A|| × ||B||)
              </div>
            </div>
          </section>

          <style jsx>{`
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.95);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              padding: 2rem;
              overflow-y: auto;
            }

            .modal-content {
              background-color: #0a0a0a;
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 12px;
              max-width: 900px;
              width: 100%;
              max-height: 90vh;
              overflow-y: auto;
              padding: 3rem;
              position: relative;
            }

            .modal-close {
              position: absolute;
              top: 1.5rem;
              right: 1.5rem;
              background: none;
              border: none;
              color: #a0a0a0;
              font-size: 1.5rem;
              cursor: pointer;
              transition: color 0.3s;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .modal-close:hover {
              color: #f5f5f5;
            }

            .modal-title {
              font-size: 2.2rem;
              font-weight: 600;
              color: #f5f5f5;
              margin-bottom: 1rem;
              letter-spacing: -0.02em;
            }

            .modal-intro {
              font-size: 1.1rem;
              color: #a0a0a0;
              margin-bottom: 3rem;
              line-height: 1.6;
            }

            .modal-section {
              margin-bottom: 3rem;
              padding-bottom: 3rem;
              border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .modal-section:last-child {
              border-bottom: none;
            }

            .section-header {
              display: flex;
              align-items: center;
              gap: 1rem;
              margin-bottom: 1rem;
            }

            .section-icon {
              font-size: 2rem;
            }

            .section-title {
              font-size: 1.6rem;
              font-weight: 600;
              color: #f5f5f5;
              margin: 0;
            }

            .section-subtitle {
              font-size: 1.3rem;
              font-weight: 500;
              color: #f5f5f5;
              margin-bottom: 1rem;
            }

            .section-description {
              font-size: 1rem;
              color: #c0c0c0;
              line-height: 1.7;
              margin-bottom: 1.5rem;
            }

            .formula-box {
              background-color: rgba(255, 255, 255, 0.03);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 8px;
              padding: 1.5rem;
              margin: 1rem 0;
              font-family: 'Courier New', monospace;
            }

            .formula-line {
              color: #f5f5f5;
              font-size: 0.95rem;
              margin: 0.5rem 0;
              line-height: 1.8;
            }

            .formula-content {
              margin-left: 2rem;
              margin-top: 0.5rem;
            }

            .formula-var {
              color: #66c0f4;
              font-weight: 600;
            }

            .formula-term {
              margin: 0.3rem 0;
            }

            .formula-operator {
              color: #a0a0a0;
              margin: 0.3rem 0;
              font-size: 0.9rem;
            }

            .term-label {
              color: #c0c0c0;
            }

            .term-weight {
              color: #0d7a3f;
              font-weight: 700;
            }

            .section-note {
              background-color: rgba(13, 122, 63, 0.1);
              border-left: 3px solid #0d7a3f;
              padding: 1rem 1.5rem;
              margin-top: 1.5rem;
              font-size: 0.95rem;
              color: #c0c0c0;
              line-height: 1.6;
            }

            .cosine-diagram {
              background-color: rgba(255, 255, 255, 0.02);
              border: 1px solid rgba(255, 255, 255, 0.05);
              border-radius: 8px;
              padding: 2rem;
              margin-top: 1.5rem;
              text-align: center;
            }

            .vector-space {
              position: relative;
              width: 200px;
              height: 200px;
              margin: 0 auto 2rem auto;
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 4px;
            }

            .vector {
              position: absolute;
              width: 120px;
              height: 2px;
              background: linear-gradient(90deg, #66c0f4, transparent);
              transform-origin: left center;
              font-size: 0.8rem;
              color: #66c0f4;
              padding-top: 0.5rem;
            }

            .vector-a {
              bottom: 50%;
              left: 50%;
              transform: rotate(-30deg);
            }

            .vector-b {
              bottom: 50%;
              left: 50%;
              transform: rotate(-60deg);
              background: linear-gradient(90deg, #0d7a3f, transparent);
              color: #0d7a3f;
            }

            .angle-arc {
              position: absolute;
              bottom: 50%;
              left: 50%;
              font-size: 1.2rem;
              color: #f5f5f5;
              transform: translate(40px, 20px);
            }

            .cosine-formula {
              font-family: 'Courier New', monospace;
              font-size: 1.1rem;
              color: #f5f5f5;
              background-color: rgba(255, 255, 255, 0.05);
              padding: 1rem;
              border-radius: 4px;
            }

            /* Scrollbar */
            .modal-content::-webkit-scrollbar {
              width: 8px;
            }

            .modal-content::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
            }

            .modal-content::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.2);
              border-radius: 4px;
            }

            .modal-content::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.3);
            }
          `}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AboutSimilarity;
