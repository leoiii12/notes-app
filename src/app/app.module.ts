import { ColorTwitterModule } from 'ngx-color/twitter'

import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RouteReuseStrategy } from '@angular/router'
import { SplashScreen } from '@ionic-native/splash-screen/ngx'
import { StatusBar } from '@ionic-native/status-bar/ngx'
import { IonicModule, IonicRouteStrategy } from '@ionic/angular'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { ColorPalettePopoverComponent } from './color-palette-popover/color-palette-popover.component'

@NgModule({
  declarations: [AppComponent, ColorPalettePopoverComponent],
  entryComponents: [ColorPalettePopoverComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, ColorTwitterModule],
  providers: [StatusBar, SplashScreen, { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
