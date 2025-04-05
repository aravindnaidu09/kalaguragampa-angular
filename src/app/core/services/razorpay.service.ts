import { Injectable } from '@angular/core';
import { RazorpayOrder } from '../models/razorpay.model';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {

  constructor() { }

  openCheckout(order: RazorpayOrder, userInfo: { name: string; email: string; contact: string }, onSuccess: (response: any) => void): void {
    const options: any = {
      key: 'rzp_test_3rTiR8mXkjNSux', // Or inject from env
      amount: order.amount,
      currency: order.currency,
      name: 'Kalagura Gampa',
      description: 'Order Payment',
      order_id: order.id,
      handler: (response: any) => {
        onSuccess(response); // Pass response back to component
      },
      prefill: {
        name: userInfo.name,
        email: userInfo.email,
        contact: userInfo.contact
      },
      theme: {
        color: '#682f12'
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }
}
