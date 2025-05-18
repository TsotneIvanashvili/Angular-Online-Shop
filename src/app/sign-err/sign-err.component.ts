import { Component, OnInit } from '@angular/core';
import { ToolsService } from '../services/tools.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-err',
  imports: [RouterModule],
  templateUrl: './sign-err.component.html',
  styleUrl: './sign-err.component.css'
})
export class SignErrComponent implements OnInit {
  constructor(public tools: ToolsService) {}
  ngOnInit(): void {
    this.tools.isErrSMS.subscribe((info: boolean) => {
      this.isShown = info
    })
  }

  public isShown: boolean = false

  outSide(e:any) {
    if(e.target.className != "errCard") {
      this.tools.isErrSMS.next(false)
      
    }
  }

  closeErr() {
    this.tools.isErrSMS.next(false)
  }

  signIn() {
    this.tools.isErrSMS.next(false)
    this.tools.isSignedIn.next(true)
  }

  register() {
    this.tools.isErrSMS.next(false)
    this.tools.isRegistered.next(true)
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

  }

}
