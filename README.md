# Assessment - Courier API

This is a NestJS-Typescript based API for managing courier services, including fetching shipping rates and generating authentication tokens.

---

## Prerequisites

Before running or testing the API, ensure you have the following installed:

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Git**: [Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- **API Testing Tool**: (Optional) [Postman](https://www.postman.com/) or `curl` for testing endpoints.

---

## Getting Started

### 1. Clone the Repository

Clone the project repository to your local machine:

```bash
git clone https://github.com/syukranDev/nest-courier-api.git
cd nest-courier-api
```

---

### 2. Start the Application

Use Docker Compose to build and start the application:

```bash
docker-compose up --build
```

- This will:
  - Build the `app` container for the API.
  - Start the `db` container for the PostgreSQL database.

Once the containers are running, the API will be accessible at `http://localhost:3000`.

---

### 3. Verify the Application is Running

To ensure the API is running, open your browser or use `curl` to access the root endpoint:

```bash
curl http://localhost:3000
```

You should see a response like:

```json
{
  "message": "Welcome to the App, this is the root path"
}
```

---

## API Endpoints

### Option 1: Test via Swagger
```bash
  http://localhost:3000/api
 ```
![image](https://github.com/user-attachments/assets/d43da66e-d3b6-43fb-b7a8-71f000381a7a)


### Option 2: Via Curl/Postman
### 1. **Generate Token**
- **Endpoint**: `POST /app/generate-token`
- **Description**: Generates a new authentication token that is valid for 24 hours.
- **Example `curl` Command**:
  ```bash
  curl -X POST http://localhost:3000/app/generate-token
  ```
- **Expected Response**:
  ```json
  {
    "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    "expiresAt": "2025-04-15T12:00:00.000Z"
  }
  ```

---

### 2. **Fetch Shipping Rates**
- **Endpoint**: `POST /app/rates`
- **Description**: Fetches shipping rates from multiple courier services. Requires a valid token in the `Authorization` header.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "senderState": "Selangor",
    "senderPostcode": "40000",
    "receiverState": "Kuala Lumpur",
    "receiverPostcode": "50000",
    "weight": "2.5"
  }
  ```
- **Example `curl` Command**:
  ```bash
  curl -X POST http://localhost:3000/app/rates \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "senderState": "Selangor",
    "senderPostcode": "40000",
    "receiverState": "Kuala Lumpur",
    "receiverPostcode": "50000",
    "weight": "2.5"
  }'
  ```
- **Expected Response**:
  ```json
  {
    "data": [
        {
            "courier": "Citylink",
            "rate": 18
        },
        {
            "courier": "Poslaju",
            "rate": 10.58
        },
        {
            "courier": "Skynet",
            "rate": 12.7
        }
    ],
    "debug": [
        {
            "courier": "J&T",
            "debugMsg": "Request failed with status code 419"
        }
    ]
  }
  ```
- **Notes**:
  1. The payload is limited to the fields shown above (`senderState`, `senderPostcode`, `receiverState`, `receiverPostcode`, and `weight`). Other parameters, such as dimensions, are hardcoded in the backend for simplicity since every external courier API has different payload requirements.
  2. **Caching**: The API uses a database-based caching mechanism. If a request with the same payload (sender/receiver details and weight) was made within the last 24 hours, the cached result will be returned instead of making new requests to external courier APIs.
  3. The `debug` object in the response indicates if any external API is down or inaccessible for any reason.

---

### 3. **Health Check**
- **Endpoint**: `GET /app`
- **Description**: Checks the server connection.
- **Example `curl` Command**:
  ```bash
  curl http://localhost:3000/app
  ```
- **Expected Response**:
  ```json
  {
    "message": "Connected to the server"
  }
  ```

---

## Stopping the Application

When you're done testing, stop the containers:

```bash
docker-compose down
```

This will stop and remove the containers, but the database data will persist unless you remove the volumes.

To remove the volumes as well:

```bash
docker-compose down --volumes
```

---


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
