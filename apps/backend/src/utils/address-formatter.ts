export interface StructuredAddress {
  governorate: string;
  city: string;
  area: string;
  street: string;
  buildingNumber: string;
  apartmentNumber?: string | null;
  floor?: string | null;
  landmark?: string | null;
  deliveryNotes?: string | null;
}

export function formatFullAddress(data: StructuredAddress): string {
  const parts = [
    `Building ${data.buildingNumber}`,
    data.street,
    data.area,
    data.city,
    data.governorate,
  ];

  let address = parts.filter(Boolean).join(', ');

  if (data.floor || data.apartmentNumber) {
    const unitParts = [];
    if (data.floor) unitParts.push(`Floor ${data.floor}`);
    if (data.apartmentNumber) unitParts.push(`Apt ${data.apartmentNumber}`);
    address += ` (${unitParts.join(', ')})`;
  }

  if (data.landmark) {
    address += ` - Near ${data.landmark}`;
  }

  return address;
}
