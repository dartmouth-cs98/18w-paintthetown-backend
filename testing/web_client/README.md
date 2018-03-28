# Paint the Town: Test Web Client

![ReactJS Logo](https://www.shareicon.net/data/128x128/2016/07/08/117367_logo_512x512.png)
![Redux Logo](https://blobscdn.gitbook.com/v0/b/gitbook-28427.appspot.com/o/spaces%2F-L5K1I1WsuQMZ8ecEuWg%2Favatar.png?generation=1518623866348435&alt=media)
![Babel Logo](https://cdn.worldvectorlogo.com/logos/babel-10.svg)
![Webpack Logo](https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Webpack.png/536px-Webpack.png)

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
