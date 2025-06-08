import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { auth, firestore } from '../../src/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import profilePic from '../../src/assets/profile.png';
import mainImage from '../../src/assets/main.png';
import sosIcon from '../../src/assets/sos.png';
import menstruationIcon from '../../src/assets/menstruation.png';
import chart1 from '../../src/assets/chart.png';
import chart2 from '../../src/assets/chart1.png';

export default function HomeScreen() {
  const [firstName, setFirstName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserName = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', userId));
          if (userDoc.exists()) {
            setFirstName(userDoc.data().firstName || 'User');
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
        }
      }
      setIsLoaded(true);
    };
    fetchUserName();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Still navigate to login even if signOut fails
      navigate('/login');
    }
  };

  return (
    <Container>
      <Header>
        <ProfileContainer>
          <ProfileIcon src={profilePic} alt="profile" />
          <GreetingContainer>
            <GreetingText>Good morning,</GreetingText>
            <UserName>{firstName || 'User'}</UserName>
          </GreetingContainer>
        </ProfileContainer>
        <LogoutButton onClick={handleLogout}>Sign Out</LogoutButton>
      </Header>

      <HeroSection>
        <HeroContent>
          <HeroTitle>
            <AnimatedText delay="0s">Her</AnimatedText>
            <AnimatedText delay="0.2s" isPrimary>Care</AnimatedText>
          </HeroTitle>
          <HeroSubtitle>Your comprehensive menstrual health companion</HeroSubtitle>
          <HeroDescription>
            Evidence-based tracking, personalized insights, and 24/7 support for your wellness journey
          </HeroDescription>
        </HeroContent>
        <HeroImageContainer>
          <HeroImg src={mainImage} alt="HerCare App" />
          <FloatingElement delay="0s" />
          <FloatingElement delay="2s" />
          <FloatingElement delay="4s" />
        </HeroImageContainer>
      </HeroSection>

      <PrimaryActionsSection>
        <ActionsSectionHeader>
          <ActionsTitle>Quick Actions</ActionsTitle>
          <ActionsSubtitle>Get immediate help or track your cycle</ActionsSubtitle>
        </ActionsSectionHeader>
        
        <PrimaryButtonContainer>
          <PrimaryActionButton onClick={() => navigate('/pad-sos')} variant="emergency">
            <ActionButtonContent>
              <IconWrapper variant="emergency">
                <ActionIcon src={sosIcon} alt="Emergency SOS" />
              </IconWrapper>
              <ButtonTextContainer>
                <ButtonTitle>Emergency SOS</ButtonTitle>
                <ButtonDescription>Instant help & nearest facilities</ButtonDescription>
                <ButtonCTA>Get Help Now →</ButtonCTA>
              </ButtonTextContainer>
            </ActionButtonContent>
            <ButtonGlow variant="emergency" />
          </PrimaryActionButton>

          <PrimaryActionButton onClick={() => navigate('/period-tracker')} variant="primary">
            <ActionButtonContent>
              <IconWrapper variant="primary">
                <ActionIcon src={menstruationIcon} alt="Period Tracker" />
              </IconWrapper>
              <ButtonTextContainer>
                <ButtonTitle>Cycle Tracker</ButtonTitle>
                <ButtonDescription>AI-powered predictions & insights</ButtonDescription>
                <ButtonCTA>Start Tracking →</ButtonCTA>
              </ButtonTextContainer>
            </ActionButtonContent>
            <ButtonGlow variant="primary" />
          </PrimaryActionButton>
        </PrimaryButtonContainer>
      </PrimaryActionsSection>

      <SecondaryContent>
        <InsightsSection>
          <SectionHeader>
            <SectionTitle>Health Insights</SectionTitle>
            <SectionSubtitle>Data-driven insights from our community</SectionSubtitle>
          </SectionHeader>
          
          <ChartsGrid>
            <ChartCard>
              <ChartHeader>
                <ChartTitle>Cycle Patterns</ChartTitle>
                <ChartBadge>Updated Weekly</ChartBadge>
              </ChartHeader>
              <ChartImage src={chart1} alt="Cycle patterns chart" />
              <DataHighlight>
                <HighlightNumber>28</HighlightNumber>
                <HighlightLabel>Average Cycle</HighlightLabel>
              </DataHighlight>
            </ChartCard>
            
            <ChartCard>
              <ChartHeader>
                <ChartTitle>Symptom Trends</ChartTitle>
                <ChartBadge>Community Data</ChartBadge>
              </ChartHeader>
              <ChartImage src={chart2} alt="Symptom trends chart" />
              <DataHighlight>
                <HighlightNumber>87%</HighlightNumber>
                <HighlightLabel>Accuracy Rate</HighlightLabel>
              </DataHighlight>
            </ChartCard>
          </ChartsGrid>
        </InsightsSection>

        <EducationSection>
          <SectionHeader>
            <SectionTitle>Health Education</SectionTitle>
            <SectionSubtitle>Evidence-based information for better health</SectionSubtitle>
          </SectionHeader>
          
          <EducationGrid>
            <EducationCard>
              <EducationIcon>🔬</EducationIcon>
              <EducationContent>
                <EducationTitle>Cycle Science</EducationTitle>
                <EducationText>Understanding your menstrual cycle helps optimize overall health and fertility awareness.</EducationText>
              </EducationContent>
            </EducationCard>
            
            <EducationCard>
              <EducationIcon>🏃‍♀️</EducationIcon>
              <EducationContent>
                <EducationTitle>Exercise & Health</EducationTitle>
                <EducationText>Regular physical activity can improve cycle regularity and reduce PMS symptoms.</EducationText>
              </EducationContent>
            </EducationCard>
            
            <EducationCard>
              <EducationIcon>👩‍⚕️</EducationIcon>
              <EducationContent>
                <EducationTitle>When to Consult</EducationTitle>
                <EducationText>Schedule regular check-ups and consult healthcare providers for any cycle irregularities.</EducationText>
              </EducationContent>
            </EducationCard>
          </EducationGrid>
        </EducationSection>
      </SecondaryContent>
    </Container>
  );
}

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
`;

const glow = keyframes`
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// Styled Components
const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(135deg, #fafbfc 0%, #f8f9fb 100%);
  color: #1a1d23;
  box-sizing: border-box;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 0 16px;
  }
  
  @media (max-width: 480px) {
    padding: 0 12px;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 0;
  border-bottom: 1px solid #e8eaed;
  margin-bottom: 40px;
  animation: ${slideInLeft} 0.8s ease-out;
  
  @media (max-width: 768px) {
    padding: 24px 0;
    margin-bottom: 32px;
  }
  
  @media (max-width: 480px) {
    padding: 20px 0;
    margin-bottom: 24px;
  }
`;

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const ProfileIcon = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid #ffffff;
  box-shadow: 0 4px 12px rgba(245, 101, 101, 0.15), 0 2px 6px rgba(245, 101, 101, 0.1);
  transition: all 0.3s ease;
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
  }
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(245, 101, 101, 0.2), 0 3px 8px rgba(245, 101, 101, 0.15);
  }
`;

const GreetingContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const GreetingText = styled.span`
  font-size: 14px;
  color: #5f6368;
  font-weight: 400;
  line-height: 1.4;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const UserName = styled.h1`
  margin: 0;
  font-weight: 600;
  font-size: 20px;
  color: #1a1d23;
  line-height: 1.3;
  background: linear-gradient(135deg, #f56565 0%, #ff6b9d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const LogoutButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #f56565 0%, #ff6b9d 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(245, 101, 101, 0.25);
  
  @media (max-width: 480px) {
    padding: 10px 20px;
    font-size: 13px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(245, 101, 101, 0.35);
  }

  &:active {
    transform: translateY(0);
  }
`;

const HeroSection = styled.section`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 48px;
  align-items: center;
  padding: 48px 0;
  margin-bottom: 64px;
  width: 100%;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 320px;
    gap: 32px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 32px 0;
    margin-bottom: 48px;
  }
  
  @media (max-width: 480px) {
    gap: 24px;
    padding: 24px 0;
    margin-bottom: 32px;
  }
`;

const HeroContent = styled.div`
  width: 100%;
  animation: ${slideInLeft} 1s ease-out;
  
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const AnimatedText = styled.span`
  display: inline-block;
  animation: ${fadeInUp} 1s ease-out;
  animation-delay: ${props => props.delay};
  animation-fill-mode: both;
  color: ${props => props.isPrimary ? '#f56565' : '#1a1d23'};
  background: ${props => props.isPrimary ? 'linear-gradient(135deg, #f56565 0%, #ff6b9d 100%)' : 'none'};
  ${props => props.isPrimary && `
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `}
`;

const HeroTitle = styled.h1`
  font-size: 56px;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.1;
  letter-spacing: -0.02em;
  
  @media (max-width: 1024px) {
    font-size: 48px;
  }
  
  @media (max-width: 768px) {
    font-size: 40px;
  }
  
  @media (max-width: 480px) {
    font-size: 32px;
    margin: 0 0 12px 0;
  }
`;

const HeroSubtitle = styled.h2`
  font-size: 24px;
  font-weight: 400;
  color: #5f6368;
  margin: 0 0 24px 0;
  line-height: 1.4;
  animation: ${fadeInUp} 1s ease-out 0.3s both;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
    margin: 0 0 16px 0;
  }
`;

const HeroDescription = styled.p`
  font-size: 16px;
  color: #5f6368;
  margin: 0;
  line-height: 1.6;
  animation: ${fadeInUp} 1s ease-out 0.5s both;
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const HeroImageContainer = styled.div`
  background: linear-gradient(135deg, #fff1f3 0%, #fce8eb 100%);
  border-radius: 24px;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  box-shadow: 0 8px 24px rgba(245, 101, 101, 0.15), 0 4px 12px rgba(245, 101, 101, 0.1);
  animation: ${slideInRight} 1s ease-out;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 24px;
    aspect-ratio: 4/3;
    max-width: 400px;
    margin: 0 auto;
  }
  
  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 16px;
  }
