import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUser } from '../interfaces/interfaces';

@Injectable()
export class UserService {

    constructor(private httpClient: HttpClient) {
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
    public setUser(user: IUser): Observable<any> {
        return this.httpClient.post<IUser>('https://crudcrud.com/api/5c46e42c83eb485c896c19622ebbe13d/users', user);
    }
}
