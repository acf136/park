import { Injectable } from '@angular/core';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { IParks, IParksWithId } from '../interfaces/interfaces';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class FirestoreParksService {

  public myParks: IParks[] = [] ;
  public initialDate = new Date(1900,1,1);  // establecemos una fecha inicial

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

  updateParksDateLeave(date: Date, id: string){
    this.ngFirestore.collection('Parks').doc(id).update( {dateLeave: date} );
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

  updateParkNewDateLeaveField(id:string, date: Date){
    this.ngFirestore.collection('Parks').doc(id).update({ "dateLeave": date });
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

  /**
   *  Devuelve el aparcamiento del historial (IParks) donde está el usuario aparcado
   *    o el ultimo aparcamiento donde se ha aparcado
   *
   * @param puid : id del usuario
   * @returns  Si no ha aparcado todavía devuelve IParks con IParks.user === ''
   */
  async getPlazaDeUsuario(puid: string): Promise<any> {
    let myAparcamiento: IParks = { idUser: '', idParking: '', coordX : '', coordY : '',
                                   datePark : this.initialDate,  dateLeave : this.initialDate } ;
    let myIdAparcamiento = '';
    // await this.getParksOfUser(puid);  // rellena this.myParks

    let myIParks: IParksWithId[] = [] ; const myValue = puid;
    await this.getCollectionElemsSync('Parks','idUser','==',myValue).then(
      (resultSet) =>  {
        if ( resultSet?.length > 0 )  myIParks = resultSet;
        // myIParks.forEach( e => console.log('myIParks id (idUser,idParking) = '+ e.id+' '+e.idUser+',' + e.idParking) );
      } ,
      (err) => console.log(err)
    );
    // Recorrer IParks (historial de aparcamientos) buscando uno con idUser = puid y datePark !== initialDate y dateLeave == initialDate
    let lastDateLeave = this.initialDate;
    let i = 0 ;
    // Buscar en el historial IParks el dateLeave mayor o el dateLeave inicial(todavía aparcado)
    for ( i = 0 ; i < myIParks.length ; i++) {
      if ( myIParks[i].dateLeave < myIParks[i].datePark ) {  // aparcado, hemos acabado
        myAparcamiento = myIParks[i]; myIdAparcamiento = myIParks[i].id;
        break;
      } else { // cogerlo si es posterior a la ultimo que hemos registrado en lasatDateLeave y seguir
        if ( myIParks[i].dateLeave > lastDateLeave ) {
          lastDateLeave =  myIParks[i].dateLeave;
          myAparcamiento = myIParks[i]; myIdAparcamiento = myIParks[i].id;
        }
      }
    }
    // devolver resultado : myAparcamiento está vacio si no se ha encontrado ninguna IParks en el historial
    return new Promise( (resolve) => resolve( { id: myIdAparcamiento, aparcamiento: myAparcamiento} ) ) ;
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
   * @param pvalue      : p.e 7, can be any type
   * @returns Promise<any>
   */
   async getCollectionElemsSync(pCollectionName: string, pfieldName: string, pcomparison, pvalue: any): Promise<any> {
    let selectedSet: IParksWithId[] ;
    // const query = this.ngFirestore.collection('Parks').ref.where('idUser', '==', pvalue);
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

} // End of FirestoreParksService

