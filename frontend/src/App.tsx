import React, { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import styled from "styled-components";
import BrokersPage from "./pages/BrokersPage";
import StocksPage from "./pages/StocksPage";

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f8fa;
  color: #333;
  font-family: "Arial", sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: #4a90e2;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Navigation = styled.nav`
  display: flex;
  gap: 4rem;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    gap: 2rem;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const StyledNavLink = styled(NavLink)`
  color: #555;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.5rem 0;
  transition: color 0.2s;
  border-bottom: 2px solid transparent;
  white-space: nowrap;

  &.active {
    color: #4a90e2;
    border-bottom: 2px solid #4a90e2;
  }

  &:hover {
    color: #3a7bc8;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const LoginIcon = styled.div`
  font-size: 1rem;
  cursor: pointer;
  color: #fff;
  font-weight: 500;
  white-space: nowrap;
  background-color: #4a90e2;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #3a7bc8;
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
    padding: 0.5rem 0;
    border-top: 1px solid #eee;
    margin-top: 0.5rem;
    border-radius: 0;
  }
`;

const Content = styled.main`
  flex: 1;
  padding: 2rem;
  display: flex;
  justify-content: center;
  background-color: #f5f8fa;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

function App(): React.ReactElement {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AppContainer>
      <Header>
        <LogoContainer>
          <Logo>Broker Exc.</Logo>
        </LogoContainer>
        <Navigation>
          <StyledNavLink to="/stocks">Акции</StyledNavLink>
          <StyledNavLink to="/brokers">Брокеры</StyledNavLink>
          <StyledNavLink to="/market-settings">Настройки рынка</StyledNavLink>
        </Navigation>
        <LoginIcon>Выйти</LoginIcon>
      </Header>
      <Content>
        <Routes>
          <Route path="/stocks" element={<StocksPage />} />
          <Route path="/brokers" element={<BrokersPage />} />
          <Route
            path="/market-settings"
            element={
              <div
                style={{
                  width: "100%",
                  maxWidth: "1200px",
                  padding: "2rem",
                  textAlign: "center",
                }}
              >
                <h1>Настройки рынка</h1>
                <p>Эта функциональность находится в разработке</p>
              </div>
            }
          />
          <Route path="*" element={<StocksPage />} />
        </Routes>
      </Content>
    </AppContainer>
  );
}

export default App;
