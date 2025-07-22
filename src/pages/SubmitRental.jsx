import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LocationPicker from '../components/LocationPicker';
import useAutoLocation from '../hooks/useAutoLocation';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/apiBase';

export default function SubmitRental() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    nightly_price: '',
    type: '',
    images: [],
    town: '',
    location: null,
    mode: 'rental',
  });

  const [previews, setPreviews] = useState([]);
  const [successMsg, setSuccessMsg] = useState(''); // CHANGED
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  useAutoLocation(setLat, setLng);

  useEffect(() => {
    if (typeof lat === 'number' && typeof lng === 'number') {
      setForm((f) => ({
        ...f,
        location: { type: 'Point', coordinates: [lng, lat] },
      }));
    }
  }, [lat, lng]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file uploads for images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = [];
    const newImages = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newPreviews.push(reader.result);
        newImages.push(reader.result);
        // Only update state after all files are read
        if (newPreviews.length === files.length) {
          setPreviews((prev) => [...prev, ...newPreviews]);
          setForm((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLocationChange = (loc) => {
    setForm((prev) => ({ ...prev, location: loc }));
  };

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      type: form.type,
      mode: form.mode,
      images: form.images,
      town: form.town,
      lat: form.location?.coordinates?.[1],
      lng: form.location?.coordinates?.[0],
      user_id: userId,
    };

    if (form.mode === 'lodging') {
      payload.nightly_price = Number(form.nightly_price);
    } else {
      payload.price = Number(form.price);
    }

    try {
      await axios.post('http://localhost:5000/api/rentals/submit', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMsg(
        form.mode === 'lodging'
          ? 'Lodging/AirBnB submitted successfully!'
          : 'Rental submitted successfully!'
      );
      setForm({
        title: '',
        description: '',
        price: '',
        nightly_price: '',
        type: '',
        images: [],
        town: '',
        location: null,
        mode: 'rental',
      });
      setPreviews([]);
      // Redirect to landlord dashboard after success (no reload)
      navigate('/LandlordDashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Submission failed');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">List Your Property</h2>
      <p className="mb-6 text-gray-300">
        Fill in the details below to advertise your apartment. Your listing will be visible to all clients once approved.
      </p>

      {successMsg && (
        <div className="mb-4 p-3 bg-green-700 text-white rounded">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 bg-gray-900 text-white rounded"
        />

        <select
          name="mode"
          value={form.mode}
          onChange={handleChange}
          className="w-full p-2 mb-2 rounded"
          required
        >
          <option value="rental">Rental (Monthly)</option>
          <option value="lodging">Lodging / AirBnB (Nightly)</option>
        </select>

        {form.mode === 'rental' && (
          <input
            name="price"
            placeholder="Price per month"
            type="number"
            value={form.price}
            onChange={handleChange}
            className="w-full p-2 mb-2 rounded"
            required
          />
        )}

        {form.mode === 'lodging' && (
          <input
            name="nightly_price"
            placeholder="Nightly Price"
            type="number"
            value={form.nightly_price}
            onChange={handleChange}
            className="w-full p-2 mb-2 rounded"
            required
          />
        )}

        <input
          name="type"
          value={form.type}
          onChange={handleChange}
          placeholder="Type (e.g. Apartment)"
          className="w-full p-2 mb-2 rounded"
          required
        />

        <input
          name="town"
          value={form.town}
          onChange={handleChange}
          placeholder="Town Name"
          className="w-full p-2 mb-2 rounded"
          required
        />

        <input type="file" multiple accept="image/*" onChange={handleImageChange} />

        {previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            {previews.map((preview, index) => (
              <img src={preview} alt="Property" key={index} className="rounded shadow" />
            ))}
          </div>
        )}

        <LocationPicker value={form.location} onChange={handleLocationChange} />

        <button
          type="submit"
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Submit Rental
        </button>
      </form>
    </div>
  );
}