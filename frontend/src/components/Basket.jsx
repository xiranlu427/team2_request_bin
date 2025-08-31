import { useParams, useNavigate } from 'react-router-dom';
import services from '../services/services.js';

const Basket = ({ requests }) => {
  const urlEndpoint = useParams().url_endpoint;
  const navigate = useNavigate();

  const deleteBasket = () => {
    // Pending -> Better error handling, can use `useState` to setErrorMessage on `/`
    services.deleteBasket(urlEndpoint)
      .catch(() => [
        console.log('The basket does not exist!')
      ])
      .finally(() => {
        navigate('/');
      })
  }

  return (
    <div>
      <div>
        <h1>Basket: {urlEndpoint}</h1>
        <p>
          Requests collected at <kbd>regular-seahorse-mighty.ngrok-free.app/{urlEndpoint}</kbd><br />
          Total requests: {requests.length}
        </p>
      </div>
      <div>
        <button onClick={() => deleteBasket()}>Delete basket</button>
      </div>
      <ul>
        {requests.map((request) => {
          <Request request={request}/>
        })}
      </ul>
    </div>
  );
};

export default Basket;