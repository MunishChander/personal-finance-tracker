import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Personal Finance Tracker</h1>
        <p>Manage your Fixed Deposits and Savings Accounts</p>
      </header>
      
      <main className="app-main">
        <div className="card">
          <h2>Welcome!</h2>
          <p>This is a placeholder. The application will be built incrementally.</p>
          <button onClick={() => setCount((count) => count + 1)}>
            Count is {count}
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
