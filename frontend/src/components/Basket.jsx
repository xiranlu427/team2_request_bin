import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import services from '../services/services';
import Request from './Request';

const Basket = ({ setBaskets }) => {
  const urlEndpoint = useParams().urlEndpoint;
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    services.getRequests(urlEndpoint)
      .then(setRequests)
      .catch(() => setRequests([]));
  }, [urlEndpoint]);

  const deleteBasket = () => {
    // Pending -> Better error handling, can use `useState` to setErrorMessage on `/`
    services.deleteBasket(urlEndpoint)
      .then(() => {
        setBaskets(baskets => baskets.filter((basket) => basket !== urlEndpoint));
        console.log('Basket deleted successfully!');
      })
      .catch((error) => {
        if (error.response?.status === 404) {
          console.log('The basket does not exist!');
        } else {
          console.error(`Unexpected error: ${error.message}`);
        }
      })
      .finally(() => {
        navigate('/');
      });
  };

  const uri = `${window.location.origin}/${urlEndpoint}`

  return (
    <div>
      <h1>Basket: {urlEndpoint}</h1>
      <div>
        <button type="button" onClick={deleteBasket}>Delete basket</button>
      </div>
      <div>
        { requests.length > 0
          ? <>
              <p>
                Requests collected at <kbd>{uri}</kbd><br />
                Total requests: {requests.length}
              </p>
              <div>
                {requests.map((request) => {
                  return <Request key={JSON.stringify(request)} request={request} />
                })}
              </div>
            </>
          : <>
              <h2>Empty basket!</h2>
              <p>Send requests at <kbd>{uri}</kbd></p>
            </>
        }
      </div>
    </div>
  );
};

export default Basket;
