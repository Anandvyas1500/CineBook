import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CityProvider } from './context/CityContext';
import { BookingProvider } from './context/BookingContext';
import { UiProvider } from './context/UiContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UiProvider>
        <AuthProvider>
          <CityProvider>
            <BookingProvider>
              <App />
            </BookingProvider>
          </CityProvider>
        </AuthProvider>
      </UiProvider>
    </BrowserRouter>
  </React.StrictMode>
);
