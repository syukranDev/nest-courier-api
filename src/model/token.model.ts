import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({ tableName: 'tokens', timestamps: true })
export class Token extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  token: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt: Date;
}