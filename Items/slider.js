//24.12.2020 Начал изучение jquery
if( window.$ == null) {
  var jquery = require("jquery");
  window.$ = window.jQuery = jquery; // notice the definition of global variables here
  require("jquery-ui-dist/jquery-ui.js");
}

export function Slider_CreateModel(minimumValue, maximumValue, Value1 = null, Value2 = null) {
  if( isNaN(minimumValue) ||
      isNaN(maximumValue) ||
      (Value1 != null && isNaN(Value1)) ||
      (Value2 != null && isNaN(Value2)))
    throw new Error("Давай нормальные данные");

  if(minimumValue > maximumValue) {
    var m = minimumValue;
    minimumValue = maximumValue;
    maximumValue = m;
  }
    
  if(Value1 != null && (minimumValue > Value1 || maximumValue < Value1))
    Value1 = minimumValue;

  if(Value2 != null && (minimumValue > Value2 || maximumValue < Value2))
    Value2 = maximumValue;

  if(Value1 == null && Value2 == null)
    Value2 = maximumValue;

  var result = {
    _min: minimumValue,
    _max: maximumValue,
    _val1: Value1,
    _val2: Value2,
    setMinMax: function (minimumValue, maximumValue) { 
      if(isNaN(minimumValue) || isNaN(maximumValue))
        throw new Error("Давай нормальные данные");
      if(minimumValue < maximumValue) {
        this._min = minimumValue;
        this._max = maximumValue;
      } else {
        this._min = maximumValue;
        this._max = minimumValue;
      }
    }
  };

  result.setMinMax(1,2);

  Object.defineProperty(result, "min", {
    get: function() { return _min; },
    set: function(value) {
      if(value)
      _min = value;
    }
  });
  return result;
}

export function Slider_Attach(element) {
  $(element).html("\
    <div class='double_slider__wrapper'>\
      <div class='double_slider__container'>\
        <div class='double_slider__left'></div>\
        <div class='double_slider__middle'></div>\
        <div class='double_slider__right'></div>\
      </div>\
    </div>\
    ").find(".double_slider__left").on("mousedown", function (e) {
      alert($(element).prop("className"));
    });
}

export function Slider(model, step_or_array = null) {
  $(this).each(function () {
    $(this).model = model;
    $(this).step_or_array = step_or_array;
    Slider_Attach($(this));
  });
  return this;
}

$.fn.mySlider = Slider;

$(window).on("load", function () {
  $(".super_slider").mySlider();
});
