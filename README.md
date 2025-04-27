# Memory Picker

Memory Picker is a Node.js and TypeScript-based boilerplate project designed to manage user accounts, posts, and image uploads. It uses PostgreSQL for database management and AWS S3-compatible storage for file uploads.

## Project Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd node-ts-boilerplate-main
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory and configure the following variables:
   ```env
   DATABASE_URL=<your_postgresql_connection_string>
   AWS_ACCESS_KEY_ID=<your_aws_access_key_id>
   AWS_SECRET_ACCESS_KEY=<your_aws_secret_access_key>
   ENDPOINT_URL=<your_s3_endpoint_url>
   REGION=<your_s3_region>
   JWT_SECRET=<your_jwt_secret>
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Build and Start the Project**:
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### User Routes (`/api/user`)

- **POST `/register`**  
  Register a new user.  
  **Request Body**: `{ username, email, password }`  
  **Response**: `{ message, user }`

- **POST `/login`**  
  Authenticate a user and return a JWT token.  
  **Request Body**: `{ email, password }`  
  **Response**: `{ message, token }`

- **GET `/me`**  
  Get the authenticated user's details.  
  **Headers**: `Authorization: Bearer <token>`  
  **Response**: `{ user }`

- **POST `/profile-picture`**  
  Upload a profile picture for the authenticated user.  
  **Headers**: `Authorization: Bearer <token>`  
  **Form Data**: `image` (file)  
  **Response**: `{ message, profilePicture }`

- **POST `/toggle-visibility`**  
  Toggle the visibility of the authenticated user's profile.  
  **Headers**: `Authorization: Bearer <token>`  
  **Request Body**: `{ isPublic }`  
  **Response**: `{ message }`

- **GET `/public-users`**  
  Get a paginated list of public users.  
  **Headers**: `Authorization: Bearer <token>`  
  **Query Params**: `page, limit, search`  
  **Response**: `{ page, limit, users }`

### Upload Routes (`/api/upload`)

- **POST `/profile-pick`**  
  Upload a profile picture.  
  **Form Data**: `image` (file)  
  **Response**: `{ url }`

- **POST `/post`**  
  Upload an image for a post.  
  **Form Data**: `image` (file)  
  **Response**: `{ url }`

### Post Routes (`/api/post`)

- **POST `/`**  
  Create a new post.  
  **Headers**: `Authorization: Bearer <token>`  
  **Form Data**: `image` (file)  
  **Request Body**: `{ title, locationLat, locationLong }`  
  **Response**: `{ message, post }`

- **PATCH `/:postId`**  
  Update an existing post.  
  **Headers**: `Authorization: Bearer <token>`  
  **Form Data**: `image` (optional file)  
  **Request Body**: `{ title, locationLat, locationLong }`  
  **Response**: `{ message, post }`

- **DELETE `/:postId`**  
  Delete a post.  
  **Headers**: `Authorization: Bearer <token>`  
  **Response**: `{ message }`

- **GET `/:userId`**  
  Get posts for a specific user.  
  **Query Params**: `page, limit, order`  
  **Response**: `{ page, limit, order, posts }`

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **ORM**: `postgres` library
- **File Storage**: AWS S3-compatible storage
- **Authentication**: JWT
- **TypeScript**: For type safety
- **Linting**: ESLint with TypeScript rules

## License

This project is licensed under the ISC License.
