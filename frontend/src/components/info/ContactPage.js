// frontend/src/components/info/ContactPage.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ContactPage = ({ isOpen, onClose }) => {
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
          className="modal-content-contact"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose}>✕</button>
          
          <h1 className="contact-title">Contato</h1>
          <p className="contact-subtitle">Entre em contato ou acompanhe meu trabalho</p>

          <div className="contact-links">
            <a 
              href="https://github.com/alexcristofari" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-link"
            >
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </div>
              <div className="contact-info">
                <span className="contact-label">GitHub</span>
                <span className="contact-value">@alexcristofari</span>
              </div>
            </a>

            <a 
              href="https://www.linkedin.com/in/alexsandercristofari" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-link"
            >
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div className="contact-info">
                <span className="contact-label">LinkedIn</span>
                <span className="contact-value">Alexsander Cristofari</span>
              </div>
            </a>

            <a 
              href="https://www.instagram.com/alex.cristofari" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-link"
            >
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div className="contact-info">
                <span className="contact-label">Instagram</span>
                <span className="contact-value">@alex.cristofari</span>
              </div>
            </a>

            <a 
              href="mailto:alexcristofari2@gmail.com"
              className="contact-link"
            >
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div className="contact-info">
                <span className="contact-label">Email</span>
                <span className="contact-value">alexcristofari2@gmail.com</span>
              </div>
            </a>
          </div>

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
            }

            .modal-content-contact {
              background-color: #0a0a0a;
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 12px;
              max-width: 600px;
              width: 100%;
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

            .contact-title {
              font-size: 2.2rem;
              font-weight: 600;
              color: #f5f5f5;
              margin-bottom: 0.5rem;
              text-align: center;
            }

            .contact-subtitle {
              font-size: 1rem;
              color: #a0a0a0;
              margin-bottom: 3rem;
              text-align: center;
            }

            .contact-links {
              display: flex;
              flex-direction: column;
              gap: 1rem;
            }

            .contact-link {
              display: flex;
              align-items: center;
              gap: 1.5rem;
              padding: 1.5rem;
              background-color: rgba(255, 255, 255, 0.03);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 8px;
              text-decoration: none;
              transition: all 0.3s ease;
            }

            .contact-link:hover {
              background-color: rgba(255, 255, 255, 0.08);
              border-color: rgba(255, 255, 255, 0.15);
              transform: translateX(5px);
            }

            .contact-icon {
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #66c0f4;
              flex-shrink: 0;
            }

            .contact-icon svg {
              width: 24px;
              height: 24px;
            }

            .contact-info {
              display: flex;
              flex-direction: column;
              gap: 0.2rem;
            }

            .contact-label {
              font-size: 0.85rem;
              color: #a0a0a0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .contact-value {
              font-size: 1rem;
              color: #f5f5f5;
              font-weight: 500;
            }
          `}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContactPage;
