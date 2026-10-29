import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { theatreService } from '../services/theatreService';

import { apiRequest } from '../services/api';

const CityContext = createContext(null);

const FALLBACK = ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'];

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(
    () => localStorage.getItem('cinebook_city') || 'Mumbai'
  );
  const [cityDetails, setCityDetails] = useState(
    FALLBACK.map((name) => ({ name, theatresCount: 0 }))
  );
  const [loading, setLoading] = useState(true);

  /**
   * Fetches the latest city list from the server and updates state.
   * Exposed via context so any component (e.g. SelectCityPage) can call it
   * on mount to pick up cities that were added after the app first loaded.
   */
  const refreshCities = useCallback(async () => {
    setLoading(true);
    try {
      let data = null;
      try {
        data = await theatreService.getCities();
      } catch {
        // Fallback to legacy endpoint if backend hasn't reloaded /cities
        data = await apiRequest('/theatres/cities').catch(() => null);
      }
      if (data) {
        const details =
          data.cityDetails?.length > 0
            ? data.cityDetails
            : (data.cities || []).map((name) => ({ name, theatresCount: 0 }));
        if (details.length > 0) {
          setCityDetails(details);
          // If the remembered city was removed, fall back to the first available one
          setSelectedCity((current) =>
            details.some((c) => c.name === current) ? current : details[0].name
          );
        }
      }
    } catch (err) {
      console.warn('Could not fetch cities, using defaults:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on initial mount and listen for real-time changes
  useEffect(() => {
    refreshCities();

    const handleUpdate = () => refreshCities();
    window.addEventListener('cinebook:cities-changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('cinebook:cities-changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refreshCities]);

  const changeCity = (newCity) => {
    setSelectedCity(newCity);
    localStorage.setItem('cinebook_city', newCity);
  };

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        changeCity,
        cities: cityDetails.map((c) => c.name),
        cityDetails,
        loading,
        refreshCities
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) throw new Error('useCity must be used within a CityProvider');
  return context;
};
