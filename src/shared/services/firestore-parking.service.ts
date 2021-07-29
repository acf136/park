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

    /**
   * Dada un collection en Firestore con nombre pCollectionName
   * y dado un pfieldName de la colección
   * devuelve el set de elementos de Firestore
   * para una query con una condición where,
   *  con una comparison, y un pvalue del mismo tipo que pfieldName
   *
   * @param pCollectionName : Name of the Collection in Firebase, p.e. 'Parking'
   * @param pfieldName : Name of the field , p.e. 'idParking'
   * @param pcomparison : p.e. '==', is of type WhereFilterOp
   * @param pvalue      : p.e 'BCz8VwFbWvMbHSTxxM27', can be any type
   * @returns Promise<any>
   */
     async getCollectionParkingSync(pCollectionName: string, pfieldName: string, pcomparison, pvalue: any): Promise<any> {
      let selectedSet: IParking[] ;
      // const query = this.ngFirestore.collection('Parking').ref.where('idParking', '==', pvalue);
      const query = this.ngFirestore.collection(pCollectionName).ref.where(pfieldName, pcomparison, pvalue);
      await query.get().then(
        (querySnapshot) => {
          if ( !querySnapshot.empty && querySnapshot.size > 0 )
             selectedSet = querySnapshot.docs.map( (t) => ( { id: t.id,  ...t.data() as any } ) );
        }
      );
      // return this.ngFirestore.collection('Parking').doc(id).ref.id;
      return  new Promise( (resolve, reject) => {  //make to call with await
         resolve(selectedSet);
      });
    }


      /**
   * Dada un collection en Firestore con nombre pCollectionName
   * y dado un pfieldName de la colección
   * devuelve el id del último elemento de Firestore
   * para una query con una condición where,
   *  con una comparison, y un pvalue del mismo tipo que pfieldName
   *
   * @param pCollectionName : Name of the Collection in Firebase, p.e. 'Parking'
   * @param pfieldName : Name of the field , p.e. 'idParking'
   * @param pcomparison : p.e. '==', is of type WhereFilterOp
   * @param pvalue      : p.e 7, can be any type
   * @returns Promise<any>
   */
  async getCollectionElemIdSync(pCollectionName: string, pfieldName: string, pcomparison, pvalue: any): Promise<any> {
    let selectedId ;
    // const query = this.ngFirestore.collection('Parking').ref.where('idParking', '==', pidParking);
    const query = this.ngFirestore.collection(pCollectionName).ref.where(pfieldName, pcomparison, pvalue);
    await query.get().then(
      (querySnapshot) => {
        if ( !querySnapshot.empty && querySnapshot.size > 0 )
        {
          querySnapshot.forEach(
            (documentSnapshot) => selectedId = documentSnapshot.id
          );
        }
      }
    );
    // return this.ngFirestore.collection('Parking').doc(id).ref.id;
    return  new Promise( (resolve, reject) => {  //make to call with await
       resolve(selectedId);
    });
  }

} // export class FirestoreParkingService

