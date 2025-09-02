import { useState, useEffect } from 'react';
import {
  Routes, Route, Link, useLocation
} from "react-router-dom";
import NewBasketCard from './components/NewBasketCard';
import BasketsList from './components/BasketsList';
import Basket from './components/Basket';
import { getRandomNewBasketName } from './services/services';
import './App.css';

function App() {
  const [baskets, setBaskets] = useState([]);
  const [newBasketName, setNewBasketName] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      getRandomNewBasketName()
      .then((response) => {
        setNewBasketName(response);
      });
    }
  }, [location.pathname]);

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
                />
              </div>

              <div className='sidebar'>
                <BasketsList baskets={baskets} />
              </div> 
            </main>
          }
        />
        <Route path='/:urlEndpoint' element={<Basket setBaskets={setBaskets} />} />
      </Routes>
    </div>
  );
};

export default App;
