import { useParams, useNavigate } from 'react-router-dom';
import services from '../services/services';
import Request from './Request';

const Basket = ({ requests }) => {
  const urlEndpoint = useParams().url_endpoint;
  const navigate = useNavigate();

  const deleteBasket = () => {
    // Pending -> Better error handling, can use `useState` to setErrorMessage on `/`
    services.deleteBasket(urlEndpoint)
      .then(() => {
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

  // Can use `window.location.origin` here instead of hardcoding the domain
  const uri = `regular-seahorse-mighty.ngrok-free.app/${urlEndpoint}`

  return (
    <div>
      <h1>Basket: {urlEndpoint}</h1>
      <div>
        <button onClick={deleteBasket}>Delete basket</button>
      </div>
      <div>
        { requests.length > 0
          ? <>
              <p>
                Requests collected at <kbd>{uri}</kbd><br />
                Total requests: {requests.length}
              </p>
              <ul>
                {requests.map((request) => {
                  return <Request key={JSON.stringify(request)} request={request} />
                })}
              </ul>
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
