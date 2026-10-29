import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Check, Film } from 'lucide-react';
import { useCity } from '../context/CityContext';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';

export const SelectCityPage = () => {
  const { selectedCity, changeCity, cityDetails, loading, refreshCities } = useCity();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Re-fetch every time this page is opened so newly added cities appear immediately
  useEffect(() => {
    refreshCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cities = cityDetails.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()));

  const choose = (name) => {
    changeCity(name);
    navigate('/');
  };


  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <PageHeader
        eyebrow="Where are you watching?"
        title="Pick your city"
        actions={
          <div className="relative w-full sm:w-72">
            <label htmlFor="city-search" className="sr-only">Search cities</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none" />
            <input id="city-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your city" className="input pl-11" />
          </div>
        }
      >
        Showtimes, cinemas and prices follow the city you choose. You can change it any time from the top bar.
      </PageHeader>

      {cities.length === 0 && !loading ? (
        <EmptyState icon={Search} title="No city matches">Try a different spelling, or clear the search box.</EmptyState>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {cities.map((city) => {
            const active = city.name === selectedCity;
            return (
              <li key={city.name}>
                <button
                  type="button"
                  onClick={() => choose(city.name)}
                  aria-pressed={active}
                  className={`group relative w-full h-40 overflow-hidden rounded-2xl border p-4 text-left transition-all hover:-translate-y-1 ${
                    active ? 'border-brand bg-brand/10 shadow-glow-sm' : 'border-line bg-raised hover:border-brand/40'
                  }`}
                >
                  <span aria-hidden="true" className="display absolute -right-1 -bottom-4 text-[7rem] leading-none text-white/[0.05] group-hover:text-brand/10 transition-colors select-none">
                    {city.name.charAt(0)}
                  </span>
                  {active && (
                    <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-brand text-on-brand flex items-center justify-center">
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </span>
                  )}
                  <span className="relative flex h-full flex-col justify-end">
                    <span className="display text-3xl text-ink group-hover:text-brand transition-colors">{city.name}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                      <Film className="w-3.5 h-3.5 text-brand" />
                      {city.theatresCount > 0 ? `${city.theatresCount} ${city.theatresCount === 1 ? 'cinema' : 'cinemas'}` : 'Cinemas'}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SelectCityPage;
