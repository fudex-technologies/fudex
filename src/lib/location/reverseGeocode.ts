export interface GeoResult {
    lat: number;
    lng: number;
    formattedAddress: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    raw?: any; // For debugging purposes
}

/**
 * Reverse geocodes coordinates to a human-readable address using OpenStreetMap Nominatim.
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns A promise that resolves to a GeoResult object.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeoResult> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch address');
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        const address = data.address || {};
        const formattedAddress = data.display_name || `${lat}, ${lng}`;
        const result: GeoResult = {
            lat,
            lng,
            formattedAddress,
            city: address.city || address.town || address.village || address.state,
            state: address.state,
            country: address.country,
            postalCode: address.postcode,
            raw: data,
        };

        return result;
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        throw new Error("Could not resolve address from coordinates.");
    }
}
