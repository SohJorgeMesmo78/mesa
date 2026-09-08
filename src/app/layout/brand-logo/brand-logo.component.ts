import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BRAND_LINKS } from '../../core/brand/brand-links';

@Component({
  selector: 'app-brand-logo',
  imports: [RouterLink],
  templateUrl: './brand-logo.component.html',
  styleUrl: './brand-logo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandLogoComponent {
  readonly compact = input(false);
  readonly links = BRAND_LINKS;
}
