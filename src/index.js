import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import King from './King';
import {   
  BrowserRouter,
  Routes,
  Route, 
  } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

ReactDOM.render(
  <BrowserRouter>
      <CookiesProvider>
        <King />
      </CookiesProvider>
  </BrowserRouter>,
  document.getElementById('root')
);
