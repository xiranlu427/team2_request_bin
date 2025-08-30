const pgQuery = require("./pg_connection");

module.exports = class PostgreSQL {
  async getBasketId(urlEndpoint) {
    try {
      let basketId = await pgQuery(
        "SELECT id FROM baskets WHERE url_endpoint = $1",
        urlEndpoint
      );
      return basketId;
    } catch (e) {
      console.error(`Couldn't get basketId: ${e}`);
      return false;
    }
  }

  // Creates a new basket with the specified endpoint
  async createBasket(urlEndpoint) {
    //STUB
  }

  // Deletes the corresponding basket
  async deleteBasket(urlEndpoint) {
    //STUB
  }

  // Deletes all requests from the corresponding basket
  async clearBasket(urlEndpoint) {
    try {
      let basketId = await this.getBasketId(urlEndpoint);

      let result = await pgQuery(
        "DELETE FROM requests WHERE basket_id = $1",
        basketId
      ); //Correct query?

      return result.rowCount > 0;
    } catch (e) {
      console.error(`Couldn't clear basket: ${e}`);
      return false;
    }
  }

  // Adds a request to the database
  async addRequest(urlEndpoint, method, headers, mongoDocumentId) {
    try {
      let basketId = await this.getBasketId(urlEndpoint);

      let requestAdded = await pgQuery(
        "INSERT INTO requests (basket_id, headers, method, body) VALUES ($1, $2, $3, $4)",
        basketId,
        method,
        headers,
        mongoDocumentId
      );

      //Signifies whether the query truly worked
      return requestAdded.rowCount > 0;
    } catch (e) {
      console.error(`Couldn't add request: ${e}`);
      return false;
    }
  }

  // Returns an array of objects respresenting
  async getRequests(urlEndpoint) {
    //STUB
  }
};
