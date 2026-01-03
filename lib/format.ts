// lib/format.ts

export const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getPlaceImage = (city: string, country: string = "") => {
  const destination = city?.toLowerCase().trim() || "travel";

  // 1. DIRECT PRODUCTION LINKS (Will never be blank)
  const curated: Record<string, string> = {
    'kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
    'santorini': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
    'swiss alps': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
    'bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
    'lisbon': 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1350&q=80', // Fixed Lisbon
    'tokyo': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
    'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
    'new york city': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9'
  };

  if (curated[destination]) {
    // Add professional compression and cropping parameters
    return `${curated[destination]}?q=80&w=1200&auto=format&fit=crop`;
  }

  // 2. FALLBACK (Uses a high-speed keyword search if not in the list above)
  return `https://loremflickr.com/1200/800/${destination.replace(/\s+/g, ',')},city,landmark/all`;
};