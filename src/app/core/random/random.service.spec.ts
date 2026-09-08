import { RandomService } from './random.service';

describe('RandomService', () => {
  it('evita repetição imediata quando há outra opção', () => {
    const service = new RandomService();
    spyOn(Math, 'random').and.returnValue(0);

    expect(service.pick(['anterior', 'nova'], 'anterior')).toBe('nova');
  });
});
