import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameHelpComponent } from './shared/game-help/game-help.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameHelpComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly title = 'Mesa';
}
