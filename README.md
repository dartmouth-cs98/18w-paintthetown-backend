# Paint the Town: Backend

An API that provides server functionality for the Unity app, *Paint the Town*. The backend consists of two main components: `/app` and `/testing` and deploys to [Heroku](https://paint-the-town.herokuapp.com/api).

## File Structure

Listing of non-standard directories:

```
backend
│   .env
│   README.md
│
└───app
│   │   init_script.js
│   │   router.js
│   │   server.js
│   │
│   └───config
│   │   │   index.js
│   │
│   └───controllers
│   │   │   building_controller.js
│   │   │   city_controller.js
│   │   │   color_controller.js
│   │   │   continent_controller.js
│   │   │   coordinate_controller.js
│   │   │   country_controller.js
│   │   │   pattern_controller.js
│   │   │   reset_controller.js
│   │   │   splotch_controller.js
│   │   │   tag_controller.js
│   │   │   team_controller.js
│   │   │   user_controller.js
│   │
│   └───models
│   │   │   achievement_model.js
│   │   │   building_model.js
│   │   │   city_model.js
│   │   │   color_model.js
│   │   │   continent_model.js
│   │   │   coordinate_model.js
│   │   │   country_model.js
│   │   │   pattern_model.js
│   │   │   reset_model.js
│   │   │   splotch_model.js
│   │   │   tag_model.js
│   │   │   team_model.js
│   │   │   user_model.js
│   │
│   └───services
│   │   │   passport.js
│   │
│   └───utils
│       │   index.js
│   
└───testing
    │   clear_db.txt
    │   test_scaffolding.js
    │
    └───web_client
        │   ...
```

## Implementation
### App

The directories in `/app` include the entire implementation of the backend. Written in ES6 and compiled through [Babel](https://babeljs.io/), the implementation follows the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) and consists of a [MongoDB](https://www.mongodb.com/)-powered API that handles security and authentication through [Passport](http://www.passportjs.org/).

* **Controllers**: Each controller is associated with a model and determines how to handle and respond to HTTP requests. Controller actions may include alterations to MongoDB models.

* **Initialization script**: Script to be run right after resetting the database. Creates default users, colors, and teams.

* **Models**: Each model defines the fields that database entries should contain and determines primary keys.

* **Router**: Assigns controllers to each route exposed by the API (exclusively POST and GET routes).

* **Server**: Configures and initializes the [NodeJS](https://nodejs.org/en/) server (created with [ExpressJS](https://expressjs.com/)) to wait for HTTP requests.

* **Services**: Includes all of the backend's additional services. At this point, the only service, Passport, handles user authentication through [Facebook's OAuth](https://developers.facebook.com/docs/facebook-login) or [JWT auth](https://jwt.io/) with email-password pairs.

* **Utilities**: Offers an implementation for commonly used routines shared throughout the backend.

## Configuation

1. If running locally, create a `.env` file that contains all environment variables. Make sure to include an `API_SECRET` variable along with the `MONGODB_URI`, the `FACEBOOK_APP_ID`, and the `FACEBOOK_APP_SECRET`.

2. Run `npm install` from the root folder to install all the required NodeJS modules.

## Execution

1. During development, run `npm run dev`. Otherwise, run `npm start`.

## Testing
A [web client](https://paint-the-town.surge.sh/) helps test all the routes. See `/testing/web_client/README.md` for additional information.
