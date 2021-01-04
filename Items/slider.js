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

  if(Value1 == null && Value2 == null)
    Value1 = (minimumValue + maximumValue) / 2;
    
  var result = {
    _min: minimumValue,
    _max: maximumValue,
    _val1: null,
    _val2: null,
    salt: Math.random(),
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
  Object.defineProperty(result, "Range", {
    get: function() { return this._max - this._min; },
  });

  result.Value1 = Value1;
  result.Value2 = Value2;

  return Object.create(result);
}

export function Slider_GetRange(element, vertical) {
  var left = element.find(".double_slider__left");
  var right = element.find(".double_slider__right");

  if(vertical) {
    var Range = element.height();// Расчет доступного пространства для перемещения ползунков

    if(left.height() != null)
      Range -= left.height(); // Исключаем высоту самих ползунков если они есть
    if(right.height() != null)
      Range -= right.height();// Исключаем высоту самих ползунков если они есть

    return Range;
  } else {
    var Range = element.width();// Расчет доступного пространства для перемещения ползунков

    if(left.width() != null)
      Range -= left.width(); // Исключаем ширину самих ползунков если они есть
    if(right.width() != null)
      Range -= right.width();// Исключаем ширину самих ползунков если они есть

    return Range;
  }
}

/* CONTROLLER in MVC */
export function Slider_Controller(element, vertical = false) {
  var dragging = 0;// 0 не таскаем, -1 таскаем левый, 1 таскаем правый
  var StartPointX, StartPointY;
  var OldValue;

  element = $(element);
  var model = element.prop("model");

  var left = element.find(".double_slider__left");
  var right = element.find(".double_slider__right");

  left.on("touchstart mousedown", function (e) {

    dragging = -1;
    if (e.type == "touchstart") {
      if(e.originalEvent.touches.length > 1)
        return;
      var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      StartPointX = touch.pageX;
      StartPointY = touch.pageY;
    } else {
      StartPointX = e.pageX;
      StartPointY = e.pageY;
    }
    OldValue = model.Value1;//Фиксируем начальные значения и координаты для перетакивания левого ползунка
    e.stopPropagation();
    e.preventDefault();
  });
  right.on("touchstart mousedown", function (e) {
    dragging = 1;
    if (e.type == "touchstart") {
      if(e.originalEvent.touches.length > 1)
        return;
      var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      StartPointX = touch.pageX;
      StartPointY = touch.pageY;
    } else {
      StartPointX = e.pageX;
      StartPointY = e.pageY;
    }
    OldValue = model.Value2;//Фиксируем начальные значения и координаты для перетакивания правого ползунка
    e.stopPropagation();
    e.preventDefault();
  });
  $(window).on("touchmove mousemove", function (e) {
    if(!dragging)
      return;
    var DeltaX, DeltaY;
    if (e.type == "touchmove") {
      var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      DeltaX = touch.pageX - StartPointX;
      DeltaY = touch.pageY - StartPointY;
    } else {
      DeltaX = e.pageX - StartPointX;
      DeltaY = e.pageY - StartPointY;
    }
    var Range = Slider_GetRange(element, vertical);
    if(dragging < 0) { //Перетаскивание левого
      model.Value1 = OldValue + ((vertical)?DeltaY:DeltaX) / Range;
    }
    if(dragging > 0) { //Перетаскивание правого
      model.Value2 = OldValue + ((vertical)?DeltaY:DeltaX) / Range;
    }
    e.stopPropagation();
    e.preventDefault();
  });
  $(window).on("touchend touchcancel mouseup", function (e) {
    dragging = 0;
  });
}

/* VIEWs in MVC */
export function Slider_Vertical(model, vertical = true) {
  if(model == null)
    model = Slider_CreateModel(0, 1, 0, 1);

  $(this).each(function () {
    var element = $(this);
    element.prop("model", model);
    element.prop("config", {
      orientation: 'landscape',
      show_value: '',
    });


    element.empty();
    var orientation = ((vertical)?"vertical":"horizontal");
    var html = 
      `<div class='double_slider__wrapper'>\
        <div class='double_slider__container double_slider__container_${orientation}'>\
        <div class='double_slider__spacer_left'></div>\
        ${(model.Value1 != null) ?
          "<div class='double_slider__left'></div>" : ""}\
        <div class='double_slider__spacer_middle double_slider__spacer_middle_${orientation}'></div>\
        ${(model.Value2 != null) ?
          "<div class='double_slider__right'></div>" : ""}\
        <div class='double_slider__spacer_right'></div></div></div>`;
    element.html(html);

    //Перемещение ползунков при изменении модели
    var changed = function () {
      var left = element.find(".double_slider__spacer_left");
      var middle = element.find(".double_slider__spacer_middle");
      var right = element.find(".double_slider__spacer_right");

      if(model.Value1 == null && model.Value2 != null) {
        left.css("flex-grow", null);
        left.css("flex-shrink", null);
        middle.css("flex-grow", model.Value2);
        middle.css("flex-shrink", model.Value2);
        right.css("flex-grow", model.Range - model.Value2);
        right.css("flex-shrink", model.Range - model.Value2);
      }
      if(model.Value1 != null && model.Value2 != null) {
        left.css("flex-grow", model.Value1);
        left.css("flex-shrink", model.Value1);
        middle.css("flex-grow", model.Value2 - model.Value1);
        middle.css("flex-shrink", model.Value2 - model.Value1);
        right.css("flex-grow", model.Range - model.Value2);
        right.css("flex-shrink", model.Range - model.Value2);
      }
      if(model.Value1 != null && model.Value2 == null) {
        left.css("flex-grow", model.Value1);
        left.css("flex-shrink", model.Value1);
        middle.css("flex-grow", model.Range - model.Value1);
        middle.css("flex-shrink", model.Range - model.Value1);
        right.css("flex-grow", null);
        right.css("flex-shrink", null);
      }
  //    left.animate({"margin-left": left_margin}, { duration: 'fast', queue: false });
  //    middle.animate({"width": right_margin}, { duration: 'fast', queue: false });
    }
    $(model).on("changed", changed);
    changed();
    
    Slider_Controller(element, vertical);
  });
  return this;
}

$.fn.mySlider = Slider_Vertical;
$.fn.mySliderModel = Slider_CreateModel;

