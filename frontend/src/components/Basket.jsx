import { useParams } from 'react-router-dom';

const Basket = ({ requests }) => {
  const urlEndpoint = useParams().url_endpoint;

  return (
    <div>
      <div>
        <h2>Basket: {urlEndpoint}</h2>
        <p>
          Requests collected at 
          <kbd>regular-seahorse-mighty.ngrok-free.app{urlEndpoint}</kbd>
        </p>
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