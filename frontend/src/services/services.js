import axios from 'axios';

export const getRandomNewBasketName = async () => {
  const response = await axios.get('/api/new_url_endpoint');
  return response.data;
};

export const createNewBasket = async (newBasketName) => {
  const response = await axios.post(`/api/baskets/${newBasketName}`);
  return response.data;
};