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
The directories in `/src` include the entire implementation of the web client. Written in ES6 and compiled through [Babel](https://babeljs.io/), the implementation follows the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) and consists of a [ReactJS](https://reactjs.org/) and [Redux](https://redux.js.org/) web client that uses [Axios](https://github.com/axios/axios) to make HTTP requests to the API.

* **Actions**: Make requests to the server via [axios](https://github.com/axios/axios) in order to test all routes and prepare/parse the response for the reducers. The requests can only be GET or POST as required by Unity. The actions are organized by model (e.g. Building, Team):

```
index.js
│
└───Buildings
│   │
│   └───GET
│   │   │   getBuildingIDs
│   │   │   getBuildingInfo
│   │   │   getBuildingsBbox
│   │   
│   └───POST
│       │   newBuildings
│       │   updateTeamBuilding
│       
└───Cities
│   │
│   └───GET
│   │   │   getCityNames
│   │   
│   └───POST
│       │   addCity
│
└───Colors
│   │
│   └───GET
│   │   │   getColorData
│   │   │   getColorIDs
│   │   
│   └───POST
│       │   newColor
│
└───Particles
│   │
│   └───GET
│   │   │   getParticles
│   │   
│   └───POST
│       │   addParticles
│
└───Reset
│   │   
│   └───POST
│       │   resetDB
│
└───Teams
│   │
│   └───GET
│   │   │   getTeamIDs
│   │   │   getTeamInfo
│   │   
│   └───POST
│       │   assignUserToTeam
│
└───Users
    │
    └───GET
    │   │   getUserData
    │   │   getTeamInfo
    │   
    └───POST
        │   signinUser
        │   signupUser
```

* **Components**: The React components that make up the web client's views and make up the workflow of the app. Resulting React-component tree:

```
App
│
└───Buildings
│   │   GetBuildingInfo
│   │   GetBuildingsBbox
│   │   NewBuilding
│   │   UpdateTeamBuilding
│
└───Cities
│   │   AddCity
│
└───Colors
│   │   GetColorData
│   │   NewColor
│
└───Particles
│   │   AddParticles
│   │   GetParticles
│
└───Reset
│
└───Teams
│   │   AssignUserToTeam
│   │   GetTeamInfo
│
└───Users
    │   SignIn
    │   SignUp
    │   UpdateUserData
    │   UserData
```

* **Index**: Create the React DOM, apply middleware, and link components with reducers. Contains the `ROOT_URL` variable that determines whether to run the server with a local or a remote instance of MongoDB.

* **Reducers**: Process and reformat responses from the server and pass them to the components as props via [Redux](https://redux.js.org/). There is one reducer per model, and all of them converge with the master reducer in `reducers/index.js`.

* **Resources**: Static data files (e.g. .jpg).

* **Routes**: Define URL routing for the client (currently only one route in place).

* **Style**: Determine CSS styling using [SASS](https://sass-lang.com/).

## Configuation

1. Go to `src/index.js` and set the constant `ROOT_URL` to either 'https://paint-the-town.herokuapp.com/api' if running the web client with the *remote* MongoDB instance, 'http://localhost:9090/api' otherwise.

2. Run `npm install` from the root folder (i.e. `testing/web_client/`) to install all the required NodeJS modules.

## Execution

1. Run `npm start` from the root folder.
