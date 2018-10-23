describe('An infinite sequence', () => {

    const infiniteSequence = function* () {
        let i = 0;
        while(true) {
            yield i++;
        }
    };

    it('can be triggered', () => {
        const iterator = infiniteSequence();
        expect(iterator.next().value).toEqual(0);
        expect(iterator.next().value).toEqual(1);
    });
});