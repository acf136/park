import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { IUser } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FirestoreUserService {

  constructor(
    private ngFirestore: AngularFirestore,
  ) { }

  create(user: IUser) {
    return this.ngFirestore.collection('User').add(user);
  }

  async setUser(user: IUser, puid: string): Promise<void> {
    return this.ngFirestore.collection('User').doc(puid).set(user);
  }

  getUsers() {
    return this.ngFirestore.collection('User').snapshotChanges();
  }

  async getUserSync(id) {
    return this.ngFirestore.collection('User').doc(id).valueChanges();
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

