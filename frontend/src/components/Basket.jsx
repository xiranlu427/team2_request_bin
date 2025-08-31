import { useParams, useNavigate } from 'react-router-dom';
import services from '../services/services';
import Request from './Request';

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
  };

  const uri = () => {
    return (
      <kbd>regular-seahorse-mighty.ngrok-free.app/{urlEndpoint}</kbd>
    )
  };

  return (
    <div>
      <h1>Basket: {urlEndpoint}</h1>
      <div>
        <button onClick={() => deleteBasket()}>Delete basket</button>
      </div>
      <div>
        { requests.length !== 0
          ? <>
              <p>
                Requests collected at {uri()}<br />
                Total requests: {requests.length}
              </p>
              <ul>
                {requests.map((request) => {
                  return <Request request={request} />
                })}
              </ul>
            </>
          : <>
              <h2>Empty basket!</h2>
              <p>Send requests at {uri()}</p>
            </>
        }
      </div>
    </div>
  );
};

export default Basket;
