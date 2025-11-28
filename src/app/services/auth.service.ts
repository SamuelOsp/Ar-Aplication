import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth: Auth;
    private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
    public user$: Observable<User | null> = this.userSubject.asObservable();

    constructor() {
        const app = initializeApp(environment.firebase);
        this.auth = getAuth(app);

        onAuthStateChanged(this.auth, (user) => {
            this.userSubject.next(user);
        });
    }

    async login(email: string, password: string) {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    async register(email: string, password: string) {
        return createUserWithEmailAndPassword(this.auth, email, password);
    }

    async logout() {
        return signOut(this.auth);
    }

    getUser() {
        return this.userSubject.value;
    }
}
