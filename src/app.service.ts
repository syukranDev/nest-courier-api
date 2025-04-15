import { Injectable , HttpException, HttpStatus, Inject} from '@nestjs/common';
import axios from 'axios';
import { Sequelize, Op } from 'sequelize';
import { Sequelize as SequelizeTs } from 'sequelize-typescript';
import { ShippingRate } from './model/app.model';
import { Token } from './model/token.model';
import * as crypto from 'crypto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AppService {
  constructor(
    private sequelize: SequelizeTs,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  //API 1 - test pls ignore
  getConnectedMessage(): { message: string } {
    this.logger.info('Health check endpoint accessed');
    return { message: "Connected to the server" };
  }

  //API 3 - generate token
  async generateToken(): Promise<{ token: string; expiresAt: string }> {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await Token.create({
        token,
        expiresAt,
      });

      this.logger.info('Token generated successfully', { token, expiresAt });
      return { token, expiresAt: expiresAt.toISOString() };
    } catch (error) {
      this.logger.error('Failed to generate token', { error: error.message });
      throw new HttpException('Failed to generate token', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //API 4 - actual shipping rates API
  async fetchShippingRates(payload: { senderState: string, senderPostcode: string; receiverState: string, receiverPostcode: string, weight: string }): Promise<{ data: { courier: string; rate: number }[], debug: { courier: string, debugMsg: string}[] }> {
    try {
      this.logger.info('Fetching shipping rates', { payload });

      let { senderState, senderPostcode, receiverState, receiverPostcode, weight } = payload;
      if (!payload) throw new HttpException('Missing payload', HttpStatus.UNPROCESSABLE_ENTITY)
      if (!senderState)  throw new HttpException('senderState is required', HttpStatus.UNPROCESSABLE_ENTITY)
      if (!senderPostcode)  throw new HttpException('senderPostcode is required', HttpStatus.UNPROCESSABLE_ENTITY)
      if (!receiverState)  throw new HttpException('receiverState is required', HttpStatus.UNPROCESSABLE_ENTITY)
      if (!receiverPostcode)  throw new HttpException('receiverPostcode is required', HttpStatus.UNPROCESSABLE_ENTITY)
      if (!weight) throw new HttpException('weight is required', HttpStatus.UNPROCESSABLE_ENTITY)
      
      const citylinkPayload = new URLSearchParams({
        origin_country: 'MY',
        origin_state: senderState.toString(),
        origin_postcode: senderPostcode.toString(),
        destination_country: 'MY',
        destination_state: receiverState.toString(),
        destination_postcode: receiverPostcode.toString(),
        length: '10',
        width: '10',
        height: '10',
        selected_type: '1',
        parcel_weight: weight.toString(),
        document_weight: '',
      });
  
      const jtPayload = new URLSearchParams({
        _token: 'UcAYT3nNJ0Q06ZrrjL3Np8M8y0rRC3nCywtxL3wP', //notedev: csrf token maybe, could be expired so this api always hard to access.
        shipping_rates_type: 'domestic',
        sender_postcode: senderPostcode,
        receiver_postcode: receiverPostcode,
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
        weight: parseFloat(weight),
        postcodeFrom: senderPostcode,
        postcodeTo: receiverPostcode
      };

      const trackingMalaysiaCompilationPayload = {
        from_country: 'MY',
        from_postcode: senderPostcode,
        group_id: 1,
        height: '10',
        length: '10',
        width: '10',
        to_country: "MY",
        to_postcode: receiverPostcode,
        type: "1",
        weight: weight.toString(),
      }

      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);
  
      const cachedResult = await ShippingRate.findOne({
        where: {
          senderState,
          senderPostcode,
          receiverState,
          receiverPostcode,
          weight: weight.toString(),
          createdAt: {
            [Op.gte]: oneDayAgo,
          },
        },
      },);
  
      if (cachedResult) {
        console.log('Using cached result...')
        this.logger.info('Shipping rates fetched successfully - using cached result', {});
        return { data: cachedResult.dataValues.data, debug: cachedResult.dataValues.debug };
      }
  
      console.log('Create new entry..')
  
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

          axios
            .post('https://seller.tracking.my/api/services', trackingMalaysiaCompilationPayload, {
              headers: { 'Content-Type': 'application/json' },
            })
            .then(res => {
              console.log(res.data.services);
              const filteredCouriers = res.data.services
                .filter((service: any) => 
                  service.courier_title !== 'J&T Express' && 
                  service.courier_title !== 'Pos Malaysia'
                )
                .reduce((acc, service: any) => {
                  const courierTitle = service.courier_title.trim().toLowerCase();
                  if (!acc.some(item => item.courier.trim().toLowerCase() === courierTitle)) {
                    acc.push({
                      courier: service.courier_title,
                      price: service.price,
                    });
                  }
                  return acc;
                }, []);
          
              console.log(filteredCouriers);
              return filteredCouriers;
            })
            .catch(e => {
              debugMsg.push({ courier: 'Tracking Malaysia (Compilation of Couriers)', debugMsg: e.message });
              return null;
            })
      ];
  
      const results = await Promise.all(requests);
      const data = results.filter(result => result !== null).flat();

      await ShippingRate.create({
        senderState,
        senderPostcode,
        receiverState,
        receiverPostcode,
        weight,
        data,
        debug: debugMsg,
      });
  
      this.logger.info('Shipping rates fetched successfully - calling new external APIs');
      return { data, debug : debugMsg };
    }
    catch (error) {
      if (error instanceof HttpException) { //notedev: ensure final error is thrown from the API logic if hitting 422
        this.logger.error('API Error', {error});
        throw error;
      }

      this.logger.error('Failed to fetch shipping rates', { error: error.message });
      throw new HttpException('Failed to fetch shipping rates', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}