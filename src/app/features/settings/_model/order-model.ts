export interface Order {
  id: number;
  date: string;
  total: number;
  shipTo: string;
  deliveryDate: string;
  status: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
    image: string
  }[];
}