`;

const FloatingElement = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #f56565 0%, #ff6b9d 100%);
  border-radius: 50%;
  animation: ${float} 3s ease-in-out infinite;
  animation-delay: ${props => props.delay};
  
  @media (max-width: 480px) {
    width: 6px;
    height: 6px;
  }
  
  &:nth-child(3) {
    top: 20%;
    left: 20%;
  }
  
  &:nth-child(4) {
    top: 60%;
    right: 20%;
  }
  
  &:nth-child(5) {
    bottom: 30%;
    left: 30%;
  }
`;

const HeroImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-width: 320px;
  animation: ${float} 4s ease-in-out infinite;
  
  @media (max-width: 768px) {
    max-width: 280px;
  }
  
  @media (max-width: 480px) {
    max-width: 240px;
  }
`;

const PrimaryActionsSection = styled.section`
  margin-bottom: 80px;
  animation: ${fadeInUp} 1s ease-out 0.7s both;
  
  @media (max-width: 768px) {
    margin-bottom: 64px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 48px;
  }
`;

const ActionsSectionHeader = styled.div`
  text-align: center;
  margin-bottom: 48px;
  
  @media (max-width: 480px) {
    margin-bottom: 32px;
  }
`;

const ActionsTitle = styled.h2`
  font-size: 32px;
  font-weight: 600;
  color: #1a1d23;
  margin: 0 0 8px 0;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
  
  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const ActionsSubtitle = styled.p`
  font-size: 16px;
  color: #5f6368;
  margin: 0;
  line-height: 1.5;
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const PrimaryButtonContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const ButtonGlow = styled.div`
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: ${props => 
    props.variant === 'emergency' 
      ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' 
      : 'linear-gradient(135deg, #f56565 0%, #ff6b9d 100%)'
  };
  border-radius: 18px;
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: ${glow} 2s ease-in-out infinite;
  z-index: -1;
