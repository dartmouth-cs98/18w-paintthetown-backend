# Paint the Town: Test Web Client
A very simple, minimalistic web client to make test HTTP requests to the API.

## File Structure

Listing of non-standard directories:

```
web_client
│   index.html
│   README.md
│
└───src
    │   index.js
    │   routes.js
    │   style.scss
    │
    └───actions
    │   │   index.js
    │
    └───components
    │   │   app.js
    │   │   buildings.js
    │   │   colors.js
    │   │   error-window.js
    │   │   get-building-info.js
    │   │   new-building.js
    │   │   new-color.js
    │   │   signin.js
    │   │   signup.js
    │   │   update-team-building.js
    │   │   user-data.js
    │   │   users.js
    │
    └───reducers
    │   │   auth-reducer.js
    │   │   building-reducer.js
    │   │   colors-reducer.js
    │   │   index.js
    │   │   teams-reducer.js
    │   │   users-reducer.js
    │
    └───resources
        │
        └───images
            │   bg.jpg
```

## Implementation
### Source

The directories in `/src` include the entire implementation of the web client. Written in ES6 and compiled through [Babel](https://babeljs.io/), the implementation follows the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) and consists of a [ReactJS](https://reactjs.org/) and [Redux](https://redux.js.org/) web client that uses [Axios](https://github.com/axios/axios) to make HTTP requests to the API.

* **Actions**: Action.

* **Components**: Components.

* **Index**: Index.

* **Reducers**: Reducers.

* **Resources**: Resources.

* **Routes**: Routes.

* **Style**: Style.

## Configuation

1. Step 1.

## Execution

1. Step 1.
