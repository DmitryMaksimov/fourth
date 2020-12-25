import * as Slider from "./Items/slider.js";

var assert = chai.assert;

describe("Slider_CreateModel", function() {
  describe("Slider_CreateModel(1, 2, 3)", function() {
    var model = Slider.Slider_CreateModel(1,2,3);
    it("val1 null", function() {
      assert.equal( model._val1, null);
    })
    it("val2 2", function() {
      assert.equal( model._val2, 2);
    })
  })
})