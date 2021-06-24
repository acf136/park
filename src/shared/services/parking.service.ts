import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
// TODO: Implement this service with a in-memoryDB
export class ParkingService {

  constructor(private httpClient: HttpClient) { 

  }

  public getParkings(){
    return this.httpClient.get('http://demo4787583.mockable.io/parkings');
}
}
