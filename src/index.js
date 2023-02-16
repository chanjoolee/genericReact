import React from 'react';
import ReactDOM , { render } from 'react-dom';
import './index.css';
import App from './App';
import createStore  from './store/store';
// import store  from './store/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';

let indexstore = null;
createStore().then((store) => {
    indexstore = store;
    ReactDOM.render(
      <React.StrictMode>
        <Provider store={indexstore}>
          <App />
        </Provider>
      </React.StrictMode>
      ,document.getElementById('root')
    );
});

// ReactDOM.render(
//   <React.StrictMode>
//     <Provider store={createStore}>
//       <App />
//     </Provider>
//   </React.StrictMode>
//   ,document.getElementById('root')
// );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
