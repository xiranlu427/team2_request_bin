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

function App() {
  const [baskets, setBaskets] = useState([]);
  const [newBasketName, setNewBasketName] = useState(null);

  useEffect(() => {
    // const newRandomBasketName = getRandomNewBasketName() 
    // this is only for local testing - change back to the line above when connected to backend
    const newRandomBasketName = 'urlendpoint';
    setNewBasketName(newRandomBasketName);
  }, []);

  // this is a mock function for local testing
  const mockCreateBasket = async (newBasketName) => {
    await new Promise(r => setTimeout(r, 150));
    return { name: newBasketName };
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
