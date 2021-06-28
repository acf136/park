/**
 * User: User logged to app
 *
 * Every User is identified uniquely by idUser
 */
export interface IUser {
    //idUser: number;
    name: string;
    surname: string;
    email: string;
    password: string;
    // envioDisponibilidad: boolean;
    // envioInformes: boolean ;
}
/**
 * Park: Parking con localización y plazas de varios tamaños
 *
 * Every Parking is identified uniquely by  idParking
 */
enum PlaceSize { small = 1, medium, large };
type PlaceCapacity = { size: PlaceSize ; numOfPlaces: number } ;

export interface IParking{
  idParking: number;
  name: string;
  address: string;
  zipCode: string;
  // lat: string;
  // long: string;
  coordinates: { "lat": number, "long": number },
  //capacity: PlaceCapacity[] ;
}
/**
 * Place : Place inside a Parking
 *
 * Every place is identified uniquely by  idParking + coordX + coordY
 */
export interface IPlace {
  idParking: number;
  coordX: string;
  coordY: string;
  size: PlaceSize;
  occupied: boolean;
  outOfService: boolean;
}

/**
 * UserParking: Relación entre IUser-IParking
 *
 * Every UserParking is identified uniquely by  idUser + idParking + coordX + coordY
 */
export interface IUserParking{
  idUser: number;
  idParking: number;
  coordX: string;
  coordY: string;
  datePark: Date;     // Last date of parking in a place
  dateLeave: Date;    // Last date the user leave the place
}




// [
//   { 
//     "idParking": 1,
//     "name": "BSM Estació Barcelona - Nord",
//     "address": "Barcelona, Carrer Ali Bei, 54", 
//     "zipCode": 12345,
//     "coordinates": 
//     {
//         "latitud": 41.39378,
//         "longitud": 2.18155
//     },
//     "full": false,
//     "places": 
//     [
//         {
//             "name": "A1",
//             "status": 0
//         },
//         {
//             "name": "A2",
//             "status": 0
//         },
//         {
//             "name": "A3",
//             "status": 1
//         },
//         {
//             "name": "B1",
//             "status": 0
//         },
//         {
//             "name": "B2",
//             "status": 1
//         },
//         {
//             "name": "B3",
//             "status": 0
//         }
//     ]
//   }, 
//   { 
//     "id": 2,
//     "name": "Parking Saba, Plaça Catalunya",
//     "location": "Barcelona, Plaça Catalunya", 
//     "coordinates": 
//     {
//         "latitud": 41.3855424,
//         "longitud": 2.1703253
//     },
//     "full": true,
//     "places": 
//     [
//         {
//             "name": "A1",
//             "status": 1
//         },
//         {
//             "name": "A2",
//             "status": 1
//         },
//         {
//             "name": "A3",
//             "status": 1
//         },
//         {
//             "name": "B1",
//             "status": 1
//         },
//         {
//             "name": "B2",
//             "status": 1
//         },
//         {
//             "name": "B3",
//             "status": 1
//         }
//     ]
//   },
//   { 
//     "id": 3,
//     "name": "Parking Saba Plaza Urquinaona",
//     "location": "Barcelona, Plaça Urquinaona", 
//     "coordinates": 
//     {
//         "latitud": 41.3894761,
//         "longitud": 2.1737286
//     },
//     "full": false,
//     "places": 
//     [
//         {
//             "name": "A1",
//             "status": 1
//         },
//         {
//             "name": "A2",
//             "status": 0
//         },
//         {
//             "name": "A3",
//             "status": 1
//         },
//         {
//             "name": "B1",
//             "status": 1
//         },
//         {
//             "name": "B2",
//             "status": 0
//         },
//         {
//             "name": "B3",
//             "status": 1
//         }
//     ]
//   }
// ]