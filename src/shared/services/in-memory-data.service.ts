import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';

import { PlaceSize, PlaceCapacity,  IParking } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {

  constructor( ) { }

  createDb() {
    return { parkingArray:
      [
        { idParking: 1, name: 'Sta.Madonna', address: 'Gran Via,26', zipCode: '08001', lat: '46.0999888', long: '46.0999888' ,
          capacity: [ { size: PlaceSize.moto , numOfPlaces: 10 },
                      { size: PlaceSize.normal , numOfPlaces: 20 },
                      { size: PlaceSize.doble , numOfPlaces: 5 }
                   ],
          places: [
                    { coordX: '1', coordY: '1', size: PlaceSize.small, occupied: true,  outOfService: false}
                  ]
        },
        { idParking: 2, name: 'Parking Sisa', address: 'Torrent, 34', zipCode: '08001', lat: '36.0999888', long: '16.0999888' ,
          capacity: [ { size: PlaceSize.moto , numOfPlaces: 0 },
                      { size: PlaceSize.small , numOfPlaces: 10 },
                      { size: PlaceSize.doble , numOfPlaces: 5}
                    ],
          places: [
                    { coordX: '1', coordY: '1', size: PlaceSize.small, occupied: true,  outOfService: false}
                  ]
        },
        { idParking: 3, name: 'La Balear', address: 'Diputacio, 126"', zipCode: '08011', lat: '36.0999888', long: '16.0999888' ,
          capacity: [ { size: PlaceSize.small , numOfPlaces: 21 },
                      { size: PlaceSize.normal , numOfPlaces: 11 },
                      { size: PlaceSize.doble , numOfPlaces: 9}
                    ],
            places: [
              { coordX: '1', coordY: '1', size: PlaceSize.small, occupied: true,  outOfService: false}
                    ]
        }
      ]
    };
  }

}
