import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, BrandLogoComponent],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeaderComponent {}
