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

function Slider_GetRange(element) {
  var left = element.find(".double_slider__left");
  var right = element.find(".double_slider__right");

  var Range = element.width();// Расчет доступного пространства для перемещения ползунков

  if(left.width() != null)
    Range -= left.width(); // Исключаем ширину самих ползунков если они есть
  if(right.width() != null)
    Range -= right.width();// Исключаем ширину самих ползунков если они есть

  return Range;
}

/* CONTROLLER in MVC */
export function Slider_Controller(element) {
  var dragging = 0;// 0 не таскаем, -1 таскаем левый, 1 таскаем правый
  var StartPointX, StartPointY;
  var OldValue;

  element = $(element);
  var model = element.prop("model");

  var left = element.find(".double_slider__left");
  var right = element.find(".double_slider__right");

  var Range = Slider_GetRange(element);

  left.on("mousedown", function (e) {
    dragging = -1;
    StartPointX = e.pageX;
    StartPointY = e.pageY;
    OldValue = model.Value1;//Фиксируем начальные значения и координаты для перетакивания левого ползунка
  });
  right.on("mousedown", function (e) {
    dragging = 1;
    StartPointX = e.pageX;
    StartPointY = e.pageY;
    OldValue = model.Value2;//Фиксируем начальные значения и координаты для перетакивания правого ползунка
  });
  $(window).on("mousemove", function (e) {
    if(!dragging)
      return;
    var DeltaX = e.pageX - StartPointX;
    //var DeltaY = e.pageY - StartPointY;
    if(dragging < 0) { //Перетаскивание левого
      model.Value1 = OldValue + DeltaX / Range;
    }
    if(dragging > 0) { //Перетаскивание правого
      model.Value2 = OldValue + DeltaX / Range;
    }
  });
  $(window).on("mouseup", function (e) {
    dragging = 0;
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


  //Перемещение ползунков при изменении модели
  $(model).on("changed", function () {
    var left = element.find(".double_slider__left");
    var middle = element.find(".double_slider__middle");

    var Range = Slider_GetRange(element);

    var left_margin = Range * model.Value1 / model.Range;

    var right_margin = model.Value2;
    if(model.Value1 != null)
      right_margin -= model.Value1;

    right_margin *= Range / model.Range;

    left.css("margin-left", left_margin + "px");
    middle.css("width", right_margin + "px");
//    left.animate({"margin-left": left_margin}, { duration: 'fast', queue: false });
//    middle.animate({"width": right_margin}, { duration: 'fast', queue: false });
  })

  Slider_Controller(element);
}

export function Slider(model) {
  if(model == null)
    model = Slider_CreateModel(0, 1, 0, 1);

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
$.fn.mySliderModel = Slider_CreateModel;

