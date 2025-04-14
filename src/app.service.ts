import { Injectable , HttpException, HttpStatus} from '@nestjs/common';
import axios from 'axios';
import { debug } from 'console';
import e from 'express';

@Injectable()
export class AppService {
  getConnectedMessage(): { message: string } {
    return { message: "Connected to the server" };
  }

  // processPayloadAndParams(payload: any, params: Record<string, string>): { payload: any; params: Record<string, string> } {
  //   if (!payload && Object.keys(params).length === 0) {
  //     throw new Error('No payload or URL parameters provided');
  //   }
  //   return { payload, params };
  // }

  async fetchShippingRates(payload: { senderState: string, senderPostcode: string; receiverState: string, receiverPostcode: string, weight: string }): Promise<{ data: { courier: string; rate: number }[], debug: { courier: string, debugMsg: string}[] }> {

    let { senderState, senderPostcode, receiverState, receiverPostcode, weight } = payload;
    if (!payload) throw new HttpException('Missing payload', HttpStatus.UNPROCESSABLE_ENTITY)
    if (!senderState)  throw new HttpException('senderState is required', HttpStatus.UNPROCESSABLE_ENTITY)
    if (!senderPostcode)  throw new HttpException('senderPostcode is required', HttpStatus.UNPROCESSABLE_ENTITY)
    if (!receiverState)  throw new HttpException('receiverState is required', HttpStatus.UNPROCESSABLE_ENTITY)
    if (!receiverPostcode)  throw new HttpException('receiverPostcode is required', HttpStatus.UNPROCESSABLE_ENTITY)
    if (!weight) throw new HttpException('weight is required', HttpStatus.UNPROCESSABLE_ENTITY)
    
    const citylinkPayload = new URLSearchParams({
      origin_country: 'MY',
      origin_state: senderState,
      origin_postcode: senderPostcode,
      destination_country: 'MY',
      destination_state: receiverState,
      destination_postcode: receiverState,
      length: '10',
      width: '10',
      height: '10',
      selected_type: '1',
      parcel_weight: weight,
      document_weight: '',
    });

    const jtPayload = new URLSearchParams({
      _token: 'UcAYT3nNJ0Q06ZrrjL3Np8M8y0rRC3nCywtxL3wP', //notedev: csrf token maybe, could be expired so this api always hard to access.
      shipping_rates_type: 'domestic',
      sender_postcode: senderPostcode.toString(),
      receiver_postcode: receiverPostcode.toString(),
      destination_country: 'BWN',
      shipping_type: 'EZ',
      weight: weight.toString(),
      length: '10',
      width: '10',
      height: '10',
      item_value: '',

    });

    const poslajuPayload = {
      country: 'Malaysia',
      weight: parseInt(weight),
      postcodeFrom: senderPostcode,
      postcodeTo: receiverPostcode
    };

    const skynetUrl = `https://skynet.com.my/calculate-domestic-rates?FromPostcode=${senderPostcode}&ToPostcode=${receiverPostcode}&Weight=${weight}&Length=10&Width=10&Height=10&ShipmentType=Parcels`;

    const debugMsg: { courier: string, debugMsg: string}[] = []; //notedev: to store any failed request error messages

    const requests = [
      axios
        .post('https://www.citylinkexpress.com/wp-json/wp/v2/getShippingRate', citylinkPayload, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        .then(res => ({ courier: 'Citylink', rate: res.data.req.data.rate }))
        .catch(e => {
          debugMsg.push({ courier: 'Citylink', debugMsg: e.message });
          return null;
        }),
    
      axios
        .post('https://www.jtexpress.my/shipping-rates', jtPayload, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        .then(res => ({ courier: 'J&T', rate: res.data.req.data.rate }))
        .catch(e => {
          debugMsg.push({ courier: 'J&T', debugMsg: e.message });
          return null;
        }),
    
      axios
        .post('https://www-api.pos.com.my/api/price', poslajuPayload, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then(res => ({ courier: 'Poslaju', rate: parseFloat(res.data[0].totalAmount) }))
        .catch(e => {
          debugMsg.push({ courier: 'Poslaju', debugMsg: e.message });
          return null;
        }),
    
      axios
        .get(skynetUrl)
        .then(res => ({ courier: 'Skynet', rate: res.data.data.Cost }))
        .catch(e => {
          debugMsg.push({ courier: 'Skynet', debugMsg: e.message });
          return null;
        }),
    ];

    const results = await Promise.all(requests);
    const data = results.filter(result => result !== null);

    return { data, debug : debugMsg };
  }
}