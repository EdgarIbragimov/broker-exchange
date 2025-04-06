import React from "react";
import styled from "styled-components";

// Simple container for consistent styling
const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px; // Match other pages
  padding: 2rem;
  text-align: center;
  background-color: #fff; // Add a background like other content areas
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const PlaceholderText = styled.p`
  color: #666;
  font-size: 1rem;
`;

const MarketSettingsPage: React.FC = () => {
  return (
    <PageContainer>
      <Title>Настройки рынка</Title>
      <PlaceholderText>
        Эта функциональность находится в разработке.
      </PlaceholderText>
    </PageContainer>
  );
};

export default MarketSettingsPage;
