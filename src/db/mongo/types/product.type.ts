import { IBaseDb } from '../../types/base-db.type';

export interface IProduct extends IBaseDb {
    _id: string;
    displayName: string;
    totalRating: number;
    price: number;
}