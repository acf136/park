/**
 * User: User logged to app
 *
 * Every User is identified uniquely by idUser
 */
export interface IUser {
    name: string;
    surname: string;
    email: string;
    envioDisponibilidad: boolean;
    envioInformes: boolean ;
}

export enum PlaceSize { moto = 1, small, normal, doble };
/**
 * Place : Place inside a Parking
 *
 * Every place is identified uniquely by  coordX+'-'+coordY (p.e. 'A-28') ,  inside every parking
 */
 export interface IPlace {
  coordX: string;
  coordY: string;
  size: PlaceSize;
  occupied: boolean;
  outOfService: boolean;
}

export type PlaceCapacity = { size: PlaceSize ; numOfPlaces: number } ;
/**
 * Park: Parking con localización y plazas de varios tamaños
 *
 * Every Parking is identified uniquely by  idParking
 */
export interface IParking{
  idParking: number;
  id: string,
  name: string;
  address: string;
  zipCode: string;
  lat: string;
  long: string;
  capacity: PlaceCapacity[] ;
  places: IPlace[] ;  // grid of IPlace ot this parking
}

  //TODO: coordinates: { "lat": number, "long": number },

/**
 * UserParking: Relación entre IUser-IParking
 *
 * Every UserParking is identified uniquely by  idUser + idParking + coordX + coordY
 */
export interface IUserParking{
  idUser: string;
  idParking: string;
}

export interface IParks{
  idUser: string;
  idParking: string;
  datePark: Date;     // Last date of parking in a place
  dateLeave: Date;    // Last date the user leave the place
}