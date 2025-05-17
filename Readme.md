# Levo.ai Schema Upload and Versioning API

This project implements a backend API for uploading, validating, versioning, and retrieving OpenAPI specification (schema) files. 

## Project Description

The API provides endpoints to:

* Receive OpenAPI schema files (JSON or YAML) from a client (e.g., the Levo CLI).
* Validate the uploaded schema against the OpenAPI specification.
* Store the schema files in MongoDB as String with other detail like version, application name and service name.
* Automatically version the uploaded schemas for each application and service.
* Allow clients to retrieve the latest or specific versions of the schema for a given application and service.

## Tech Stack

* **Backend:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (mongoose)
* **Schema Validation:** oas-validator
* **YAML Parsing:** yamljs
* **HTTP Client (for CLI):** axios
* **Command-Line Interface (CLI):** commander
* **Testing:** jest, supertest (for unit tests)

## Backend Server Setup

1.  **Prerequisites:**
    * Node.js and npm (or yarn) installed on your system.
    * MongoDB installed and running.

2.  **Installation:**
    ```bash
    cd server  # Navigate to your backend directory
    npm install
    ```

3.  **Configuration:**
    * Create a `.env` file in your backend directory and add the following environment variables:
        ```env
        MONGO_URI=connectionString # Replace with your MongoDB connection string 
        PORT=5000 # Replace with your Port number
        ```

4.  **Run the Backend Server:**
    ```bash
    npm start or node index.js
    ```
    This command (defined in your `package.json`) should start your Express server.

## Client (Levo CLI) Setup

The Levo CLI is a Node.js script that interacts with the backend API.

1.  **Prerequisites:**
    * Node.js and npm (or yarn) installed on your system.

2.  **Installation (if you haven't already):**
    ```bash
    cd client # Navigate to your CLI directory (if separate)
    npm install 
    ```
3.  **Configuration:**
    * Create a `.env` file in your client directory and add the following environment variables:
        ```env
        API_BASE_URL=http://localhost:5000/api/schemas # Replace it with http://xyz.com/api/schemas or http://localhost:[server_port_number]/api/schemas
        ```
3.  **Make the script executable:**
    ```bash
    chmod +x levo.js
    ```

## Making Requests

Ensure your backend server is running before executing the CLI commands.

**1. Upload Schema:**

Use the `levo import` command to upload an OpenAPI specification file.

```bash
levo.js import --spec /path/to/your/openapi.json --application my-app
levo.js import --spec /path/to/your/openapi.yaml --application my-app --service users
```

**2. Get Latest Schema:**

Use the `levo get-latest` command to get latests OpenAPI specification for a application/service.

```bash
levo.js get-latest --application my-app
levo.js get-latest --application my-app --service users
```

**3. Get specific version of Schema:**

Use the `levo get-schema-by-version` command to get a particular version of an OpenAPI specification for a application/service.

```bash
levo.js get-schema-by-version --application my-app --version 1
levo.js get-schema-by-version --application my-app --service users --version 2
```

**3. Display help for commands**

```bash
levo.js --help
levo.js import --help 
```