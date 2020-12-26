//24.12.2020 Начал изучение jquery
if( window.$ == null) {
  var jquery = require("jquery");
  window.$ = window.jQuery = jquery; // notice the definition of global variables here
  require("jquery-ui-dist/jquery-ui.js");
}

/* MODEL in MVC*/

//Создание модели + создание событий при изменении модели
export function Slider_CreateModel(minimumValue, maximumValue, Value1 = null, Value2 = null) {
  if( isNaN(minimumValue) ||
      isNaN(maximumValue) ||
      minimumValue > maximumValue ||
      (Value1 != null && isNaN(Value1)) ||
      (Value2 != null && isNaN(Value2)))
    throw new Error("Давай нормальные данные");

  var result = {
    _min: minimumValue,
    _max: maximumValue,
    _val1: null,
    _val2: null,
    setMinMax: function (minimumValue, maximumValue) { 
      if(isNaN(minimumValue) || isNaN(maximumValue) || minimumValue > maximumValue)
        throw new Error("Давай нормальные данные");
      this._min = minimumValue;
      this._max = maximumValue;

      if(this._val1 != null) {
        if(this._val1 < minimumValue)
          this._val1 = minimumValue;
        if(this._val1 > maximumValue)
          this._val1 = maximumValue;
      }

      if(this._val2 != null) {
        if(this._val2 < minimumValue)
          this._val2 = minimumValue;
        if(this._val2 > maximumValue)
          this._val2 = maximumValue;
      }

      $(this).trigger("changed");

      return this;
    }
  };

  Object.defineProperty(result, "Value1", {
    get: function() { return this._val1; },
    set: function(value) {
      if(value == null) {
        this._val1 = null;
        $(this).trigger("changed");
        return;
      }
      if(isNaN(value))
        throw new Error("Цифры давай! Модель требует циферки!");
      if(this._val2 != null && value > this._val2)
        value = this._val2;
      if(value > this._max)
        value = this._max;
      if(value < this._min)
        value = this._min;
      this._val1 = value;
      $(this).trigger("changed");
    }
  });
  Object.defineProperty(result, "Value2", {
    get: function() { return this._val2; },
    set: function(value) {
      if(value == null) {
        this._val2 = null;
        $(this).trigger("changed");
        return;
      }

      if(isNaN(value))
        throw new Error("Цифры давай! Модель требует циферки!");
      if(this._val2 != null && value < this._val1)
        value = this._val1;
      if(value > this._max)
        value = this._max;
      if(value < this._min)
        value = this._min;
      this._val2 = value;
      $(this).trigger("changed");
    }
  });

  result.Value1 = Value1;
  result.Value2 = Value2;

  return result;
}

/* CONTROLLER in MVC */
export function Slider_Controller(element) {
  var dragging = false;
  var StartPointX, StartPointY;

  element = $(element);
  var e = element.find(".double_slider__left");
  e.on("mousedown", function (e) {
    dragging = true;
    StartPointX = e.pageX;
    StartPointY = e.pageY;
  });
  $(window).on("mousemove", function (e) {
    if(!dragging)
      return;
    var DeltaX = StartPointX - e.pageX;
    var DeltaY = StartPointY - e.pageY;
  });
  $(window).on("mouseup", function (e) {
    dragging = false;
  });
}

/* VIEWs in MVC */
export function Slider_Attach(element) {
  element = $(element)
  var model = element.prop("model");

  element.empty();
  var html = "<div class='double_slider__wrapper'>"+
      "<div class='double_slider__container'>" +
        ((model.Value1 != null)?
        "<div class='double_slider__left'></div>" : "") +
        "<div class='double_slider__middle'></div>" +
        ((model.Value2 != null)?
        "<div class='double_slider__right'></div>": "") +
      "</div></div>";
  element.html(html);
  Slider_Controller(element);
}

export function Slider(minimumValue, maximumValue, Value1 = null, Value2 = null) {
  if(Value1 == null && Value2 == null)
    Value1 = (minimumValue + maximumValue) / 2;


  var model = Slider_CreateModel(minimumValue, maximumValue, Value1, Value2);
  $(this).each(function () {
    $(this).prop("model", model);
    $(this).prop("config", {
      orientation: 'landscape',
      show_value: '',
    });
    Slider_Attach($(this));
  });
  return this;
}

$.fn.mySlider = Slider;

