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
      <Link to='/web/url_endpoint'>url_endpoint</Link>
      <Routes>
        <Route path='/web/:url_endpoint' element={<Basket requests={[]}/>} />
      </Routes>
    </div>
  );
};

export default App;
