
# Promotional Shopping Cart API

This is a RESTful API built with NestJS that simulates a shopping cart system. The application manages products, users, and shopping carts, automatically calculating the best price based on available promotions.


#### Tech Stack
- Framework: NestJS
- Language: TypeScript
- ORM: TypeORM
- Database: SQLite (in-memory)
- Validation: class-validator and class-transformer
- Testing: Jest


### Quickstart
##### Prerequisites
- Node.js (version 16 or higher recommended)
- Yarn
### Installation

Clone the repository and install the dependencies:

```bash
# Clone the repository (if applicable)
# git clone https://your-repository.git
# cd your-project

# Install dependencies
yarn install
```
    
#### Running the Application

```bash
yarn start:dev
```
#### Running Tests

```bash
# Run unit tests
yarn test

# Run end-to-end tests
yarn test:e2e

# Run tests and generate a coverage report
yarn test:cov
```
### Architecture 
The API is designed following NestJS best practices, with a modular and maintainable architecture.

#### Modules

- ProductsModule: Manages the products. Contains the logic to seed the database with initial items.
- UsersModule: Handles user management. Also seeds the database with default users on startup.
- CartModule: The core of the application. Manages cart creation, adding/removing items, and calculating totals.

#### Promotional logic

The most complex business logic is isolated in the PromotionService. This service is responsible for:

- Calculating the "Get 3 for the Price of 2" promotion discount, which sorts all cart items by price and makes the cheapest item in every group of three free.
- Calculating the 15% discount for VIP users.
- Comparing both discounts for a VIP user and automatically applying the most advantageous one, returning a recommendation message.
- This approach keeps the CartService clean by delegating the calculation responsibility to a specialized service.

#### Entities and Relationships
- User and Cart have a OneToMany relationship (a user can have many carts).
- Cart and CartItem have a OneToMany relationship (a cart can have many items).
- Product and CartItem have a ManyToOne relationship (many cart items can point to the same product)

#### Assumptions & Trade-offs
- Database: We use SQLite in-memory to simplify setup and testing, eliminating the need for an external database service. For a production environment, migrating to a more robust DBMS like PostgreSQL or MySQL would be necessary.
- Cart State: The cart's state is managed entirely on the server-side, identified by a cartId. The flow allows anonymous users to create a cart and only identify themselves when calculating the total with discounts.
- Strong Typing: The use of DTOs (Data Transfer Objects) with class-validator ensures that all incoming API data is validated, maintaining a clean API contract and preventing malformed data.