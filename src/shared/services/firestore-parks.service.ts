import { Injectable } from '@angular/core';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { IParks } from '../interfaces/interfaces';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class FirestoreParksService {

  public myParks;

  constructor(public ngFirestore: AngularFirestore) { }

  create(park: IParks) {
    return this.ngFirestore.collection('Parks').add(park);
  }

  getParks() {
    return this.ngFirestore.collection<IParks>('Parks').get();
  }

  async getParksOfUser(idUser: string): Promise<IParks[]> {   //: Promise<IUserParking[]>
    const response = await this.getParksSnapshot();
    if ( response.length > 0 )
      this.myParks = response.filter( (up) => up.idUser === idUser ); //discard if not idUser
    return this.myParks;
  }

  async getParksSnapshot(): Promise<IParks[]> {
    return new Promise( (resolve, reject) => {  //make to call with await
         this.ngFirestore.collection('Parks').snapshotChanges().subscribe(
          (pParks) =>  {  this.myParks = pParks.map(
                                    (t) => ( { id: t.payload.doc.id,  ...t.payload.doc.data() as IParks } )
                                );
                                resolve( this.myParks );
                                if ( pParks.length <= 0 ) reject('pParks empty');
                              },
          err => { alert('getParksSnapshot : subscribe => Error: ' + err); }       //2nd subscribe param
          // () => console.log('UserParkings = ', this.myUserParkings)                                   //3rd subscribe param
        );

    });
  }

  updateParkAddDateLeaveField(date: Date, id: string){
    this.ngFirestore.collection('Parks').doc(id).update({dateLeave: date});
    //   this.ngFirestore.collection('Parks').doc(id).update(park).then(
    //     () => console.log('park with id = '+ id +' updated') ,               //onfulfilled
    //     (err) => console.log('Parking with id = '+ id +' REJECTED to update')   //onrejected
    //  );
  }

  updateParkRemoveDateLeaveField(id: string){
    //dateLeave: firebase.default.firestore.FieldValue.delete();
    this.ngFirestore.collection('Parks').doc(id).update({ ["dateLeave"]: firebase.default.firestore.FieldValue.delete() });
  }

  updateParkNewDateParkField(id:string, date: Date){
    this.ngFirestore.collection('Parks').doc(id).update({ "datePark": date });
  }

  async getParksPromise(): Promise<any> {
    return new Promise( (resolve, reject) => {  //make to call with await
      this.ngFirestore.collection('Parks').valueChanges().subscribe(
          (ppark) => {
               if ( ppark ) resolve( ppark );
               else  reject('getParkingPromise: pparking empty');
          },
          (err) => alert('Error caught at subscribe on getParkingPromise')   //2nd subscribe param
      );
    });  // new Promise
  }

}
