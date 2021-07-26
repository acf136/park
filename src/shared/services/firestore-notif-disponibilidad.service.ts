import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { INotifDisponibilidad } from '../interfaces/interfaces';

const firebase = require('firebase');
// Required for side-effects
require('firebase/firestore');
var db = firebase.firestore();

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
          // () => console.log('NotifDisponibilidades = ', this.myNotifDisponibilidades)                                   //3rd subscribe param
        );

    });
  }

  // Devuelve las notificaciones de disponibilidad del user (ATENCION: INICIALMENTE SOLO ES UNA)
  async getNotifDisponibilidadOfUser(idUser: string): Promise<INotifDisponibilidad[]> {   //: Promise<INotifDisponibilidad[]>
    const response = await this.getNotifDisponibilidades();
    if ( response.length > 0 )
      this.myNotifDisponibilidades = response.filter( (up) => up.idUser === idUser ); //discard if not idUser
    return this.myNotifDisponibilidades;
  }

  // Devuelve las notificaciones de disponibilidad del user (ATENCION: INICIALMENTE SOLO ES UNA)
  async getNotifDisponibilidadWhereUser(pidUser: string): Promise<INotifDisponibilidad[]> {   //: Promise<INotifDisponibilidad[]>

    db.collection('NotifDisponibilidad').where('idUser','==',pidUser).get().then(
      (querySnapshot) => {
        this.myNotifDisponibilidades = querySnapshot.docs.map(  (doc) => ( { id: doc.id,   ...doc.data() } ) );
        console.log("Users with idUser =  ", pidUser);
      }
    );
    return new Promise ( (resolve, reject) => {  //make to call with await
      if ( this.myNotifDisponibilidades.length > 0 ) resolve ( this.myNotifDisponibilidades ) ;
      else                                           reject('No NotifDisponibilidad with idUser = '+pidUser);
    });

  }

  // Devuelve las notificaciones de disponibilidad del user (ATENCION: INICIALMENTE SOLO ES UNA)
  async nggetNotifDisponibilidadWhereUser(pidUser: string): Promise<INotifDisponibilidad[]> {   //: Promise<INotifDisponibilidad[]>
    const query = this.ngFirestore.collection('NotifDisponibilidad').ref.where('uid', '==', pidUser);
    query.get().then(querySnapshot => {
      if (querySnapshot.empty) {
          console.log('no data found');
      } else if (querySnapshot.size > 1) {
          console.log('no unique data');
      } else {
          querySnapshot.forEach(documentSnapshot => {
              this.selectedUser$ = this.afs.doc(documentSnapshot.ref);
              // this.afs.doc(documentSnapshot.ref).valueChanges().subscribe(console.log);
              });
          }
      });
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

} // export class FirestoreNotifDisponibilidadService

