import { useState } from 'react';
import {
  Routes, Route, Link
} from 'react-router-dom';
import Basket from './components/Basket';
import './App.css';

function App() {
  const [baskets, setBaskets] = useState([]);

  return (
    <div>
      <h1>Request Baskets</h1>
    </div>
  );
};

export default App;
