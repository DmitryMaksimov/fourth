var Slider = require("./Items/slider.js");

var assert = chai.assert;

describe("Slider_Model", function() {
    describe("Slider_CreateModel(1, 3, 4)", function() {
      var model = Slider.Slider_CreateModel(1,3,4);
      it("val1 3", function() {
        assert.equal( model.Value1, 3);
      })
      it("val2 null", function() {
        assert.equal( model.Value2, null);
      })
    });

    describe("CreateModel(1,3,4,5).SetMinMax(2, 2)", function() {
      var model = Slider.Slider_CreateModel(1,3,4,5);
      model.setMinMax(2, 2);
      it("val1 2", function() {
        assert.equal( model.Value1, 2);
      })
      it("val2 2", function() {
        assert.equal( model.Value2, 2);
      })
    })
    describe("CreateModel(1,3,4,5).SetMinMax(2, 2) trigger test", function() {
      var good = false;
      var model = Slider.Slider_CreateModel(1,3,4,5);
      $(model).on("changed", function () {good = true;});
      model.setMinMax(2, 2);
      
      it("changed", function() {
        assert.equal( good, true);
      })
    })
    describe("CreateModel(1,3,4,5).Value1=2 trigger test", function() {
      var good = false;
      var model = Slider.Slider_CreateModel(1,3,4,5);
      $(model).on("changed", function () {good = true;});
      model.Value1 = 2;
      
      it("changed", function() {
        assert.equal( good, true);
      });
      it("changed and Value1 is set to 2", function() {
        assert.equal( model.Value1, 2);
      });
    })
  })