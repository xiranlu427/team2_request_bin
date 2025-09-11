const pgQuery = require("./pg_connection");

module.exports = class PostgreSQL {
  //Returns the id of a basket based on an endpoint
  async getBasketId(urlEndpoint) {
    try {
      let result = await pgQuery(
        "SELECT id FROM baskets WHERE url_endpoint = $1",
        urlEndpoint
      );
      return result.rowCount ? result.rows[0].id : null;
    } catch (e) {
      console.error(`getBasketId failed: ${e}`);
      throw e;
    }
  }

  // Checks if a basket exists (url endpoint is in db)
  async basketExists(urlEndpoint) {
    try {
      const result = await pgQuery(
        "SELECT 1 FROM baskets WHERE url_endpoint = $1",
        urlEndpoint
      );
      return result.rowCount > 0;
    } catch (e) {
      console.error(`basketExists failed: ${e.message}`);
      throw e;
    }
  }

  // Return a potential url endpoint
  async getNewURLEndpoint() {
    try {
      let urlEndpoint;
      do {
        urlEndpoint = generateURLEndpoint();
      } while (await this.basketExists(urlEndpoint));

      return urlEndpoint;
    } catch (e) {
      console.error(`Couldn't create url endpoint: ${e}`);
      throw e;
    }

    function generateURLEndpoint() {
      const CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";
      const URL_LENGTH = 7;
      let url = "";
      for (let idx = 0; idx < URL_LENGTH; idx += 1) {
        let randomChar = CHARS[Math.floor(Math.random() * CHARS.length)];
        url += randomChar;
      }
      return url;
    }
  }

  // Creates a new basket with the specified endpoint
  async createBasket(urlEndpoint) {
    try {
      let result = await pgQuery(
        "INSERT INTO baskets (url_endpoint) VALUES ($1) ON CONFLICT (url_endpoint) DO NOTHING RETURNING id",
        urlEndpoint
      );

      return result.rowCount > 0;
    } catch (e) {
      console.error(`Couldn't create basket: ${e}`);
      throw e;
    }
  }

  // Deletes the corresponding basket
  async deleteBasket(urlEndpoint) {
    try {
      let basketId = await this.getBasketId(urlEndpoint);
      if (basketId == null) return false;

      await pgQuery("DELETE FROM requests WHERE basket_id = $1", basketId);
      let result = await pgQuery("DELETE FROM baskets WHERE id = $1", basketId);
      return result.rowCount > 0;
    } catch (e) {
      console.error(`Couldn't delete basket: ${e}`);
      throw e;
    }
  }

  // Deletes all requests from the corresponding basket
  async clearBasket(urlEndpoint) {
    try {
      let basketId = await this.getBasketId(urlEndpoint);
      if (basketId == null) return false;

      let result = await pgQuery(
        "DELETE FROM requests WHERE basket_id = $1",
        basketId
      );

      return result.rowCount > 0;
    } catch (e) {
      console.error(`Couldn't clear basket: ${e}`);
      throw e;
    }
  }

  // Adds a request to the database
  async addRequest(urlEndpoint, headers, method, mongoDocumentId) {
    try {
      let basketId = await this.getBasketId(urlEndpoint);
      if (basketId == null) return false;

      let requestAdded = await pgQuery(
        "INSERT INTO requests (basket_id, headers, method, body) VALUES ($1, $2, $3, $4)",
        basketId,
        headers,
        method,
        mongoDocumentId
      );

      //Signifies whether the query truly worked
      return requestAdded.rowCount > 0;
    } catch (e) {
      console.error(`Couldn't add request: ${e}`);
      throw e;
    }
  }

  // Returns an array of objects representing requests
  async getRequests(urlEndpoint) {
    try {
      let basketId = await this.getBasketId(urlEndpoint);
      if (basketId == null) return [];

      let result = await pgQuery(
        "SELECT id, arrival_timestamp as timestamp, headers, method, body FROM requests WHERE basket_id = $1 ORDER BY timestamp DESC",
        basketId
      );

      return result.rows;
    } catch (e) {
      console.error(`Couldn't get requests: ${e}`);
      throw e;
    }
  }
};
