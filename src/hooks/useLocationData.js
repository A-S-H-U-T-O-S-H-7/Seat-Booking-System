import { useState, useEffect } from 'react';
import { API_KEY } from '@/utils/delegatePricing';

export const useLocationData = (formData) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState({
    countries: false,
    states: false,
    cities: false
  });

  // Fetch countries on mount
  useEffect(() => {
    setLoading(prev => ({ ...prev, countries: true }));
    fetch("https://api.countrystatecity.in/v1/countries", {
      headers: { "X-CSCAPI-KEY": API_KEY },
    })
      .then((res) => res.json())
      .then((data) => {
        setCountries(data || []);
        setLoading(prev => ({ ...prev, countries: false }));
      })
      .catch((err) => {
        console.error("Failed to fetch countries:", err);
        setLoading(prev => ({ ...prev, countries: false }));
      });
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (!formData.country) {
      setStates([]);
      setCities([]);
      return;
    }
    
    const selectedCountry = countries.find((c) => c.name === formData.country);
    if (!selectedCountry) return;

    setLoading(prev => ({ ...prev, states: true }));
    fetch(`https://api.countrystatecity.in/v1/countries/${selectedCountry.iso2}/states`, {
      headers: { "X-CSCAPI-KEY": API_KEY },
    })
      .then((res) => res.json())
      .then((data) => {
        setStates(data || []);
        setLoading(prev => ({ ...prev, states: false }));
      })
      .catch((err) => {
        console.error("Failed to fetch states:", err);
        setStates([]);
        setLoading(prev => ({ ...prev, states: false }));
      });
    
    setCities([]);
  }, [formData.country, countries]);

  // Fetch cities when state changes
  useEffect(() => {
    if (!formData.state || !formData.country) {
      setCities([]);
      return;
    }
    
    const selectedCountry = countries.find((c) => c.name === formData.country);
    const selectedState = states.find((s) => s.name === formData.state);
    if (!selectedCountry || !selectedState) return;

    setLoading(prev => ({ ...prev, cities: true }));
    fetch(`https://api.countrystatecity.in/v1/countries/${selectedCountry.iso2}/states/${selectedState.iso2}/cities`, {
      headers: { "X-CSCAPI-KEY": API_KEY },
    })
      .then((res) => res.json())
      .then((data) => {
        setCities(data || []);
        setLoading(prev => ({ ...prev, cities: false }));
      })
      .catch((err) => {
        console.error("Failed to fetch cities:", err);
        setCities([]);
        setLoading(prev => ({ ...prev, cities: false }));
      });
  }, [formData.state, formData.country, countries, states]);

  return {
    countries,
    states,
    cities,
    loading
  };
};