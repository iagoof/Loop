/**
 * @file Ponto de entrada da aplicação React.
 * @description Este arquivo é responsável por renderizar o componente principal `App`
 * na div com id 'root' no `index.html`. Ele utiliza o React 19 com StrictMode
 * para destacar potenciais problemas na aplicação.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Procura pelo elemento raiz na página HTML.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Não foi possível encontrar o elemento raiz para montar a aplicação.");
}

// Cria a raiz do React e renderiza o componente App.
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);