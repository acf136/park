import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { IUser } from '../interfaces/interfaces';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class UserService {

    constructor(private httpClient: HttpClient,
        private ngFirestore: AngularFirestore,
        private authService: AuthenticationService) {
    }

    /**
     *
     * GETS THE LIST OF USERS IN THE REST API
     *
     * @returns
     */
    public getUsers(){
        return this.httpClient.get('https://crudcrud.com/api/5c46e42c83eb485c896c19622ebbe13d/users');
    }

    //returns the IUser object depending on the id number received as parameter
    // public getUsuariosById(id: number): IUser {
    //     return this.llistaUsuaris.filter(usuari => usuari.id === + id)[0];
    // }

    /**
     *
     * SETS A USER TO THE REST API
     *
     * @param user
     * @returns
     */

     setUser(user: IUser, uid: string) {
        return this.ngFirestore.collection('User').doc(uid).set(user);
      }
}
