import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { INotifDisponibilidad, INotifDisponibilidadWithId } from '../interfaces/interfaces';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class FirestoreNotifDisponibilidadService {

  public myNotifDisponibilidades: INotifDisponibilidad[] = [];

  constructor(
    private ngFirestore: AngularFirestore,
  ) { }

  async create(notifDisponibilidad: INotifDisponibilidad) {
    return this.ngFirestore.collection('NotifDisponibilidad').add(notifDisponibilidad);
  }

  getNotifDisponibilidad(id) {
    return this.ngFirestore.collection('NotifDisponibilidad').doc(id).valueChanges();
  }

  async getnotifDisponibilidadSync(id) {
    return this.ngFirestore.collection('NotifDisponibilidad').doc(id).valueChanges();
  }

  // leer todas las notificaciones de disponibilidad de todos los usuarios
  async getNotifDisponibilidades(): Promise<INotifDisponibilidad[]> {
    return new Promise( (resolve, reject) => {  //make to call with await
         this.ngFirestore.collection('NotifDisponibilidad').snapshotChanges().subscribe(
          (pnotifDisponibilidades) =>  {  this.myNotifDisponibilidades = pnotifDisponibilidades.map(
                                    (t) => ( { id: t.payload.doc.id,  ...t.payload.doc.data() as INotifDisponibilidad } )
                                );
                                resolve( this.myNotifDisponibilidades );
                                if ( pnotifDisponibilidades.length <= 0 ) reject('pnotifDisponibilidades empty');
                              },
          err => { alert('getNotifDisponibilidades : subscribe => Error: ' + err); }       //2nd subscribe param
          // () => console.log('NotifDisponibilidades = ', this.myNotifDisponibilidades)   //3rd subscribe param
        );

    });
  }

  // Devuelve las notificaciones de disponibilidad del user (ATENCION: INICIALMENTE SOLO ES UNA)
  async getNotifDisponibilidadOfUser(idUser: string): Promise<INotifDisponibilidad[]> {   //: Promise<INotifDisponibilidad[]>
    const response = await this.getNotifDisponibilidades();
    if ( response.length > 0 )
      this.myNotifDisponibilidades = response.filter( (nd) => nd.idUser === idUser ); //discard if not idUser
    return this.myNotifDisponibilidades;
  }

  updateNotifNewDateParkField(pid:string, pdate: Date){
    this.ngFirestore.collection('NotifDisponibilidad').doc(pid).update({ "datePark": pdate }).then(
      (resolve) => console.log('updateNotifNewDateParkField  id= '+pid+ 'updated'),
      (reject) => console.log('updateNotifNewDateParkField err = '+reject)
    );
  }

  updateNotifNewDateLeaveField(pid:string, pdate: Date){
    this.ngFirestore.collection('NotifDisponibilidad').doc(pid).update({ "dateLeave": pdate }).then(
      (resolve) => console.log('updateNotifNewDateLeaveField  id= '+pid+ ' updated'),
      (reject) => console.log('updateNotifNewDateLeaveField err = '+reject)
    );
  }

  updateNotifField(pCollectionName: string, pfieldName: string, id: string,  value: any){
    // this.ngFirestore.collection('NotifDisponibilidad').doc(id).update({ "dateLeave": value });
    let varFieldName = '"'+pfieldName+'"';
    this.ngFirestore.collection(pCollectionName).doc(id).update( { varFieldName : value } ).then(
      resolve => console.log('updateNotifField: resolve='+resolve),
      err => console.log('updateNotifField: err='+err)
    );

  }


  update(id, pNotifDisponibilidad: INotifDisponibilidad) {
    this.ngFirestore.collection('NotifDisponibilidad').doc(id).update(pNotifDisponibilidad).then(
      () => console.log('NotifDisponibilidad with id = '+ id +' updated') ,            //onfulfilled
      () => console.log('NotifDisponibilidad with id = '+ id +' REJECTED to update')   //onrejected
    );
  }

  delete(id: string) {
    this.ngFirestore.doc('NotifDisponibilidad/' + id).delete().then(
      () => console.log('NotifDisponibilidad with id = '+ id +' deleted') ,            //onfulfilled
      () => console.log('NotifDisponibilidad with id = '+ id +' REJECTED to delete')   //onrejected
    );
  }

    /**
   * Dada un collection en Firestore con nombre pCollectionName
   * y dado un pfieldName de la colección
   * devuelve el set de elementos de Firestore
   * para una query con una condición where,
   *  con una comparison, y un pvalue del mismo tipo que pfieldName
   *
   * @param pCollectionName : Name of the Collection in Firebase, p.e. 'NotifDisponibilidad'
   * @param pfieldName : Name of the field , p.e. 'idParking'
   * @param pcomparison : p.e. '==', is of type WhereFilterOp
   * @param pvalue      : p.e 'FUhMenvk1or7N4wnx6xM', can be any type
   * @returns Promise<any>
   */
     async getCollectionNotifElemsSync(pCollectionName: string, pfieldName: string, pcomparison, pvalue: any): Promise<any> {
      let selectedSet: INotifDisponibilidadWithId[] ;
      // const query = this.ngFirestore.collection('NotifDisponibilidad').ref.where('idParking', '==', pvalue);
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

} // export class FirestoreNotifDisponibilidadService

