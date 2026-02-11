import React from 'react';

const MapComponent = ({ address }) => {
  const defaultSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.066063249392!2d77.3889!3d28.6139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDM2JzUwLjAiTiA3N8KwMjMnMjAuMCJF!5e0!3m2!1sen!2sin!4v1689612345678!5m2!1sen!2sin";
  const mapSrc = address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`
    : defaultSrc;

  return (
    <div className="w-full h-full bg-gray-50">
      <iframe
        src={mapSrc}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Location Map"
      ></iframe>
    </div>
  );
};

export default MapComponent;