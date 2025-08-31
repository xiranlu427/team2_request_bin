import axios from 'axios';

const deleteBasket = async function (urlEndpoint) {
  const response = await axios.delete(`/api/baskets/${urlEndpoint}`);
  return response.status;
};

export default { deleteBasket };