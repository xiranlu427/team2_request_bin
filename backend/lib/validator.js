module.exports = {
  endpointIsTooLong(urlEndpoint) {
    return urlEndpoint.length > 100;
  },

  endpointContainsSymbols(urlEndpoint) {
    return /[^a-zA-Z0-9]/.test(urlEndpoint);
  },

  endpointIsReserved(urlEndpoint) {
    return urlEndpoint === 'health';
  }
}