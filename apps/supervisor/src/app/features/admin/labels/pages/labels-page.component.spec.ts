import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { LabelsPageComponent } from './labels-page.component';

describe('LabelsPageComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LabelsPageComponent, TranslateModule.forRoot()],
      providers: [provideRouter([]), MessageService],
    }).compileComponents();
  });

  it('renders seed labels in the table', () => {
    const fixture = TestBed.createComponent(LabelsPageComponent);
    fixture.detectChanges();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelectorAll('.table__row').length).toBeGreaterThan(0);
  });

  it('shows the empty state when there are no labels', () => {
    localStorage.setItem('sc-labels', JSON.stringify([]));
    localStorage.setItem('sc-labels-v', '1');
    const fixture = TestBed.createComponent(LabelsPageComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('sc-empty-state')).not.toBeNull();
  });
});
