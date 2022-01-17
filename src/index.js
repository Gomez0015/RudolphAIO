import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {   
  BrowserRouter,
  Routes,
  Route, 
  } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

ReactDOM.render(
  <BrowserRouter>
      <CookiesProvider>
        <App />
      </CookiesProvider>
  </BrowserRouter>,
  document.getElementById('root')
);
