import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { LabelsPageComponent } from './labels-page.component';

describe('LabelsPageComponent', () => {
  let fixture: ComponentFixture<LabelsPageComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LabelsPageComponent, TranslateModule.forRoot()],
      providers: [provideRouter([]), MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(LabelsPageComponent);
    fixture.detectChanges();
  });

  it('renders the page title and the seed labels in the table', () => {
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('.page__title')).not.toBeNull();
    expect(html.querySelectorAll('.table__row').length).toBeGreaterThan(0);
  });

  it('shows the empty state when there are no labels', () => {
    localStorage.setItem('smartcontact_labels', JSON.stringify([]));
    localStorage.setItem('smartcontact_labels_v', '1');
    const refreshed = TestBed.createComponent(LabelsPageComponent);
    refreshed.detectChanges();
    expect(refreshed.nativeElement.querySelector('.empty')).not.toBeNull();
  });
});
