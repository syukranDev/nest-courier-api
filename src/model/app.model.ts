import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({ tableName: 'shipping_rates', timestamps: true })
export class ShippingRate extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  senderState: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  senderPostcode: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  receiverState: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  receiverPostcode: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  weight: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  data: { courier: string; rate: number }[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: [],
  })
  debug: { courier: string; debugMsg: string }[];
}