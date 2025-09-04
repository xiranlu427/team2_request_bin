import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import services from '../services/services';
import Request from './Request';

const Notification = ({ message }) => {
  if (message === null) {
    return null;
  }

  return (
    <div classname='error'>
      {message}
    </div>
  )
}

const Basket = ({ setBaskets }) => {
  const urlEndpoint = useParams().urlEndpoint;
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const webSocketReference = useRef(null);
  const [webSocketEnabled, setWebSocketEnabled] = useState(true);
  const [message, setMessage] = useState(null);

  const uri = `${window.location.origin}/${urlEndpoint}`;
  const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const autoRefreshLabel = webSocketEnabled ? 'Disable auto-refresh' : 'Enable auto-refresh';

  const getRequestsHook = useCallback(() => {
    services.getRequests(urlEndpoint)
      .then(setRequests)
      .catch(() => setRequests([]));
  }, [urlEndpoint]);

  useEffect(() => {
    getRequestsHook();

    if (webSocketEnabled && !webSocketReference.current) {
      const socket = new WebSocket(`${wsProtocol}://${window.location.host}`);

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'new_request') {
          setRequests(previous => [...previous, message.data]);
        }
      };

      socket.onclose = () => console.log('WebSocket closed');

      webSocketReference.current = socket;

      return () => socket.close();
    }
  }, [getRequestsHook, webSocketEnabled, wsProtocol]);

  const deleteBasket = () => {
    // Possible -> Better error handling, can use `useState` to setErrorMessage on `/`
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

  const clearBasket = () => {
    services.clearBasket(urlEndpoint)
      .then(() => {
        setRequests([]);
        setMessage('The basket has been successfully cleared!');
        setTimeout(() => setMessage(null), 5000);
      })
      .catch((error) => {
        if (error.response?.data === "Basket couldn't be cleared.") {
          setMessage('Error! The basket could not be cleared, please try again.');
          setTimeout(() => setMessage(null), 5000);
        } else {
          console.log('Error! The basket does not exist.')
          navigate('/');
        }
      });
  };

  const refreshBasket = () => getRequestsHook();

  const toggleAutoRefresh = () => {
    if (webSocketEnabled) {
      webSocketReference.current.close();
      webSocketReference.current = null;
      setWebSocketEnabled(false);
    } else {
      setWebSocketEnabled(true);
    }
  };

  return (
    <div>
      <h1>Basket: {urlEndpoint}</h1>
      <Notification message={message} />
      <div>
        <button type="button" onClick={deleteBasket}>Delete basket</button>
        <button type="button" onClick={clearBasket}>Clear basket</button>
        <button type="button" onClick={refreshBasket}>Refresh basket</button>
        <button type="button" onClick={toggleAutoRefresh}>{autoRefreshLabel}</button>
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
