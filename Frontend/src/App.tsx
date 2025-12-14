import React, { useState, FormEvent } from 'react';
import './App.css';
import { ApiResponse, TableRow, SortConfig, Credentials } from './types';
import Login from './Login'; // Import the new Login component

function App() {
  // --- Auth State ---
  // If null, show Login page. If set, show Main App.
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  // --- Application State ---
  const [question, setQuestion] = useState<string>('');
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // --- Handlers ---

  const handleLogin = (user: string, pass: string) => {
    // This triggers the switch to the "original \ask page" view
    setCredentials({ user, pass });
  };

  const handleLogout = () => {
    setCredentials(null); // Switch back to Login view
    setResult(null);      // Clear previous results
    setQuestion('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!credentials) return; // Should not happen if UI is correct

    setLoading(true);
    setResult(null);
    setSortConfig(null);

    try {
      const response = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question, 
          ilab_user: credentials.user, 
          ilab_pass: credentials.pass 
        }),
      });
      
      const data: ApiResponse = await response.json();
      
      if (response.status === 401) {
          alert("Authentication failed. Checking credentials...");
          setCredentials(null); // Log out if credentials were bad
      } else {
          setResult(data);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to backend");
    }
    setLoading(false);
  };

  // Sorting Logic
  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (): TableRow[] => {
    if (!result || !Array.isArray(result.table_data)) return [];

    let sortableItems = [...result.table_data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA === valB) return 0;
        if (valA === null) return 1;
        if (valB === null) return -1;
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  };

  const sortedData = getSortedData();

  // --- View Switching Logic ---

  // 1. Show Login Page if no credentials
  if (!credentials) {
    return <Login onLogin={handleLogin} />;
  }

  // 2. Show Main Query Page if logged in
  return (
    <div className="App">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <h1>SQL AI Assistant</h1>
        <div style={{ fontSize: '0.9em' }}>
          <span>Logged in as: <strong>{credentials.user}</strong> </span>
          <button onClick={handleLogout} style={{ marginLeft: '10px', padding: '5px 10px' }}>
            Logout
          </button>
        </div>
      </header>
      
      <div className="input-container">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the database..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Run Query'}
          </button>
        </form>
      </div>

      {result && (
        <div className="output-container">
          <div className="box">
            <h3>Original Question</h3>
            <p>{result.original_question}</p>
          </div>

          <div className="box">
            <h3>Generated SQL</h3>
            <div className="code-block">{result.generated_sql}</div>
          </div>

          <div className="box full-width">
            <h3>Result Table</h3>
            {Array.isArray(result.table_data) && result.table_data.length > 0 ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      {Object.keys(result.table_data[0]).map((key) => (
                        <th key={key} onClick={() => handleSort(key)}>
                          {key} {sortConfig?.key === key ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j}>{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="error-message">
                <p>
                  {Array.isArray(result.table_data) 
                    ? "Query returned no results." 
                    : `Error: ${(result.table_data as any).error || "Unknown error"}`
                  }
                </p>
              </div>
            )}
            
            {result.ssh_error && (
               <p className="error">Remote Log: {result.ssh_error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;