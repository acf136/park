import { Injectable } from '@angular/core';
import { PlaceSize, PlaceCapacity,  IParking } from '../interfaces/interfaces';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ParkingService {
  idParkingLast  = 10 ;
  // VERSION Using HttpClient returnig Observable<IParking[]>
  // private parkingsUrl = 'api/parkingArray/';  // URL to web api
  private parkingsUrl = 'http://demo4351748.mockable.io/parkingArray';  // URL to web api

  constructor( private http: HttpClient ) {}

  /** GET users from the server
   *
   */
  getParkings(): Observable<IParking[]> {
    return this.http.get<IParking[]>(this.parkingsUrl).pipe(
      retry(2),
      catchError( (error: HttpErrorResponse) => {
          console.error(error);
          return throwError(error);
      } )
    );
  }
  // CUD: operations
  createParking(pname: string): Observable<IParking> {
    this.idParkingLast++ ; // Should be retrieved from DB every creation
    const idParkingNew = this.idParkingLast + 1 ; //TODO : calculate new id
    const parking = { idParking: idParkingNew , name: pname , address: 'Gran Via,26',
                      zipCode: '08001', lat: '46.0999888', long: '46.0999888' ,
                      capacity: [ { size: PlaceSize.small , numOfPlaces: 10 },
                                  { size: PlaceSize.doble , numOfPlaces: 5 }
                                ],
                      places: [
                        { coordX: '1', coordY: '1', size: PlaceSize.small, occupied: true,  outOfService: false}
                      ]
                    } ;
    return this.http.post<IParking>(this.parkingsUrl, parking);
  }

  updateParking(pid: number, pparking: IParking): Observable<any> {
    return this.http.put(this.parkingsUrl + pid, pparking);
  }

  deleteParking(pid: number): Observable<any> {
    return this.http.delete(this.parkingsUrl + pid);
  }

  // public getParkings(){
  //   return this.httpClient.get('http://demo4787583.mockable.io/parkings');
  // }
}
