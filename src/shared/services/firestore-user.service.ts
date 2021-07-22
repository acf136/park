import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { IUser } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FirestoreUserService {

  public myUsers;

  constructor(
    private ngFirestore: AngularFirestore,
  ) { }

  create(user: IUser) {
    return this.ngFirestore.collection('User').add(user);
  }

  async createSync(user: IUser) {
    return this.ngFirestore.collection('User').add(user);
  }

  getUsers() {
    return this.ngFirestore.collection('User').snapshotChanges();
  }

  async getUsersSync(): Promise<IUser[]> {
    return new Promise( (resolve, reject) => {  //make to call with await
         this.ngFirestore.collection('User').snapshotChanges().subscribe(
          (pusers) =>  {  this.myUsers = pusers.map(
                                    (t) => ( { id: t.payload.doc.id,  ...t.payload.doc.data() as IUser } )
                                );
                          resolve( this.myUsers );
                          if ( pusers.length <= 0 ) reject('pusers empty');
                        } ,
          err => { alert('getUsers : subscribe => Error: ' + err); }
        );

    });
  }

  async getUsersByEmail(pemail: string): Promise<IUser[]> {
    const response = await this.getUsersSync();
    if ( response.length > 0 )
      this.myUsers = response.filter( (u) => u.email === pemail ); //discard if not pemail
    return this.myUsers;
  }

  getUser(id) {
    return this.ngFirestore.collection('User').doc(id).valueChanges();
  }


  update(id, puser: IUser) {
    this.ngFirestore.collection('User').doc(id).update(puser).then(
      () => console.log('User with id = '+ id +' updated') ,            //onfulfilled
      () => console.log('User with id = '+ id +' REJECTED to update')   //onrejected
    );
  }

  delete(id: string) {
    this.ngFirestore.doc('User/' + id).delete().then(
       () => console.log('User with id = '+ id +' deleted') ,            //onfulfilled
       () => console.log('User with id = '+ id +' REJECTED to delete')   //onrejected
    );
  }

} // export class FirestoreUserService

