const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

const LightManager = require('../src/js/map/light_manager');

describe('Light Manager', function () {
    this.light_manager = null;

    beforeEach(function () {
        this.light_manager = new LightManager({}, {});
    });

    it('tests constructor values', function () {
        expect(this.light_manager.lights_added).to.equal(0);
        const lights_length = Object.keys(this.light_manager.lights).length;
        expect(lights_length).to.equal(0);
    });

    // it
});
