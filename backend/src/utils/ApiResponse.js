class ApiResponse {
  constructor(statusCode, payload, message) {
    this.statusCode = statusCode;
    this.payload = payload;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = new Date().toLocaleString();
  }
}

export default ApiResponse;
