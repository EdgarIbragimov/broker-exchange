import React, { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import styled from "styled-components";
import BrokersPage from "./pages/BrokersPage";
import StocksPage from "./pages/StocksPage";
import MarketSettingsPage from "./pages/MarketSettingsPage";

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
  flex: 0 0 auto;

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
  flex: 1;
  justify-content: space-around;
  margin-left: 50px;
  max-width: 600px;

  @media (max-width: 768px) {
    width: 100%;
    margin-left: 0;
    justify-content: space-between;
  }

  @media (max-width: 480px) {
    justify-content: space-around;
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
      </Header>
      <Content>
        <Routes>
          <Route path="/stocks" element={<StocksPage />} />
          <Route path="/brokers" element={<BrokersPage />} />
          <Route path="/market-settings" element={<MarketSettingsPage />} />
          <Route path="*" element={<StocksPage />} />
        </Routes>
      </Content>
    </AppContainer>
  );
}

export default App;
