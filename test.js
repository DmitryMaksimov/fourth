var Slider = require("./Items/slider.js");
var assert = chai.assert;

$ = require("jquery");


describe("Slider_Model", function() {
    describe("Slider_CreateModel(1, 3, 4)", function() {
      var model = $.fn.dmx_Slider('new_model', 1, 3, 4);
      it("val1 3", function() {
        assert.equal( model.Value1, 3);
      })
      it("val2 null", function() {
        assert.equal( model.Value2, null);
      })
      it("range = 2", function() {
        assert.equal( model.Range, 2);
      })
    });

    describe("CreateModel(1,3,4,5).SetMinMax(2, 2)", function() {
      var model = $.fn.dmx_Slider('new_model',1,3,4,5);
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
      var model = $.fn.dmx_Slider('new_model', 1,3,4,5);
      $(model).on("changed", function () {good = true;});
      model.setMinMax(2, 2);
      
      it("changed", function() {
        assert.equal( good, true);
      })
    })
    describe("CreateModel(1,3,4,5).Value1=2 trigger test", function() {
      var good = false;
      var model = $.fn.dmx_Slider('new_model',1,3,4,5);
      $(model).on("changed", function () {good = true;});
      model.Value1 = 2;
      
      it("changed", function() {
        assert.equal( good, true);
      });
      it("changed and Value1 is set to 2", function() {
        assert.equal( model.Value1, 2);
      });
    })


    describe("plugin tests", function() {
      var div = $('<div></div>').dmx_Slider('set_new_model',1,3,4,5);
      it("set_new_model and model have data object", function() {
        var data = div.data("dmx_Slider");
        assert(data.model);
      });
      it("get_model returns object.length == 1", function() {
        assert(div.dmx_Slider("get_model").length == 1);
      });
      it("value == 3", function() {
        assert.equal(div.dmx_Slider("value"), 3);
      });
      it("value1 == 3", function() {
        assert.equal(div.dmx_Slider("value1"), 3);
      });
      it("value2 == 3", function() {
        assert.equal(div.dmx_Slider("value2"), 3);
      });
      it("min == 1", function() {
        assert.equal(div.dmx_Slider("min"), 1);
      });
      it("max == 3", function() {
        assert.equal(div.dmx_Slider("max"), 3);
      });
      it("minimum == 1", function() {
        assert.equal(div.dmx_Slider("minimum"), 1);
      });
      it("maximum == 3", function() {
        assert.equal(div.dmx_Slider("maximum"), 3);
      });
    })
})


