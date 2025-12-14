import React, { useState } from 'react';
import './App.css'; // Use the same CSS for consistent styling

interface LoginProps {
  onLogin: (user: string, pass: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      // Pass credentials back to parent
      onLogin(username, password);
    } else {
      alert("Please enter both NetID and Password.");
    }
  };

  return (
    <div className="App">
      <header>
        <h1>iLab SQL Login</h1>
      </header>
      
      <div className="input-container" style={{ marginTop: '50px', maxWidth: '400px' }}>
        <form onSubmit={handleSubmit} className="login-form">
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>NetID:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your NetID"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your iLab Password"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '10px' }}>
            Login to System
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;