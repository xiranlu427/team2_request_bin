import axios from 'axios';

const deleteBasket = (urlEndpoint) => {
  return axios.delete(`/api/baskets/${urlEndpoint}`);
};

export default { deleteBasket };