`;

const PrimaryActionButton = styled.button`
  background: ${props => 
    props.variant === 'emergency' 
      ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' 
      : 'linear-gradient(135deg, #f56565 0%, #ff6b9d 100%)'
  };
  color: white;
  border: none;
  border-radius: 16px;
  padding: 0;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => 
    props.variant === 'emergency' 
      ? '0 8px 24px rgba(220, 38, 38, 0.24), 0 4px 12px rgba(220, 38, 38, 0.16)' 
      : '0 8px 24px rgba(245, 101, 101, 0.24), 0 4px 12px rgba(245, 101, 101, 0.16)'
  };
  overflow: hidden;
  position: relative;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: ${props => 
      props.variant === 'emergency' 
        ? '0 16px 40px rgba(220, 38, 38, 0.35), 0 8px 20px rgba(220, 38, 38, 0.25)' 
        : '0 16px 40px rgba(245, 101, 101, 0.35), 0 8px 20px rgba(245, 101, 101, 0.25)'
    };
    
    ${ButtonGlow} {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(-2px) scale(1.01);
  }
`;

const ActionButtonContent = styled.div`
  display: flex;
  align-items: center;
  padding: 32px;
  gap: 24px;
  text-align: left;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 24px;
    gap: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 20px;
    gap: 16px;
    flex-direction: column;
    text-align: center;
  }
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: ${pulse} 2s ease-in-out infinite;
  
  @media (max-width: 480px) {
    width: 56px;
    height: 56px;
    border-radius: 12px;
  }
`;

const ActionIcon = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  
  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
  }
`;

const ButtonTextContainer = styled.div`
  flex: 1;
`;

const ButtonTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
  line-height: 1.3;
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const ButtonDescription = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 16px 0;
  line-height: 1.4;
  
  @media (max-width: 480px) {
    font-size: 13px;
    margin: 0 0 12px 0;
  }
`;

const ButtonCTA = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: white;
  opacity: 0.9;
  position: relative;
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -2px;
    left: 0;
    background: white;
    transition: width 0.3s ease;
  }
  
  ${PrimaryActionButton}:hover &::after {
    width: 100%;
  }
`;

const SecondaryContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 64px;
  animation: ${fadeInUp} 1s ease-out 1s both;
  
  @media (max-width: 768px) {
    gap: 48px;
  }
  
  @media (max-width: 480px) {
    gap: 32px;
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 32px;
  
  @media (max-width: 480px) {
    margin-bottom: 24px;
    text-align: center;
  }
`;

const SectionTitle = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: #1a1d23;
  margin: 0 0 8px 0;
  line-height: 1.3;
  background: linear-gradient(135deg, #f56565 0%, #ff6b9d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
  
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 16px;
  color: #5f6368;
  margin: 0;
  line-height: 1.5;
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const InsightsSection = styled.section``;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e8eaed;
  box-shadow: 0 4px 12px rgba(245, 101, 101, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 12px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -200px;
    width: 200px;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(245, 101, 101, 0.1),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover {
    box-shadow: 0 8px 24px rgba(245, 101, 101, 0.15);
    transform: translateY(-4px);
    
    &::before {
      left: 100%;
    }
  }
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 8px;
  
  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1d23;
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const ChartBadge = styled.span`
  font-size: clamp(10px, 2.5vw, 12px);
  font-weight: 500;
  color: #f56565;
  background: linear-gradient(135deg, rgba(245, 101, 101, 0.1) 0%, rgba(255, 107, 157, 0.1) 100%);
  padding: clamp(4px, 1.5vw, 6px) clamp(8px, 3vw, 12px);
  border-radius: clamp(8px, 3vw, 12px);
  border: 1px solid rgba(245, 101, 101, 0.2);
  display: inline-block;
  
  @media (max-width: 480px) {
    font-size: 10px;
    padding: 4px 8px;
    border-radius: 8px;
  }
`;

const ChartImage = styled.img`
  width: 100%;
  height: clamp(120px, 40vw, 180px);
  object-fit: contain;
  border-radius: clamp(6px, 2vw, 8px);
  
  @media (max-width: 768px) {
    height: clamp(100px, 35vw, 140px);
  }
  
  @media (max-width: 480px) {
    height: 100px;
    border-radius: 6px;
  }
`;

const DataHighlight = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(6px, 2vw, 8px);
  margin-top: clamp(12px, 4vw, 16px);
  padding: clamp(8px, 3vw, 12px);
  background: linear-gradient(135deg, rgba(245, 101, 101, 0.05) 0%, rgba(255, 107, 157, 0.05) 100%);
  border-radius: clamp(6px, 2vw, 8px);
  border: 1px solid rgba(245, 101, 101, 0.1);
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 8px;
    margin-top: 12px;
  }
`;

const HighlightNumber = styled.span`
  font-size: clamp(18px, 6vw, 24px);
  font-weight: 700;
  background: linear-gradient(135deg, #f56565 0%, #ff6b9d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const HighlightLabel = styled.span`
  font-size: clamp(12px, 3.5vw, 14px);
  color: #5f6368;
  font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const EducationSection = styled.section`
  padding: 0 clamp(16px, 5vw, 24px);
  
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const EducationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(16px, 6vw, 24px);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const EducationCard = styled.div`
  background: white;
  border-radius: clamp(12px, 4vw, 16px);
  padding: clamp(20px, 8vw, 32px);
  border: 1px solid #e8eaed;
  box-shadow: 0 4px 12px rgba(245, 101, 101, 0.08);
  display: flex;
  flex-direction: ${props => props.isMobile ? 'column' : 'row'};
  gap: clamp(12px, 5vw, 20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: clamp(3px, 1vw, 4px);
    background: linear-gradient(135deg, #f56565 0%, #ff6b9d 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    box-shadow: 0 8px 24px rgba(245, 101, 101, 0.15);
    transform: translateY(-2px);
    
    &::before {
      transform: scaleX(1);
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 20px;
    gap: 12px;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px;
    gap: 8px;
  }
`;

const EducationIcon = styled.div`
  font-size: clamp(24px, 8vw, 32px);
  flex-shrink: 0;
  animation: ${pulse} 3s ease-in-out infinite;
  
  @media (max-width: 768px) {
    align-self: center;
    font-size: 28px;
  }
  
  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const EducationContent = styled.div`
  flex: 1;
  
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const EducationTitle = styled.h3`
  font-size: clamp(16px, 4.5vw, 18px);
  font-weight: 600;
  color: #1a1d23;
  margin: 0 0 clamp(8px, 3vw, 12px) 0;
  line-height: 1.3;
  
  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 8px;
  }
`;

const EducationText = styled.p`
  font-size: clamp(12px, 3.5vw, 14px);
  color: #5f6368;
  margin: 0;
  line-height: 1.5;
  
  @media (max-width: 480px) {
    font-size: 12px;
    line-height: 1.4;
  }
`;