import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiAreaService {
  constructor(public http: HttpClient) { }

  signIn(body: any) {
    return this.http.post("https://api.everrest.educata.dev/auth/sign_in", body)
  }

  register(body: any){
    return this.http.post("https://api.everrest.educata.dev/auth/sign_up", body)
  }

  profileInfo() {
    return this.http.get("https://api.everrest.educata.dev/auth")
  }



}