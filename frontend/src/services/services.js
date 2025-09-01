import axios from 'axios';

export const getRandomNewBasketName = async () => {
  const response = await axios.get('/api/new_url_endpoint');
  return response.data;
};

export const createNewBasket = async (newBasketName) => {
  const response = await axios.post(`/api/baskets/${newBasketName}`);
  return response.data;
};

const deleteBasket = (urlEndpoint) => {
  return axios.delete(`/api/baskets/${urlEndpoint}`);
};

export default { getRandomNewBasketName, createNewBasket, deleteBasket };
