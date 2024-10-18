// App.js
import React, { useState } from "react";
import styled from "styled-components";
import { FaUserAlt, FaLock, FaEnvelope } from "react-icons/fa";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
  };

  return (
    <Container>
      <AuthBox>
        <Title>{isSignup ? "Sign Up" : "Login"}</Title>
        {isSignup && (
          <InputContainer>
            <Icon>
              <FaEnvelope />
            </Icon>
            <Input type="email" placeholder="Email" />
          </InputContainer>
        )}
        <InputContainer>
          <Icon>
            <FaUserAlt />
          </Icon>
          <Input type="text" placeholder="Username" />
        </InputContainer>
        <InputContainer>
          <Icon>
            <FaLock />
          </Icon>
          <Input type="password" placeholder="Password" />
        </InputContainer>
        <Button>{isSignup ? "Sign Up" : "Login"}</Button>
        <AuthToggleText>
          {isSignup
            ? "Already have an account? "
            : "Don't have an account? "}
          <AuthToggleLink onClick={toggleAuthMode}>
            {isSignup ? "Login" : "Sign up"}
          </AuthToggleLink>
        </AuthToggleText>
      </AuthBox>
    </Container>
  );
};

// Styled-components
const Container = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AuthBox = styled.div`
  width: 350px;
  padding: 2rem;
  background-color: #1e1e1e;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.6);
`;

const Title = styled.h2`
  text-align: center;
  color: #fff;
  margin-bottom: 2rem;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  background-color: #333;
  border-radius: 8px;
  padding: 0.5rem;
`;

const Icon = styled.div`
  color: #bbb;
  margin-right: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 1rem;
  padding: 0.5rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background-color:rgb(43, 126, 159);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background-color: #3700b3;
  }
`;

const AuthToggleText = styled.p`
  text-align: center;
  color: #fff;
  margin-top: 1rem;
`;

const AuthToggleLink = styled.span`
  color: rgb(43, 126, 159);
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export default Login;
