import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { IParking } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FirestoreParkingService {

  constructor(
    private ngFirestore: AngularFirestore,
    private router: Router
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

  update(id, parking: IParking) {
    this.ngFirestore.collection('Parking').doc(id).update(parking)
      .then(() => {
        this.router.navigate(['/list-map/List']);  //TODO : Revisar routing
      }).catch(error => console.log(error));;
  }

  delete(id: string) {
    this.ngFirestore.doc('Parking/' + id).delete().then(
       () => console.log('Parking with id = '+ id +' deleted') ,            //onfulfilled
       () => console.log('Parking with id = '+ id +' REJECTED to delete')   //onrejected
    );
  }

} // export class FirestoreParkingService

