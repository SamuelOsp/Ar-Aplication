import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isLogin = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() { }

  async submit() {
    const loading = await this.loadingController.create();
    await loading.present();

    if (this.loginForm.valid) {
      try {
        if (this.isLogin) {
          await this.authService.login(this.loginForm.value.email, this.loginForm.value.password);
        } else {
          await this.authService.register(this.loginForm.value.email, this.loginForm.value.password);
        }
        await loading.dismiss();
        this.router.navigate(['/home'], { replaceUrl: true });
      } catch (error: any) {
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: this.isLogin ? 'Login Failed' : 'Registration Failed',
          message: error.message,
          buttons: ['OK'],
        });
        await alert.present();
      }
    } else {
      await loading.dismiss();
    }
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
  }
}
