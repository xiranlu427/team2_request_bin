import { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Link,
} from "react-router-dom";
import NewBasketCard from './components/NewBasketCard';
import BasketsList from './components/BasketsList';
import Basket from './components/Basket';
import { getRandomNewBasketName } from './services/services';
import './App.css';

const STORAGE_KEY = 'rb:baskets';

function loadBasketNames() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];

    return arr.filter(Boolean);
  } catch {
    return [];
  }
}

function saveBasketNames(names) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  } catch {
    return;
  }
}

function App() {
  const [baskets, setBaskets] = useState(() => loadBasketNames());
  const [newBasketName, setNewBasketName] = useState(null);

  useEffect(() => {
    setBaskets(loadBasketNames());
  }, []);
  useEffect(() => {
    saveBasketNames(baskets);
  }, [baskets]);
  useEffect(() => {
    // const newRandomBasketName = getRandomNewBasketName() 
    // this is only for local testing - change back to the line above when connected to backend
    const newRandomBasketName = 'urlendpoint';
    setNewBasketName(newRandomBasketName);
  }, []);

  // this is a mock function for local testing
  const mockCreateBasket = async (newBasketName) => {
    await new Promise(r => setTimeout(r, 150));
    return name;
  };

  return (
    <div>
      <header>
        <Link to='/'>Request Baskets</Link>
      </header>
    
      <Routes>
        <Route 
          path='/' 
          element={
            <main className='layout'>
              <div className='primary'>
                <NewBasketCard 
                  defaultBasketName={newBasketName}
                  setBaskets={setBaskets}
                  createBasket={mockCreateBasket} // this line is for testing - should be deleted when connected to backend
                />
              </div>

              <div className='sidebar'>
                <BasketsList baskets={baskets} />
              </div> 
            </main>
          }
        />
        <Route path='/:url_endpoint' element={<Basket />} />
      </Routes>
    </div>
  );
};

export default App;
