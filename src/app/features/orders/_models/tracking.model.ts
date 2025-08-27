export interface ShiprocketTrackApi {
  statusCode: number;
  message: string;
  data: {
    delivery_id: number;
    status: string;                       // e.g., "Pending", "In Transit", "DRC"
    etd?: string | null;                  // "YYYY-MM-DD HH:mm:ss"
    tracking_history?: Array<{
      date?: string;                      // "YYYY-MM-DD HH:mm:ss"
      status?: string;                    // "DRC", "In Transit", etc.
      activity?: string;                  // "Data Received", ...
      location?: string | null;
      ['sr-status-label']?: string | null;
    }>;
    track_url?: string | null;
  } | null;
}

/** Canonical UI model used by components */
export interface TrackingVM {
  deliveryId: number;
  status: string;               // canonical friendly status
  etd?: string | null;          // ISO or backend string (we won't transform here)
  trackUrl?: string | null;
  trackingHistory: Array<{
    timestamp?: string | null;  // raw string, formatted by pipe in template
    status?: string | null;
    description?: string | null;
    location?: string | null;
  }>;
}

/** status normalizer – keep simple; extend if you want */
export function normalizeStatus(s: string | undefined | null): string {
  const v = (s || '').toUpperCase();
  if (['DELIVERED'].includes(v)) return 'Delivered';
  if (['OUT FOR DELIVERY', 'OFD'].includes(v)) return 'Out for Delivery';
  if (['IN TRANSIT', 'TRANSIT'].includes(v)) return 'In Transit';
  if (['PICKED UP', 'PICKUP'].includes(v)) return 'Picked Up';
  if (['RTO', 'RTO DELIVERED', 'CANCELLED', 'CANCELED'].includes(v)) return 'Returned/Cancelled';
  if (['DRC', 'DATA RECEIVED', 'PENDING', 'NEW'].includes(v)) return 'Pending';
  return s || 'Unknown';
}

/** map backend -> UI VM safely */
export function toTrackingVM(api: ShiprocketTrackApi): TrackingVM | null {
  if (!api || api.statusCode !== 200 || !api.data) return null;
  const d = api.data;
  const history = Array.isArray(d.tracking_history) ? d.tracking_history : [];

  return {
    deliveryId: Number(d.delivery_id),
    status: normalizeStatus(d.status),
    etd: d.etd ?? null,
    trackUrl: d.track_url ?? null,
    trackingHistory: history.map(h => ({
      timestamp: h?.date ?? null,
      status: h?.status ?? null,
      description: h?.activity ?? null,
      location: h?.location ?? null
    }))
    // Note: sort is done in selector to avoid mutating source
  };
}
