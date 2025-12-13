import React, { useState, FormEvent } from 'react';
import './App.css';
import { ApiResponse, TableRow, SortConfig } from './types';

function App() {
  // Application State
  const [question, setQuestion] = useState<string>('');
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Handle Form Submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setSortConfig(null); // Reset sort settings when a new query is run

    try {
      const response = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      
      const data: ApiResponse = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to backend");
    }
    setLoading(false);
  };

  // Sorting Logic for the Interactive Table
  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (): TableRow[] => {
    // Safety check: ensure table_data is an array before trying to sort it
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

  return (
    <div className="App">
      <header>
        <h1>SQL AI Assistant</h1>
      </header>
      
      {/* 1. Input Section  */}
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
          {/* 2. Output Box: Original Query  */}
          <div className="box">
            <h3>Original Question</h3>
            <p>{result.original_question}</p>
          </div>

          {/* 3. Output Box: Generated SQL (LLM Output)  */}
          <div className="box">
            <h3>Generated SQL</h3>
            <div className="code-block">{result.generated_sql}</div>
          </div>

          {/* 4. Output Box: Interactive Table [cite: 7, 8, 10] */}
          <div className="box full-width">
            <h3>Result Table</h3>
            
            {Array.isArray(result.table_data) && result.table_data.length > 0 ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      {/* Dynamically generate headers from the first row keys */}
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
              // Error handling if the query returned no data or an error
              <div className="error-message">
                <p>
                  {Array.isArray(result.table_data) 
                    ? "Query returned no results." 
                    : `Error: ${(result.table_data as any).error || "Unknown error"}`
                  }
                </p>
              </div>
            )}
            
            {/* Display SSH errors if any */}
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
