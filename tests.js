import * as Slider from "./Items/slider.js";

var assert = chai.assert;

describe("Slider_CreateModel", function() {
  it("Создает модель/данные", function() {
    assert.deepEqual( Slider.Slider_CreateModel(1,2,3), {
      min: 1,
      max: 2,
      def: 3
    }, "Нормалды");
  })
})