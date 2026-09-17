import { calculateDistanceKm } from '../controllers/warehouseController.js';

/**
 * Optimizes delivery route from a starting origin (Warehouse or Agent Location)
 * and sequences orders stop-by-stop toward an optional rider-selected end location,
 * ensuring closer areas (e.g. Etukuru) appear first and progression flows naturally.
 *
 * @param {Array} orders - Array of Mongoose order documents or plain objects
 * @param {Object} startLocation - { lat: number, lng: number, name?: string }
 * @param {Object} endLocation - { lat: number, lng: number, name?: string }
 * @returns {Array} - Geographically sequenced orders with stop metadata
 */
export const optimizeDeliveryRoute = (orders = [], startLocation = null, endLocation = null) => {
  if (!orders || orders.length === 0) return [];

  // Default starting origin to Guntur Hub (lat: 16.3067, lng: 80.4365) if unspecified
  const origin = {
    lat: startLocation?.lat || 16.3067,
    lng: startLocation?.lng || 80.4365,
    name: startLocation?.name || 'Warehouse Dispatch Dock'
  };

  const end = endLocation?.lat && endLocation?.lng ? {
    lat: endLocation.lat,
    lng: endLocation.lng,
    name: endLocation.name || 'Return Hub'
  } : null;

  // Convert to plain objects if needed
  const unrouted = orders.map(o => {
    const raw = typeof o.toObject === 'function' ? o.toObject() : { ...o };
    const coords = raw.deliveryAddress?.coordinates || { lat: 16.3067, lng: 80.4365 };
    const distFromOrigin = calculateDistanceKm(origin.lat, origin.lng, coords.lat, coords.lng);
    const distToEnd = end ? calculateDistanceKm(coords.lat, coords.lng, end.lat, end.lng) : 0;
    return {
      ...raw,
      _coords: coords,
      _distFromOrigin: distFromOrigin,
      _distToEnd: distToEnd
    };
  });

  // Nearest-Neighbor with End-Location Directional Biasing
  const sequenced = [];
  let currentLat = origin.lat;
  let currentLng = origin.lng;
  let stopNumber = 1;
  let totalDistanceKm = 0;

  while (unrouted.length > 0) {
    let bestIndex = 0;
    let minCost = Infinity;

    for (let i = 0; i < unrouted.length; i++) {
      const d = calculateDistanceKm(currentLat, currentLng, unrouted[i]._coords.lat, unrouted[i]._coords.lng);
      // Cost prioritizes proximity to current location while progressing toward chosen end destination
      let cost = d;
      if (end && unrouted.length > 1) {
        cost = d + unrouted[i]._distToEnd * 0.3;
      }
      if (cost < minCost) {
        minCost = cost;
        bestIndex = i;
      }
    }

    const [nextStop] = unrouted.splice(bestIndex, 1);
    const stopDistance = Math.round(calculateDistanceKm(currentLat, currentLng, nextStop._coords.lat, nextStop._coords.lng) * 10) / 10;
    totalDistanceKm = Math.round((totalDistanceKm + stopDistance) * 10) / 10;

    // Detect area / locality name from city or street
    const areaName = nextStop.deliveryAddress?.city || nextStop.deliveryAddress?.street?.split(',')[0] || 'Local Area';

    sequenced.push({
      ...nextStop,
      routeSequence: {
        stopNumber,
        areaName,
        distanceFromLastStopKm: stopDistance,
        totalDistanceFromOriginKm: nextStop._distFromOrigin,
        cumulativeRouteDistanceKm: totalDistanceKm,
        endDestination: end?.name || 'Final Stop'
      }
    });

    currentLat = nextStop._coords.lat;
    currentLng = nextStop._coords.lng;
    stopNumber++;
  }

  return sequenced;
};

