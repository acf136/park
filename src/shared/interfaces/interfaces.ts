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
  id?: string;
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
  idUser: string;    // external key to IParking.id Firestores key
  idParking: string; // external key to IUser.id Firestore key
}
/**
 * IParks: Historial de aparcamientos por usuario/parking/plaza
 */
export interface IParks{
  idUser: string;     // id de Firebase correspondiente a un usuario registrado de la colección User
  idParking: string;  // id de Firebase correspondiente a un elem. de la colección Parking
  coordX: string;  // p.e. C
  coordY: string;  // p.e. 1
  datePark: Date;     // Last date of parking in a place , p.e. 20212508 12:37
  dateLeave: Date;    // Last date the user leave the place, p.e 0000000 0000
}

/**
 * INotifDisponibilidad: Ultima plaza ocupada para la que el usuario desea recibir notificaciones
 *    Se registra al iniciar la aplicación si el usuario tiene IUser.envioDisponibilidad === true
 *
 * Las notificaciones las envía el server node a los users de esta colección para los que dateLeave esté informada
 * *  mediante polling (cada 3 min p.e.)
 *  También tiene que haver un registrationToken (vacío si no registrado)
 *  Si el user no quiere envio de disponibilidad idParking,coordX,coordy deben estar vacíos (set by userConfig)
 *  DateLeave se informa al aparcar (scanQR)
 */
export interface INotifDisponibilidad{
  idUser: string;             // id de Firebase correspondiente a un usuario registrado de la colección User
  registrationToken: string;  // Token recibido en el registro  . . .PushNotifications.addListener('registration', (token:Token)
  idParking: string;  // Parking para el que se quiere ser notificado de que queda libre la plaza
  coordX: string;  // Plaza objeto de seguimiento
  coordY: string;  //
  dateLeave: Date; // Momento de la liberación
}
