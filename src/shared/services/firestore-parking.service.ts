import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { IParking } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FirestoreParkingService {

  constructor(
    private ngFirestore: AngularFirestore,
  ) { }

  create(parking: IParking) {
    return this.ngFirestore.collection('Parking').add(parking);
  }

  getParkings() {
    return this.ngFirestore.collection('Parking').snapshotChanges();
  }

  getParking(id) {
    return this.ngFirestore.collection('Parking').doc(id).valueChanges();
  }

  async getParkingPromise(pid): Promise<any> {
    return new Promise( (resolve, reject) => {  //make to call with await
      this.ngFirestore.collection('Parking').doc(pid).valueChanges().subscribe(
          (pparking) => {
               if ( pparking ) resolve( pparking );
               else  reject('getParkingPromise: pparking empty');
          },
          (err) => alert('Error caught at subscribe on getParkingPromise')   //2nd subscribe param
      );
    });  // new Promise
  }

  update(id, parking: IParking) {
    this.ngFirestore.collection('Parking').doc(id).update(parking).then(
        () => console.log('Parking with id = '+ id +' updated') ,               //onfulfilled
        (err) => console.log('Parking with id = '+ id +' REJECTED to update')   //onrejected
     );
  }

  delete(id: string) {
    this.ngFirestore.doc('Parking/' + id).delete().then(
       () => console.log('Parking with id = '+ id +' deleted') ,            //onfulfilled
       () => console.log('Parking with id = '+ id +' REJECTED to delete')   //onrejected
    );
  }

} // export class FirestoreParkingService

