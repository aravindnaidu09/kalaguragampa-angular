export interface Address {
  id?: number;
  fullName?: string;
  phone?: string;
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  isDefault?: boolean;
}

export function deserializeAddress(apiData: any): Address {
  return {
    id: apiData.id, // If the API provides an ID
    fullName: apiData.name,
    street: apiData.address_line_1,
    street2: apiData.address_line_2 || '',
    pincode: apiData.pincode,
    city: apiData.city,
    state: apiData.state,
    country: apiData.country,
    phone: apiData.mobile,
    isDefault: apiData.is_default
  };
}

// ✅ Serialize Frontend Model to API Format
export function serializeAddress(address: Address): any {
  return {
    name: address.fullName,
    address_line_1: address.street,
    address_line_2: address.street2 || '',
    pincode: address.pincode,
    city: address.city,
    state: address.state,
    country: address.country,
    mobile: address.phone,
    is_default: address.isDefault
  };
}

