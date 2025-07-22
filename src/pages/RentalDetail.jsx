import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Chat from '../components/Chat';
import MapComponent from '../components/MapComponent';
import LocationPicker from '../components/LocationPicker';
import { API_URL } from '../utils/apiBase';

export default function RentalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [rental, setRental] = useState(null);
  const [landlord, setLandlord] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const decoded = token ? JSON.parse(atob(token.split('.')[0])) : null;

  // Load rental details on mount
  useEffect(() => {
    const fetchRental = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/rentals/${id}`);
        setRental(res.data);

        // Fetch landlord details if needed
        if (res.data.user_id) {
          const userRes = await axios.get(`http://localhost:3000/api/users/${res.data.user_id}`);
          setLandlord(userRes.data);
        }
      } catch (err) {
        console.error('Failed to load rental:', err.message);
        navigate('/dashboard');
      }
    };

    fetchRental();
  }, [id]);

  // For landlord: fetch clients who have messaged about this rental
  useEffect(() => {
    const fetchClients = async () => {
      if (!rental || !decoded || decoded.id !== rental.user_id) return;
      try {
        const res = await axios.get(`http://localhost:3000/api/chat/messages/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Get unique client IDs (exclude landlord)
        const clientIds = [
          ...new Set(
            res.data
              .map(msg => (msg.sender_id !== rental.user_id ? msg.sender_id : msg.receiver_id !== rental.user_id ? msg.receiver_id : null))
              .filter(id => id && id !== rental.user_id)
          ),
        ];
        // Fetch client details
        const clientDetails = await Promise.all(
          clientIds.map(cid =>
            axios.get(`http://localhost:3000/api/users/${cid}`).then(r => r.data)
          )
        );
        setClients(clientDetails);
      } catch (err) {
        // ignore
      }
    };
    fetchClients();
  }, [rental, decoded, id, token]);

  const [lat, setLat] = useState(rental?.location?.coordinates?.[1] || null);
  const [lng, setLng] = useState(rental?.location?.coordinates?.[0] || null);

  if (!rental) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Rental Title */}
      <h2 className="text-3xl font-bold mb-4">{rental.title}</h2>

      {/* Rental Images with Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {rental.images.map((img, index) => (
          <div key={index} className="rounded overflow-hidden shadow">
            <img src={img} alt={`Rental ${index + 1}`} className="w-full h-64 object-cover" />
          </div>
        ))}
      </div>
      <div className="mb-6 h-64 md:h-96 w-full">
        <MapComponent rentals={[rental]} height="h-64 md:h-96" />
      </div>

      {/* Rental Description & Info */}
      <div className="mb-8">
        <p className="text-gray-300 mb-4">{rental.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-green-700 text-white px-3 py-1 rounded">KES {rental.price}/month</span>
          <span className="bg-blue-700 text-white px-3 py-1 rounded">{rental.type}</span>
          <span className="bg-yellow-700 text-white px-3 py-1 rounded">
            {rental.status || 'available'}
          </span>
        </div>

        {rental.location && (
          <div className="mt-4">
            <strong>Location:</strong>
            <p>{rental.town || 'Nairobi'}</p>
          </div>
        )}
      </div>
      {/* Chat Section */}
      <section className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Contact Landlord</h3>
        {decoded && decoded.id !== rental.user_id ? (
          <Chat rentalId={rental.id} userId={decoded.id} landlordId={rental.user_id} />
        ) : (
          <>
            <p className="text-gray-500 mb-2">You are the owner. Select a client to reply:</p>
            {clients.length === 0 ? (
              <p className="text-gray-400">No client messages yet.</p>
            ) : (
              <div className="mb-4">
                <ul className="flex flex-wrap gap-2">
                  {clients.map(client => (
                    <li key={client.id}>
                      <button
                        className={`px-3 py-1 rounded ${selectedClient && selectedClient.id === client.id ? 'bg-blue-700' : 'bg-gray-700'} text-white`}
                        onClick={() => setSelectedClient(client)}
                      >
                        {client.full_name || client.email || client.phone}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedClient && (
              <Chat
                rentalId={rental.id}
                userId={decoded.id}
                landlordId={rental.user_id}
                clientId={selectedClient.id}
                isLandlord={true}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}