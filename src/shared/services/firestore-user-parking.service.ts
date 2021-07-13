import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { IUserParking } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FirestoreUserParkingService {

  public myUserParkings;

  constructor(
    private ngFirestore: AngularFirestore,
  ) { }

  create(userParking: IUserParking) {
    return this.ngFirestore.collection('UserParking').add(userParking);
  }

  getUserParking(id) {
    return this.ngFirestore.collection('UserParking').doc(id).valueChanges();
  }

  async getUserParkings(): Promise<IUserParking[]> {
    return new Promise( (resolve, reject) => {  //make to call with await
         this.ngFirestore.collection('UserParking').snapshotChanges().subscribe(
          (puserParkings) =>  {  this.myUserParkings = puserParkings.map(
                                    (t) => ( { id: t.payload.doc.id,  ...t.payload.doc.data() as IUserParking } )
                                );
                                resolve( this.myUserParkings );
                                if ( puserParkings.length <= 0 ) reject('puserParkings empty');
                              },
          err => { alert('getUserParkings : subscribe => Error: ' + err); }       //2nd subscribe param
          // () => console.log('UserParkings = ', this.myUserParkings)                                   //3rd subscribe param
        );

    });
  }

  // get all IUserParking into myUserParkings and  discard IUserParking that not match the idUser = id
  async getParkingsOfUser(idUser: string): Promise<IUserParking[]> {   //: Promise<IUserParking[]>
    const response = await this.getUserParkings();
    if ( response.length > 0 )
      this.myUserParkings = response.filter( (up) => up.idUser === idUser ) //discard if not idUser
    return this.myUserParkings;
  }

  update(id, puserParking: IUserParking) {
    this.ngFirestore.collection('User').doc(id).update(puserParking).then(
      () => console.log('UserParking with id = '+ id +' updated') ,            //onfulfilled
      () => console.log('UserParking with id = '+ id +' REJECTED to update')   //onrejected
    );
  }

  delete(id: string) {
    this.ngFirestore.doc('UserParking/' + id).delete().then(
      () => console.log('UserParking with id = '+ id +' deleted') ,            //onfulfilled
      () => console.log('UserParking with id = '+ id +' REJECTED to delete')   //onrejected
    );
  }

} // export class FirestoreUserParkingService

