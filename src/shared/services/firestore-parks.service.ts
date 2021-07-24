import { Injectable } from '@angular/core';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { IParks } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FirestoreParksService {

  constructor(public ngFirestore: AngularFirestore) { }

  create(park: IParks) {
    return this.ngFirestore.collection('Parks').add(park);
  }

  //: Observable<IParks[]>
  getParks() {
    return this.ngFirestore.collection<IParks>('Parks').get();
  }

}
