import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  /* Базовые стили для адаптивности */
  * {
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html {
    font-size: 16px;
    
    @media (max-width: 768px) {
      font-size: 15px;
    }
    
    @media (max-width: 480px) {
      font-size: 14px;
    }
  }

  body {
    margin: 0;
    padding: 0;
    overscroll-behavior: none;
  }

  /* Стили для таблиц на мобильных устройствах */
  @media (max-width: 768px) {
    table {
      font-size: 0.9rem;
    }
    
    th, td {
      padding: 0.5rem !important;
    }
  }

  /* Стили для прокрутки */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

export default GlobalStyles;
